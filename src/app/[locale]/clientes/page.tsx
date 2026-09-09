import { notFound } from "next/navigation";
import { ClientPortal } from "@/components/portal/client-portal";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export default async function ClientPortalPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;

  if (!isLocale(resolvedParams.locale)) {
    notFound();
  }

  const locale = resolvedParams.locale as Locale;

  return <ClientPortal dictionary={getDictionary(locale)} locale={locale} />;
}
