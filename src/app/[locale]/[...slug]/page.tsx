import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Waves } from "lucide-react";
import { PlaceholderSearchPage } from "@/components/content/placeholder-search-page";
import { MultimediaPage } from "@/components/content/multimedia-page";
import { ChallengePage, TrainingSectionPage } from "@/components/content/rich-content";
import { LegalPage } from "@/components/legal/legal-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sanitizeChallengeForLevel, sanitizeSectionForLevel } from "@/content/access";
import { getChallengeByHref, getNatacionSectionByHref, watermarkSrc } from "@/content/imported-content";
import { getLegalPage } from "@/content/legal";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getServerContentAccessLevel } from "@/lib/content-access";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bestswim.es";

const pageTitles: Record<string, Record<Locale, string>> = {
  "natacion/tecnica": { es: "Técnica y aprendizaje", en: "Technique and learning", pt: "Técnica e aprendizagem" },
  "natacion/bases-entrenamiento": { es: "Bases del entrenamiento", en: "Training foundations", pt: "Bases do treino" },
  "natacion/entrenamiento": { es: "Entrenamiento", en: "Training", pt: "Treino" },
  "natacion/aguas-abiertas-triatlon": { es: "Aguas abiertas y triatlón", en: "Open water and triathlon", pt: "Águas abertas e triatlo" },
  "natacion/oposiciones": { es: "Oposiciones", en: "Public-service swim tests", pt: "Provas públicas" },
  "natacion/multimedia": { es: "Multimedia", en: "Multimedia", pt: "Multimédia" },
  "politica-de-privacidad": { es: "Política de privacidad", en: "Privacy policy", pt: "Política de privacidade" },
  "politica-de-cookies": { es: "Política de cookies", en: "Cookie policy", pt: "Política de cookies" }
};

const searchablePlaceholderSlugs = new Set(["natacion/tecnica"]);

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string[] }> }): Promise<Metadata> {
  const resolvedParams = await params;

  if (!isLocale(resolvedParams.locale)) {
    return {};
  }

  const locale = resolvedParams.locale as Locale;
  const slug = resolvedParams.slug.join("/");
  const legalPage = getLegalPage(slug, locale);

  if (!legalPage) {
    return {};
  }

  return {
    metadataBase: new URL(siteUrl),
    title: `${legalPage.title} | Best Swim`,
    description: legalPage.description,
    alternates: {
      canonical: `${siteUrl}/${locale}/${slug}`,
      languages: {
        es: `/es/${slug}`,
        en: `/en/${slug}`,
        pt: `/pt/${slug}`
      }
    }
  };
}

export default async function ContentPage({ params }: { params: Promise<{ locale: string; slug: string[] }> }) {
  const resolvedParams = await params;

  if (!isLocale(resolvedParams.locale)) {
    notFound();
  }

  const locale = resolvedParams.locale as Locale;
  const dictionary = getDictionary(locale);
  const slug = resolvedParams.slug.join("/");
  const href = `/${slug}`;
  const trainingSection = getNatacionSectionByHref(href, locale);
  const challenge = getChallengeByHref(href, locale);
  const legalPage = getLegalPage(slug, locale);

  if (trainingSection) {
    const accessLevel = await getServerContentAccessLevel();
    return (
      <TrainingSectionPage
        section={sanitizeSectionForLevel(trainingSection, accessLevel)}
        locale={locale}
        watermark={watermarkSrc}
        accessLevel={accessLevel}
      />
    );
  }

  if (challenge) {
    const accessLevel = await getServerContentAccessLevel();
    return (
      <ChallengePage
        challenge={sanitizeChallengeForLevel({ ...challenge, image: undefined }, accessLevel)}
        locale={locale}
        watermark={watermarkSrc}
        accessLevel={accessLevel}
      />
    );
  }

  if (legalPage) {
    return <LegalPage page={legalPage} locale={locale} />;
  }

  if (slug === "natacion/multimedia") {
    const accessLevel = await getServerContentAccessLevel();
    return (
      <MultimediaPage locale={locale} title={pageTitles[slug]?.[locale] || "Multimedia"} accessLevel={accessLevel} />
    );
  }

  const title =
    pageTitles[slug]?.[locale] || (locale === "es" ? "Página en preparación" : locale === "pt" ? "Página em preparação" : "Page in preparation");
  const body =
    locale === "es"
      ? "Estamos preparando este contenido. Vuelve pronto para descubrir las novedades."
      : locale === "pt"
        ? "Estamos a preparar este conteúdo. Volta em breve para descobrir as novidades."
        : "We're preparing this content. Check back soon for updates.";

  if (searchablePlaceholderSlugs.has(slug)) {
    return <PlaceholderSearchPage locale={locale} title={title} body={body} footer={dictionary.footer.tagline} />;
  }

  return (
    <main className="min-h-screen bg-swim-navy px-4 py-10 text-swim-white">
      <div className="mx-auto max-w-3xl">
        <Button variant="secondary" asChild>
          <Link href={`/${locale}`}>
            <ArrowLeft className="h-4 w-4" />
            Best Swim
          </Link>
        </Button>
        <Card className="glass-panel mt-8">
          <CardHeader>
            <Waves className="mb-4 h-8 w-8 text-swim-cyan" />
            <CardTitle className="text-4xl">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-7 text-swim-steel">{body}</p>
            <div className="mt-8 rounded-md border border-white/10 bg-white/[0.07] p-4 text-sm text-swim-steel">
              {dictionary.footer.tagline}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
