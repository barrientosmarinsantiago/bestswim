import type { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/i18n/config";
import { importedChallenges, natacionSections } from "@/content/imported-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bestswim.es";

/**
 * Fecha de la última revisión del contenido.
 *
 * Antes esto era `new Date()`, que le decía a Google que el sitio entero cambia cada vez
 * que se rastrea. Eso no acelera nada: cuando `lastmod` no se corresponde con cambios
 * reales, los buscadores dejan de fiarse del campo y lo ignoran. Se fija en el despliegue
 * y solo se mueve cuando se vuelve a publicar.
 */
const lastModified = process.env.NEXT_PUBLIC_BUILD_DATE
  ? new Date(process.env.NEXT_PUBLIC_BUILD_DATE)
  : new Date();

type Entry = { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] };

/**
 * Solo entra lo indexable. Fuera quedan:
 * - `/clientes`: portal privado tras login, no aporta nada en búsqueda.
 * - legales: compiten con el contenido real y se sirven con noindex.
 * - `/natacion/tecnica` y `/natacion/multimedia`: aún sin contenido publicado.
 */
const entries: Entry[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  ...natacionSections.map((section) => ({
    path: section.href,
    priority: 0.8,
    changeFrequency: "weekly" as const
  })),
  ...importedChallenges.map((challenge) => ({
    path: challenge.href,
    priority: 0.7,
    changeFrequency: "monthly" as const
  }))
];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    entries.map((entry) => ({
      url: `${siteUrl}/${locale}${entry.path}`,
      lastModified,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      // hreflang dentro del sitemap: es la vía que Google recomienda para sitios
      // multiidioma y evita repetir las etiquetas en cada página.
      alternates: {
        languages: Object.fromEntries([
          ...locales.map((code) => [code, `${siteUrl}/${code}${entry.path}`]),
          ["x-default", `${siteUrl}/${defaultLocale}${entry.path}`]
        ])
      }
    }))
  );
}
