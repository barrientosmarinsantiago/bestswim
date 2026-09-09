import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Best-effort idempotency, per Node instance. Stripe delivers events at least once;
// combined with the idempotent upserts below this avoids redundant processing.
// For multi-instance/serverless, persist processed event IDs in Supabase (see task #3).
const PROCESSED_EVENT_TTL_MS = 24 * 60 * 60 * 1000;
const processedEvents = new Map<string, number>();

function alreadyProcessed(eventId: string) {
  const timestamp = processedEvents.get(eventId);

  if (timestamp === undefined) {
    return false;
  }

  if (timestamp + PROCESSED_EVENT_TTL_MS <= Date.now()) {
    processedEvents.delete(eventId);
    return false;
  }

  return true;
}

function markProcessed(eventId: string) {
  const now = Date.now();

  if (processedEvents.size > 5000) {
    for (const [id, timestamp] of processedEvents) {
      if (timestamp + PROCESSED_EVENT_TTL_MS <= now) {
        processedEvents.delete(id);
      }
    }
  }

  processedEvents.set(eventId, now);
}

async function upsertSubscription(subscription: Stripe.Subscription) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase admin client is not configured.");
  }

  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  let userId = subscription.metadata.user_id;

  if (!userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    userId = profile?.id;
  }

  if (!userId) {
    return;
  }

  const item = subscription.items.data[0];

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: item?.price.id,
      status: subscription.status,
      current_period_end: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    },
    { onConflict: "stripe_subscription_id" }
  );
}

/**
 * Concede el Pase Semanal: 7 dias de acceso a partir de un pago unico de 1 EUR.
 *
 * Se escribe en `subscriptions` y no en `profiles.access_tier` porque la entitlement
 * del pase CADUCA, y esta tabla ya lleva la fecha de fin que `getServerContentAccessLevel`
 * comprueba. Marcarlo en el perfil daria acceso indefinido hasta que alguien lo revocara
 * a mano. El estado es `trialing`, que ya cuenta como premium y ademas deja el pase
 * distinguible de una suscripcion de verdad en cualquier informe.
 *
 * La clave es el id de la sesion de checkout: unica por compra, asi que el upsert es
 * idempotente si Stripe reintenta el evento.
 */
async function grantWeeklyPass(session: Stripe.Checkout.Session) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase admin client is not configured.");

  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  let userId = session.metadata?.user_id || session.client_reference_id || undefined;

  if (!userId && customerId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    userId = profile?.id;
  }

  if (!userId || !customerId) return;

  const WEEKLY_PASS_DAYS = 7;
  const endsAt = new Date(Date.now() + WEEKLY_PASS_DAYS * 24 * 60 * 60 * 1000).toISOString();

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: session.id,
      stripe_price_id: null,
      status: "trialing",
      current_period_end: endsAt,
      cancel_at_period_end: true,
      updated_at: new Date().toISOString()
    },
    { onConflict: "stripe_subscription_id" }
  );
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  if (alreadyProcessed(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = getSupabaseAdminClient();

    if (supabase && session.customer && session.metadata?.user_id) {
      await supabase
        .from("profiles")
        .update({
          stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer.id,
          updated_at: new Date().toISOString()
        })
        .eq("id", session.metadata.user_id);
    }

    if (session.mode === "subscription" && session.subscription) {
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription.id;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await upsertSubscription(subscription);
    }

    // El Pase Semanal llega como pago unico: sin este caso el cobro se completaria y el
    // cliente no recibiria acceso ninguno, porque toda la entitlement cuelga de una
    // suscripcion y aqui no existe.
    if (session.mode === "payment" && session.metadata?.plan === "weekly" && session.payment_status === "paid") {
      await grantWeeklyPass(session);
    }
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    await upsertSubscription(event.data.object as Stripe.Subscription);
  }

  if (event.type === "invoice.payment_failed" || event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId =
      typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await upsertSubscription(subscription);
    }
  }

  markProcessed(event.id);

  return NextResponse.json({ received: true });
}
