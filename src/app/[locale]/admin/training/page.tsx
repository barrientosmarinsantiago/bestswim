import { notFound, redirect } from "next/navigation";
import { TrainingAdmin } from "@/components/admin/training-admin";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TrainingAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;

  if (!isLocale(resolvedParams.locale)) {
    notFound();
  }

  const locale = resolvedParams.locale as Locale;
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    redirect(`/${locale}/clientes`);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/clientes`);
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  if (profile?.role !== "admin") {
    notFound();
  }

  return <TrainingAdmin dictionary={getDictionary(locale)} locale={locale} />;
}
