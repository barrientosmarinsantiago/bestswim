import { NextResponse, type NextRequest } from "next/server";
import { isLocale } from "@/i18n/config";
import { getStripe, stripeErrorResponse } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function getSiteUrl(request: NextRequest) {
  return (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, "");
}

async function getPortalBody(request: NextRequest) {
  try {
    return (await request.json()) as { locale?: string };
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

  const body = await getPortalBody(request);
  const locale = isLocale(body.locale) ? body.locale : "es";
  const siteUrl = getSiteUrl(request);

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "Stripe customer not found." }, { status: 404 });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${siteUrl}/${locale}/clientes`
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return stripeErrorResponse(error, "portal");
  }
}
