import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bestswim.es";

/**
 * Interruptor para entornos que no son el dominio definitivo.
 *
 * El dominio de preview de Hostinger (*.hostingersite.com) es publico: si Google lo
 * rastrea, acaba compitiendo con bestswim.es por el mismo contenido. Con esto el
 * despliegue de pruebas queda cerrado a los buscadores sin tocar codigo.
 */
const noIndex = process.env.NEXT_PUBLIC_NOINDEX === "1";

export default function robots(): MetadataRoute.Robots {
  if (noIndex) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

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
