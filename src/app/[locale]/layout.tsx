import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import "../globals.css";
import { CookieConsent } from "@/components/legal/cookie-consent";
import { isLocale, locales, type Locale } from "@/i18n/config";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bestswim.es";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * Metadata base de todo el sitio.
 *
 * Vive aquí y no en cada página para que ninguna se quede sin `metadataBase`: sin él
 * Next resuelve las URL de Open Graph contra `localhost` en build y las tarjetas al
 * compartir salen apuntando a una máquina que no existe.
 *
 * El `title.template` deja que cada página declare solo su nombre y hereda la marca,
 * que es lo que evita los "Best Swim | Best Swim" al añadir páginas nuevas.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Best Swim | Entrenamiento de natación, retos y membresía",
    template: "%s | Best Swim"
  },
  applicationName: "Best Swim",
  referrer: "origin-when-cross-origin",
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-96.png", type: "image/png", sizes: "96x96" }
    ],
    apple: "/apple-touch-icon.png"
  },
  manifest: "/site.webmanifest",
  // Los códigos los da cada consola al añadir la propiedad. Se leen del entorno para no
  // versionarlos y para poder rotarlos sin tocar código.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined
  },
  // robots.txt solo desaconseja rastrear; esta etiqueta es la que impide indexar una
  // URL que ya se conozca por otra via. Las dos hacen falta para cerrar el preview.
  robots: process.env.NEXT_PUBLIC_NOINDEX === "1" ? { index: false, follow: false } : {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Sin esto Google recorta el fragmento y la vista previa de imagen en resultados.
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1
    }
  }
};

export const viewport: Viewport = {
  themeColor: "#020A18",
  colorScheme: "dark"
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

  const locale = resolvedParams.locale as Locale;

  return (
    <html lang={locale}>
      <body>
        {children}
        <CookieConsent locale={locale} />
      </body>
    </html>
  );
}
