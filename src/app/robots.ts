import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bestswim.es";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          // Portal privado: todo lo que hay detrás exige sesión, así que rastrearlo solo
          // gasta presupuesto de rastreo para llegar a una pantalla de acceso.
          "/es/clientes",
          "/en/clientes",
          "/pt/clientes",
          "/es/admin/",
          "/en/admin/",
          "/pt/admin/",
          // El plan seleccionado viaja en la query y genera la misma página N veces.
          "/*?access=",
          "/*?checkout="
        ]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
