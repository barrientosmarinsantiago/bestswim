import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import "../globals.css";
import { CookieConsent } from "@/components/legal/cookie-consent";
import { isLocale, locales, type Locale } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.svg"
  }
};

export default function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return <LocaleLayoutInner params={params}>{children}</LocaleLayoutInner>;
}

async function LocaleLayoutInner({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;

  if (!isLocale(resolvedParams.locale)) {
    notFound();
  }

  return (
    <html lang={resolvedParams.locale as Locale}>
      <body>
        {children}
        <CookieConsent locale={resolvedParams.locale as Locale} />
      </body>
    </html>
  );
}
