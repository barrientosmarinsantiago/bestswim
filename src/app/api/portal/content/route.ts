import { NextResponse, type NextRequest } from "next/server";
import { getPortalTrainingDocumentBySourceKey } from "@/content/imported-content";
import { isLocale, type Locale } from "@/i18n/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const sourceKey = request.nextUrl.searchParams.get("sourceKey");
  const localeParam = request.nextUrl.searchParams.get("locale") || undefined;
  const locale: Locale = isLocale(localeParam) ? localeParam : "es";

  if (!sourceKey) {
    return NextResponse.json({ error: "Missing sourceKey." }, { status: 400 });
  }

  // Entitlement is enforced by RLS: the user must be able to read a training session that
  // references this source_key. If they can read the row, they may read its full body.
  const { data: sessions, error } = await supabase
    .from("training_sessions")
    .select("id")
    .eq("source_key", sourceKey)
    .limit(1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const document = getPortalTrainingDocumentBySourceKey(sourceKey, locale);

  return NextResponse.json(
    { document: document ?? null },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
