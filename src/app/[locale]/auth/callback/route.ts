import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const locale = isLocale(resolvedParams.locale) ? resolvedParams.locale : defaultLocale;
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"), locale);
  const redirectOrigin = getRedirectOrigin(requestUrl);
  const supabase = await getSupabaseServerClient();

  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, redirectOrigin));
    }

    const errorUrl = new URL(`/${locale}/clientes`, redirectOrigin);
    errorUrl.searchParams.set("auth_error", error.message);
    return NextResponse.redirect(errorUrl);
  }

  const errorUrl = new URL(`/${locale}/clientes`, redirectOrigin);
  errorUrl.searchParams.set("auth_error", supabase ? "Missing OAuth code." : "Supabase is not configured.");
  return NextResponse.redirect(errorUrl);
}

function sanitizeNextPath(next: string | null, locale: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return `/${locale}/clientes`;
  }

  return next;
}

function getRedirectOrigin(requestUrl: URL) {
  if (requestUrl.hostname === "0.0.0.0" || requestUrl.hostname === "127.0.0.1") {
    requestUrl.hostname = "localhost";
  }

  return requestUrl.origin;
}
