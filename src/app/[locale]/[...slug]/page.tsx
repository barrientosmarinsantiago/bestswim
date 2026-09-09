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
import type { ContentBlock } from "@/content/types";
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

/** Recorta a la longitud que Google suele mostrar sin partir una palabra por la mitad. */
function clamp(text: string, max = 155) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[.,;:]$/, "") + "…";
}

// Sin anotar el tipo de la funcion: TS lo infiere igual, y `no-unused-vars` (la regla
// base, no la de TypeScript) marcaria como no usados los nombres de parametro de la firma.
const sectionBlurb = {
  es: (t: string, s: number, g: number) => `${t}: ${s} sesiones de natación organizadas en ${g} bloques, con volumen, zonas de intensidad y material para cada entrenamiento.`,
  en: (t: string, s: number, g: number) => `${t}: ${s} swim sessions across ${g} blocks, each with volume, intensity zones and the equipment it needs.`,
  pt: (t: string, s: number, g: number) => `${t}: ${s} sessões de natação em ${g} blocos, com volume, zonas de intensidade e material para cada treino.`
} satisfies Record<Locale, (title: string, sessions: number, groups: number) => string>;

const challengeBlurb = {
  es: (t: string, d: string, l: string, s: number) =>
    [`${t}:`, d && `${d} en`, `${s} sesiones`, l && `· nivel ${l.toLowerCase()}`, "· plan de aguas abiertas con ritmos, descansos y progresión."]
      .filter(Boolean)
      .join(" "),
  en: (t: string, d: string, l: string, s: number) =>
    [`${t}:`, d && `${d} over`, `${s} sessions`, l && `· ${l.toLowerCase()} level`, "· open-water plan with paces, rests and progression."]
      .filter(Boolean)
      .join(" "),
  pt: (t: string, d: string, l: string, s: number) =>
    [`${t}:`, d && `${d} em`, `${s} sessões`, l && `· nível ${l.toLowerCase()}`, "· plano de águas abertas com ritmos, descansos e progressão."]
      .filter(Boolean)
      .join(" ")
} satisfies Record<Locale, (title: string, distance: string, level: string, sessions: number) => string>;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string[] }> }): Promise<Metadata> {
  const resolvedParams = await params;

  if (!isLocale(resolvedParams.locale)) {
    return {};
  }

  const locale = resolvedParams.locale as Locale;
  const slug = resolvedParams.slug.join("/");
  const href = `/${slug}`;
  const canonical = `${siteUrl}/${locale}/${slug}`;

  // hreflang recíproco: cada idioma se lista en las tres versiones, con x-default en la
  // original. Google solo lo respeta cuando la referencia es mutua.
  const languages = {
    es: `/es/${slug}`,
    en: `/en/${slug}`,
    pt: `/pt/${slug}`,
    "x-default": `/es/${slug}`
  };

  const base = (title: string, description: string): Metadata => ({
    title,
    description,
    alternates: { canonical, languages },
    openGraph: { title, description, url: canonical, siteName: "Best Swim", type: "article" },
    twitter: { card: "summary_large_image", title, description }
  });

  const challenge = getChallengeByHref(href, locale);
  if (challenge) {
    // La introducción del reto la escribió el entrenador: como descripción vale
    // infinitamente más que cualquier plantilla, así que se usa cuando existe.
    const introText = (challenge.intro?.blocks ?? [])
      .filter((block): block is Extract<ContentBlock, { type: "paragraph" }> => block.type === "paragraph")
      .map((block) => block.text)
      .find((text) => text.trim().length > 60);

    // `distance` y `level` son opcionales en el tipo: un reto sin ellos usa la propia
    // introducción, y si tampoco la hay, el resumen se queda sin esos datos en vez de
    // imprimir "undefined" en la descripción que ve Google.
    const fallback = challengeBlurb[locale](
      challenge.title,
      challenge.distance ?? "",
      challenge.level ?? "",
      challenge.sessions.length
    );

    return base(challenge.title, clamp(introText ?? fallback));
  }

  const section = getNatacionSectionByHref(href, locale);
  if (section) {
    const groups = section.groups?.length ?? 0;
    const sessions = (section.groups ?? []).reduce((total, group) => total + (group.documents?.length ?? 0), 0);
    const title = pageTitles[slug]?.[locale] || section.title;
    // La `description` de la sección viene del importador ("importados desde Word"), que
    // como meta description no dice nada útil: se construye una con los datos reales.
    return base(title, clamp(sectionBlurb[locale](title, sessions, groups)));
  }

  const legalPage = getLegalPage(slug, locale);
  if (legalPage) {
    return {
      title: legalPage.title,
      description: legalPage.description,
      alternates: { canonical, languages },
      // Las legales no aportan nada en búsqueda y compiten con el contenido real.
      robots: { index: false, follow: true }
    };
  }

  const placeholderTitle = pageTitles[slug]?.[locale];
  if (placeholderTitle) {
    // Página anunciada pero aún sin contenido: se sirve, pero no se indexa vacía.
    return { title: placeholderTitle, alternates: { canonical, languages }, robots: { index: false, follow: true } };
  }

  return { robots: { index: false, follow: false } };
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
