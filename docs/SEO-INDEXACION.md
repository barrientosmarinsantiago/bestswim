# Indexación en Google y Bing — bestswim.es

Qué está montado en el código, qué hay que hacer a mano en cada consola y en qué orden.

## Qué genera el sitio

| Recurso | Ruta | Origen |
|---|---|---|
| robots.txt | `/robots.txt` | `src/app/robots.ts` |
| Sitemap con hreflang | `/sitemap.xml` | `src/app/sitemap.ts` — 48 URLs (3 idiomas × 16 páginas) |
| Iconos | `/favicon.ico`, `/icon-96.png`, `/icon-192.png`, `/icon-512.png`, `/apple-touch-icon.png` | `scripts/build-icons.mjs`, en `prebuild` |
| Manifest | `/site.webmanifest` | estático |
| Datos estructurados | JSON-LD en la home | `src/lib/schema.ts` |
| Metadata por página | title, description, canonical, hreflang, OG, Twitter | `generateMetadata` en cada ruta |

**Qué se indexa y qué no.** Entran la home, las 4 secciones de natación y los 11 retos.
Quedan fuera, con `noindex`, las páginas legales y las que aún no tienen contenido
(`/natacion/tecnica`, `/natacion/multimedia`): una página vacía indexada resta calidad al
dominio entero. El portal `/clientes` y `/api/` se excluyen en robots.txt porque solo
consumen presupuesto de rastreo para llegar a una pantalla de acceso.

**Las descripciones no son plantillas.** Los retos usan la introducción que escribió el
entrenador; las secciones, cifras reales (`169 sesiones en 12 bloques`). La `description`
que traía el importador —"Sesiones y recursos importados desde Word"— no se usa en ningún
sitio: como meta description no dice nada y habría salido en los resultados.

## Dónde se configura

El sitio corre como **app Node.js en el plan Business de Hostinger** (Next.js figura como
framework de backend compatible). Las variables se ponen en el panel de la app, no en un
`.env` del repositorio. Ver `docs/DESPLIEGUE-HOSTINGER.md`.

## Variables de entorno necesarias

```env
NEXT_PUBLIC_SITE_URL=https://bestswim.es          # CRÍTICA: sin esto las URL del sitemap
                                                  # y los canonical salen con localhost
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=             # lo da Search Console
NEXT_PUBLIC_BING_SITE_VERIFICATION=               # lo da Bing Webmaster Tools
NEXT_PUBLIC_BUILD_DATE=2026-09-09                 # lastmod del sitemap
NEXT_PUBLIC_WEEKLY_PRICE_AMOUNT=1                 # importes para el JSON-LD
NEXT_PUBLIC_MONTHLY_PRICE_AMOUNT=22
NEXT_PUBLIC_ANNUAL_PRICE_AMOUNT=240
NEXT_PUBLIC_INSTAGRAM_URL=                        # opcionales, alimentan sameAs
NEXT_PUBLIC_YOUTUBE_URL=
INDEXNOW_KEY=                                     # clave hex propia, 8-128 caracteres
```

`NEXT_PUBLIC_SITE_URL` es la que más duele si se olvida: el sitio compila igual, pero
publica un sitemap lleno de `http://localhost:3000` y Google lo descarta entero.

## Google Search Console

1. https://search.google.com/search-console → **Añadir propiedad**.
2. Elegir **Dominio** (`bestswim.es`), no *Prefijo de URL*: cubre www, sin-www, http y
   https de una vez, y evita tener cuatro propiedades midiendo lo mismo por separado.
3. Verificar con el **registro TXT en el DNS**. En Hostinger: *Dominios → DNS → Añadir
   registro*, tipo `TXT`, nombre `@`, valor el que da Google. Propaga en minutos, aunque
   la consola admite hasta 72 h.
   - Alternativa si no se quiere tocar el DNS: propiedad de *Prefijo de URL* y meter el
     código en `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, que lo emite como `<meta>`.
4. **Sitemaps** → enviar `sitemap.xml`.
5. **Inspección de URLs** → pegar `https://bestswim.es/es` → *Solicitar indexación*.
   Repetir con `/es/natacion/entrenamiento`. Solo tiene sentido para 3-4 URLs clave; el
   resto llega por el sitemap.

**Expectativa realista:** un dominio nuevo sin enlaces entrantes tarda de días a semanas
en aparecer. Solicitar indexación no lo acelera más allá del primer rastreo.

## Bing Webmaster Tools

1. https://www.bing.com/webmasters → **Importar desde Google Search Console**. Es el
   camino corto: hereda la verificación y los sitemaps sin repetir el proceso.
2. Si se prefiere manual: verificar por DNS o con
   `NEXT_PUBLIC_BING_SITE_VERIFICATION` (se emite como `msvalidate.01`).
3. Enviar `https://bestswim.es/sitemap.xml`.

### IndexNow

Bing tarda bastante en descubrir un dominio nuevo por su cuenta. IndexNow le empuja las
URL directamente:

```bash
INDEXNOW_KEY=<clave> npm run seo:indexnow
```

Escribe `public/<clave>.txt` (la verificación que exige el protocolo) y envía las 48 URL.
La clave es una cadena hex inventada de 8 a 128 caracteres; genera una con
`node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"`.
Un `202` en la primera ejecución es normal: significa aceptado, pendiente de validar la
clave. **Google no usa IndexNow**, así que esto no sustituye a Search Console.

Conviene relanzarlo después de cada despliegue que añada o cambie páginas.

## Comprobar que ha quedado bien

| Qué | Dónde |
|---|---|
| Datos estructurados | https://search.google.com/test/rich-results |
| Tarjeta al compartir | https://developers.facebook.com/tools/debug/ y el Post Inspector de LinkedIn |
| Rastreabilidad | Search Console → Inspección de URLs → *Ver página rastreada* |
| Core Web Vitals | https://pagespeed.web.dev/ |

Un detalle que puede confundir al revisar: el contenido premium está de pago, así que
Googlebot ve el mismo extracto que un visitante anónimo. Eso es correcto y no es
*cloaking* — lo sería servir al buscador algo distinto de lo que ve la persona.
