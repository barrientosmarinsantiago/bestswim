// JSON-LD para Google y Bing.
//
// Es lo que permite que el buscador entienda que Best Swim es una organización con logo,
// idiomas y perfiles sociales, en vez de deducirlo del HTML. Sin `logo` no hay icono en
// el panel de conocimiento, y sin `@id` cada bloque queda suelto en lugar de describir
// la misma entidad.
//
// Todas las URL son absolutas a propósito: Google rechaza las relativas en structured data.

import type { Locale } from "@/i18n/config";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://bestswim.es").replace(/\/$/, "");

const abs = (path: string) => new URL(path, siteUrl).href;

const SAME_AS = [
  process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  process.env.NEXT_PUBLIC_YOUTUBE_URL,
  process.env.NEXT_PUBLIC_FACEBOOK_URL
].filter((url): url is string => Boolean(url));

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": abs("/#organization"),
    name: "Best Swim",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      "@id": abs("/#logo"),
      url: abs("/icon-512.png"),
      contentUrl: abs("/icon-512.png"),
      width: 512,
      height: 512,
      caption: "Best Swim"
    },
    image: { "@id": abs("/#logo") },
    ...(SAME_AS.length ? { sameAs: SAME_AS } : {})
  };
}

export function websiteSchema(locale: Locale, description: string) {
  return {
    "@type": "WebSite",
    "@id": abs("/#website"),
    url: siteUrl,
    name: "Best Swim",
    description,
    inLanguage: locale,
    publisher: { "@id": abs("/#organization") }
  };
}

/**
 * El servicio que se vende, con sus tres opciones de precio.
 *
 * Los importes se leen del entorno para que no puedan quedarse desfasados respecto a
 * Stripe: un precio erróneo en structured data es peor que no ponerlo, porque Google
 * lo muestra en el resultado.
 */
export function serviceSchema(locale: Locale, description: string) {
  const offers = [
    { name: "Pase Semanal", price: process.env.NEXT_PUBLIC_WEEKLY_PRICE_AMOUNT, unit: "P7D" },
    { name: "Premium mensual", price: process.env.NEXT_PUBLIC_MONTHLY_PRICE_AMOUNT, unit: "P1M" },
    { name: "Premium anual", price: process.env.NEXT_PUBLIC_ANNUAL_PRICE_AMOUNT, unit: "P1Y" }
  ]
    .filter((offer) => Boolean(offer.price))
    .map((offer) => ({
      "@type": "Offer",
      name: offer.name,
      price: offer.price,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: abs(`/${locale}#membresia`),
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: offer.price,
        priceCurrency: "EUR",
        billingDuration: offer.unit
      }
    }));

  if (!offers.length) return null;

  return {
    "@type": "Service",
    "@id": abs("/#service"),
    name: "Membresía Best Swim",
    serviceType: "Entrenamiento de natación",
    description,
    provider: { "@id": abs("/#organization") },
    areaServed: "ES",
    availableLanguage: ["es", "en", "pt"],
    offers
  };
}

/** Envuelve los nodos en un @graph: un solo <script> en vez de tres sueltos. */
export function graph(nodes: unknown[]) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes.filter(Boolean) });
}
