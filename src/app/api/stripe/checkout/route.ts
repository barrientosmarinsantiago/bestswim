import { NextResponse, type NextRequest } from "next/server";
import { isLocale, type Locale } from "@/i18n/config";
import { getStripe, stripeErrorResponse } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isRecurringPlan, type BillingPlan } from "@/lib/pricing";

export const runtime = "nodejs";

function getPriceId(plan: BillingPlan) {
  if (plan === "weekly") return process.env.STRIPE_WEEKLY_PRICE_ID;
  if (plan === "annual") return process.env.STRIPE_ANNUAL_PRICE_ID;
  return process.env.STRIPE_MONTHLY_PRICE_ID;
}

function getSiteUrl(request: NextRequest) {
  return (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, "");
}

async function getCheckoutBody(request: NextRequest) {
  try {
    return (await request.json()) as { plan?: BillingPlan; locale?: Locale };
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const supabase = await getSupabaseServerClient();

  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const body = await getCheckoutBody(request);
  const plan: BillingPlan =
    body.plan === "annual" ? "annual" : body.plan === "weekly" ? "weekly" : "monthly";
  const locale = isLocale(body.locale) ? body.locale : "es";
  const priceId = getPriceId(plan);
  const siteUrl = getSiteUrl(request);

  if (!priceId) {
    return NextResponse.json({ error: "Stripe price is not configured." }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id,email")
    .eq("id", user.id)
    .maybeSingle();

  try {
    let stripeCustomerId = profile?.stripe_customer_id as string | null | undefined;
    const email = (profile?.email as string | null | undefined) || user.email || undefined;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          supabase_user_id: user.id
        }
      });
      stripeCustomerId = customer.id;

      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        stripe_customer_id: stripeCustomerId,
        updated_at: new Date().toISOString()
      });
    }

    const recurring = isRecurringPlan(plan);

    const session = await stripe.checkout.sessions.create({
      // El pase semanal se cobra una sola vez: en modo "subscription" Stripe exige un
      // precio recurrente y rechazaria el precio de pago unico con un 400.
      mode: recurring ? "subscription" : "payment",
      customer: stripeCustomerId,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/${locale}/clientes?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/${locale}/clientes?checkout=cancelled`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer_update: {
        address: "auto",
        name: "auto"
      },
      locale,
      metadata: {
        user_id: user.id,
        plan
      },
      ...(recurring
        ? {
            subscription_data: {
              metadata: {
                user_id: user.id,
                plan
              }
            }
          }
        : {
            payment_intent_data: {
              metadata: {
                user_id: user.id,
                plan
              }
            }
          })
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe checkout URL was not created." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return stripeErrorResponse(error, "checkout");
  }
}
