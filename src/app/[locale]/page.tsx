import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPage } from "@/components/landing/landing-page";
import { defaultLocale, isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getPriceLabel } from "@/lib/pricing";
import { graph, organizationSchema, serviceSchema, websiteSchema } from "@/lib/schema";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bestswim.es";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const resolvedParams = await params;

  if (!isLocale(resolvedParams.locale)) {
    return {};
  }

  const dictionary = getDictionary(resolvedParams.locale);
  const canonical = `${siteUrl}/${resolvedParams.locale}`;

  return {
    metadataBase: new URL(siteUrl),
    title: dictionary.meta.title,
    description: dictionary.meta.description,
    alternates: {
      canonical,
      languages: {
        es: "/es",
        en: "/en",
        pt: "/pt",
        "x-default": `/${defaultLocale}`
      }
    },
    openGraph: {
      title: dictionary.meta.title,
      description: dictionary.meta.description,
      url: canonical,
      siteName: "Best Swim",
      locale: resolvedParams.locale === "es" ? "es_ES" : resolvedParams.locale === "pt" ? "pt_PT" : "en_US",
      type: "website",
      images: [
        {
          url: dictionary.images.hero,
          width: 1600,
          height: 900,
          alt: dictionary.meta.ogAlt
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: dictionary.meta.title,
      description: dictionary.meta.description,
      images: [dictionary.images.hero]
    }
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;

  if (!isLocale(resolvedParams.locale)) {
    notFound();
  }

  const locale = resolvedParams.locale as Locale;
  const dictionary = getDictionary(locale);

  const jsonLd = graph([
    organizationSchema(),
    websiteSchema(locale, dictionary.meta.description),
    serviceSchema(locale, dictionary.meta.description)
  ]);

  return (
    <>
      {/* Un solo bloque con @graph: Google prefiere los nodos relacionados por @id
          antes que varios <script> sueltos describiendo la misma entidad. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <LandingPage
        dictionary={dictionary}
        locale={locale}
        priceLabels={{
          weekly: getPriceLabel("weekly", dictionary.pricing.weeklyPass.price),
          monthly: getPriceLabel("monthly", dictionary.pricing.monthlyFallback),
          annual: getPriceLabel("annual", dictionary.pricing.annualFallback)
        }}
      />
    </>
  );
}
