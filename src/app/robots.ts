import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bestswim.es";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/es/admin/", "/en/admin/", "/pt/admin/"]
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
