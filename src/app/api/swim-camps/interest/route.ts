import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();

  if (!supabase || !admin) {
    return NextResponse.json({ error: "Interest storage is not configured." }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { locale?: string };
  const name =
    typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name
      : user.email;

  await admin.from("leads").insert({
    name,
    email: user.email,
    goal: "Swim Camp Orellana",
    message: "Cliente logeado ha marcado interés en Swim Camp Orellana desde la landing.",
    locale: body.locale || "es"
  });

  return NextResponse.json({ ok: true });
}
