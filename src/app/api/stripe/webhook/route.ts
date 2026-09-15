import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getInvoiceSubscriptionId } from "@/lib/stripe-webhook";
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
 * Concede el Pase Semanal: 7 dias de acceso LIMITADO por un pago unico de 1 EUR.
 *
 * El euro es un filtro de entrada, no una compra de Premium: el pase da exactamente el
 * mismo nivel que daba el antiguo trial gratuito (`access_tier = 'free'`, tope de
 * unidades de contenido), solo que durante 7 dias y previo pago.
 *
 * Por eso NO se escribe en `subscriptions`: cualquier fila ahi con estado activo o
 * trialing cuenta como Premium tanto en `getServerContentAccessLevel` como en la funcion
 * `has_active_subscription()` de Supabase, y el pase regalaria la plataforma entera.
 * Lo que se mueve es `trial_ends_at`, que es la ventana que ya consulta
 * `has_portal_access()` para dejar entrar al portal.
 *
 * Se extiende desde la fecha mayor entre hoy y el vencimiento vigente, para que comprar
 * dos pases seguidos sume dos semanas en vez de tirar la que quedaba.
 */
const WEEKLY_PASS_DAYS = 7;

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

  if (!userId) return;

  const { data: current } = await supabase
    .from("profiles")
    .select("trial_ends_at")
    .eq("id", userId)
    .maybeSingle();

  const currentEnd = current?.trial_ends_at ? Date.parse(current.trial_ends_at) : 0;
  const from = Number.isFinite(currentEnd) && currentEnd > Date.now() ? currentEnd : Date.now();
  const endsAt = new Date(from + WEEKLY_PASS_DAYS * 24 * 60 * 60 * 1000).toISOString();

  await supabase
    .from("profiles")
    .update({
      trial_ends_at: endsAt,
      ...(customerId ? { stripe_customer_id: customerId } : {}),
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);
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

  // Del evento solo se toma el ID; el objeto se vuelve a pedir con el SDK.
  //
  // El cuerpo de un evento tiene la forma de la version de API del ENDPOINT, que se elige
  // en el panel de Stripe y alli solo se ofrecen las recientes (2026-*). Este codigo y sus
  // tipos son de la version que fija `src/lib/stripe.ts` (2024-06-20), y entre ambas Stripe
  // movio campos que aqui se leen: `current_period_end` paso a los items y
  // `invoice.subscription` a `invoice.parent`. Leidos del evento, llegarian vacios sin dar
  // error. Recuperados por API vuelven siempre con la forma de la version del SDK, asi que
  // el webhook funciona con cualquier version de endpoint. De paso se procesa el estado
  // actual del objeto y no el de un evento que haya llegado desordenado.
  if (event.type === "checkout.session.completed") {
    const session = await stripe.checkout.sessions.retrieve((event.data.object as { id: string }).id);
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
    const subscription = await stripe.subscriptions.retrieve((event.data.object as { id: string }).id);
    await upsertSubscription(subscription);
  }

  if (event.type === "invoice.payment_failed" || event.type === "invoice.paid") {
    const subscriptionId = getInvoiceSubscriptionId(event.data.object);

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await upsertSubscription(subscription);
    }
  }

  markProcessed(event.id);

  return NextResponse.json({ received: true });
}
