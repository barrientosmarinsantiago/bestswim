import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { importedChallenges } from "@/content/imported-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bestswim.es";

const paths = [
  "",
  "/clientes",
  "/natacion/entrenamiento",
  ...importedChallenges.map((challenge) => challenge.href),
  "/politica-de-privacidad",
  "/politica-de-cookies"
];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : 0.7
    }))
  );
}
