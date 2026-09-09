# Best Swim — Reporte ejecutivo de auditoría (funcional, calidad y seguridad)

**Fecha:** 2026-06-16
**Alcance:** Código en `C:\Users\barri\OneDrive\Documentos\BestSwim` (Next.js 16 · Supabase · Stripe)
**Objetivo:** Preparar la aplicación para despliegue a producción en Hostinger, optimizada para PC y móvil y lista para escalar.

---

## 1. Resumen ejecutivo

Best Swim es una plataforma **sólida y bien construida** en su base: arquitectura moderna (Next.js 16 App Router + TypeScript), internacionalización en 3 idiomas (es/en/pt), autenticación social con Supabase, suscripciones con Stripe, RLS bien diseñada para las tablas de base de datos, SEO/OpenGraph correctos y cumplimiento RGPD de cookies. **El typecheck y el lint pasan limpios y el build compila sin errores.**

Sin embargo, **hay un problema crítico de negocio que bloquea el lanzamiento** y un conjunto de endurecimientos de seguridad y preparación para producción que deben resolverse antes de pasar a `bestswim.es`.

| Estado global | Veredicto |
|---|---|
| ¿Compila y arranca? | ✅ Sí (TS + lint limpios, build OK) |
| ¿Listo para producción **hoy**? | ❌ **No** — 1 bloqueante crítico + 3 altos |
| Esfuerzo estimado a "listo para producción" | Medio — la mayoría son cambios acotados |

### Hallazgos por severidad

| # | Severidad | Hallazgo | Área |
|---|---|---|---|
| C-1 | 🔴 **Crítico** | El contenido premium se entrega completo al navegador; el muro de pago se evade trivialmente | Negocio / Seguridad |
| H-1 | 🟠 Alto | Sin cabeceras de seguridad HTTP (CSP, HSTS, anti-clickjacking…) | Seguridad |
| H-2 | 🟠 Alto | `/api/contact` sin autenticación, sin rate-limit, sin validación (spam con clave de servicio) | Seguridad |
| H-3 | 🟠 Alto | Esquema de Supabase fragmentado y desactualizado vs. el código | Despliegue |
| M-1 | 🟡 Medio | Webhook de Stripe sin idempotencia ni manejo de pagos fallidos | Pagos |
| M-2 | 🟡 Medio | Build falla en OneDrive (EPERM) — entorno frágil para deploy | Despliegue |
| M-3 | 🟡 Medio | Panel `/admin` sin autorización en servidor (solo cliente + RLS) | Seguridad |
| M-4 | 🟡 Medio | Imágenes con `<img>` cruda (sin `next/image`): CLS/LCP y peso | Rendimiento |
| L-1 | 🟢 Bajo | Páginas placeholder con copy interno ("en preparación", "Horizons") | Calidad |
| L-2 | 🟢 Bajo | Componentes monolíticos (`client-portal.tsx` 2907 líneas) | Mantenibilidad |
| L-3 | 🟢 Bajo | Sin pruebas automatizadas para pagos/acceso | Calidad |

---

## 2. Lo que está bien (no tocar)

- **RLS bien diseñada** (`docs/supabase-schema.sql`): las políticas de `profiles` impiden escalada de privilegios (un usuario no puede cambiarse el `role` ni el `stripe_customer_id`); `training_sessions` exige `is_admin()` para escritura y suscripción activa para lectura. El panel admin se apoya correctamente en RLS, no solo en el check de cliente.
- **Autenticación** vía OAuth social (sin contraseñas en el cliente); el callback **sanea el parámetro `next`** (evita open-redirect).
- **Webhook de Stripe** verifica la firma con `constructEvent` y usa `runtime = "nodejs"` con el cuerpo crudo (correcto).
- **Secretos**: no hay claves en el cliente; `.env*.local` está en `.gitignore`; sin `console.log`, sin `dangerouslySetInnerHTML`, sin `eval`.
- **SEO**: `robots.ts` bloquea `/api/` y `/admin/`; `sitemap.ts` por idioma; metadata con `canonical`, `hreflang` + `x-default`, OpenGraph y Twitter cards.
- **RGPD**: banner de cookies con consentimiento granular (necesarias/analítica/marketing), versionado y caducidad de 180 días.
- **Accesibilidad**: `aria-live`, `aria-modal`, `prefers-reduced-motion`, `sr-only`, foco gestionado en modales.

---

## 3. Hallazgos detallados y correcciones

### 🔴 C-1 — El muro de pago se puede evadir (CRÍTICO de negocio)

**Qué pasa.** El producto de pago (las sesiones de entrenamiento) vive en `src/content/imported-content.json` (**1,7 MB / 54.263 líneas**). El Server Component `src/app/[locale]/[...slug]/page.tsx` carga la sección completa y la pasa como prop a componentes cliente (`TrainingSectionPage`, `MultimediaPage`). El control de acceso (`content-access.tsx`: `public: 3, free: 10, premium: ∞`) se aplica **solo en el navegador**: para los documentos bloqueados se renderiza un `LockedContentCard` en vez del contenido, **pero el cuerpo completo (`document.blocks`) viaja igualmente en el payload** (RSC/props) hacia el cliente.

**Impacto.** Cualquier visitante —sin registrarse ni pagar— puede leer el 100% del contenido premium con: *Ver código fuente*, las DevTools (pestaña Red/Fuentes), o simplemente desactivando JavaScript. La marca de agua de fondo es decorativa y se ignora. **Esto anula el valor de la membresía Premium.** La RLS de `training_sessions` no protege aquí porque el contenido servido proviene del bundle estático, no de esa tabla.

**Corrección.** Mover el gating al servidor:
1. En `[...slug]/page.tsx` (servidor), resolver el nivel del usuario con `getSupabaseServerClient()` + comprobación de suscripción (misma lógica que `/api/content-access`).
2. Antes de pasar props, **eliminar `blocks` de los documentos a los que el usuario no tiene derecho** y enviar solo `title` + `summary`.
3. El `LockedContentCard` se construye con esos metadatos; el cuerpo nunca se serializa para quien no paga.
4. Mantener la RLS como defensa en profundidad.

> Tarea asociada: **#2 (P0)**.

---

### 🟠 H-1 — Faltan cabeceras de seguridad HTTP

**Qué pasa.** `next.config.mjs` solo define `reactStrictMode`. No hay `Content-Security-Policy`, `Strict-Transport-Security` (HSTS), `X-Frame-Options`/`frame-ancestors` (anti-clickjacking), `X-Content-Type-Options`, `Referrer-Policy` ni `Permissions-Policy`.

**Impacto.** Mayor superficie para clickjacking, sniffing de MIME y fuga de *referrer*. En una web con **pagos**, las cabeceras son una expectativa básica de producción (y de los revisores de Stripe/marketplaces).

**Corrección.** Añadir `async headers()` en `next.config.mjs` (o en `middleware.ts`) con un set estricto. HSTS también debe activarse en Hostinger. Incluido en el **pack de correcciones (tarea #1)**.

---

### 🟠 H-2 — `/api/contact` abierto, sin límites ni validación

**Qué pasa.** `src/app/api/contact/route.ts` es público, usa el **cliente admin (clave de servicio)** para insertar en `leads`, y no tiene: validación de formato de email, límites de longitud, honeypot/CAPTCHA, rate-limiting, ni `try/catch` alrededor de `request.json()`.

**Impacto.** Un bot puede inundar la tabla `leads` con basura/registros enormes (coste, ruido y posible abuso), y un cuerpo malformado provoca un 500.

**Corrección.** Validar (regex de email + longitudes máximas), añadir honeypot o CAPTCHA (Cloudflare Turnstile/hCaptcha), rate-limit por IP y envolver el parseo. Incluido en el **pack de correcciones (tarea #1)**.

---

### 🟠 H-3 — Esquema de Supabase fragmentado y desactualizado

**Qué pasa.** Hay ~15 ficheros `.sql` en `docs/` (group-access, portal-access, onboarding, performance-metrics…) y el `supabase-schema.sql` base **no refleja el código actual**: faltan columnas y tablas que el código ya usa (`access_tier`, `trial_ends_at`, `swim_level`, `content_groups`, `profile_content_groups`, etc.).

**Impacto.** Reproducir la base de datos de producción es propenso a errores de orden y omisiones; difícil de auditar qué RLS está realmente desplegada.

**Corrección.** Unificar en migraciones ordenadas y reproducibles (idealmente Supabase CLI), verificar en el proyecto de producción que **todas** las políticas y *grants* están aplicados, y probar la RLS real con usuarios anon/free/premium. Tarea **#3 (P0)**.

---

### 🟡 M-1 — Webhook de Stripe sin idempotencia ni pagos fallidos

**Qué pasa.** `api/stripe/webhook/route.ts` no registra los `event.id` procesados (Stripe puede reenviar eventos) y no maneja `invoice.payment_failed` / `payment_action_required`. Si falta `metadata.user_id` y no hay perfil con ese `customer`, el evento se descarta en silencio (`return`).

**Impacto.** Posible doble procesamiento y, sobre todo, **una renovación fallida no degrada el acceso a tiempo** (un usuario que dejó de pagar mantiene Premium).

**Corrección.** Tabla/registro de eventos procesados (dedupe por `event.id`), manejar eventos de fallo de pago, y loguear los mapeos de usuario no resueltos. Incluido en el **pack de correcciones (tarea #1)**.

---

### 🟡 M-2 — El build falla dentro de OneDrive

**Qué pasa.** `npm run build` falla con `EPERM: operation not permitted, rmdir '...\.next\...'` porque OneDrive bloquea ficheros mientras sincroniza. Solo compila tras borrar `.next` manualmente.

**Impacto.** Entorno de desarrollo/*deploy* frágil; riesgo de builds corruptos si se compila desde la carpeta sincronizada.

**Corrección.** Mover el repositorio a una ruta **no sincronizada** (p. ej. `C:\dev\BestSwim`) y construir en CI o en el host, nunca en OneDrive. Tarea **#4 (P1)**.

> ⚠️ Nota de hosting: Next.js 16 con App Router, middleware y rutas API **requiere un entorno Node en ejecución** (SSR), no *hosting* estático. Confirma que tu plan de Hostinger soporta Node/SSR (o usa el adaptador correspondiente) antes del despliegue.

---

### 🟡 M-3 — `/admin` sin autorización en servidor

**Qué pasa.** `[locale]/admin/training/page.tsx` se renderiza para cualquiera (es SSG); la protección es client-side (`TrainingAdmin` comprueba `role`) + RLS en las escrituras. Los datos están protegidos por RLS, pero la página/labels de admin se exponen y no hay redirección en servidor.

**Corrección.** Resolver la sesión en el servidor y `redirect()`/`notFound()` para no-admins (defensa en profundidad). Incluido en el **pack de correcciones (tarea #1)**.

---

### 🟡 M-4 — Imágenes sin optimizar (`<img>` cruda)

**Qué pasa.** Landing y contenido usan `<img>` directas: sin `srcset` responsive, sin `width/height` (riesgo de **CLS**), sin `priority` en el hero (afecta **LCP**), y el hero usa `object-contain` (bandas negras).

**Corrección.** Migrar a `next/image` con `sizes` correctos, `priority` en el hero, dimensiones fijas, y revisar el peso de los vídeos de testimonios. Objetivo: LCP < 2,5 s, CLS < 0,1. Tarea **#5 (P1)**.

---

### 🟢 Bajos

- **L-1** — Páginas placeholder de `[...slug]` muestran copy interno ("Página en preparación", "Horizons", "GitHub y Supabase"). No debe ir a producción; además varias rutas del `sitemap.ts` apuntan a esos placeholders. Tarea **#7**.
- **L-2** — `client-portal.tsx` (2907 líneas) y `landing-page.tsx` (1401) son monolíticos: bundle de cliente grande y difícil de revisar. Trocear y extraer copia estática al diccionario i18n. Tarea **#7**.
- **L-3** — Sin pruebas automatizadas. Añadir smoke/integración para webhook, checkout, gating y callback OAuth + CI. Tarea **#8**.
- **Contraste**: `swim-steel` (#8CA4C5) sobre fondos oscuros queda al límite de WCAG AA en texto pequeño — se aborda en el rediseño (tarea #6).

---

## 4. Plan de preparación a producción (orden recomendado)

1. **Aprobar y aplicar el pack de correcciones (tarea #1)** — headers, contacto, idempotencia webhook, auth admin server-side. *(Requiere tu OK.)*
2. **Cerrar el muro de pago en servidor (tarea #2, P0)** — bloqueante de negocio.
3. **Consolidar el esquema Supabase y verificar RLS en producción (tarea #3, P0).**
4. **Sacar el repo de OneDrive + pipeline a Hostinger con env de producción (tarea #4, P1).**
5. **Optimizar imágenes/CWV (tarea #5) y rediseño visual (tarea #6).**
6. **Limpieza de placeholders + división de componentes (tarea #7) y pruebas + CI (tarea #8).**

### Checklist de "go-live"
- [ ] Claves **live** de Stripe + webhook apuntando a `https://bestswim.es/api/stripe/webhook` (probar con un pago real en modo test→live).
- [ ] URLs de redirect OAuth de Supabase para `https://bestswim.es/es|en|pt/auth/callback`.
- [ ] `NEXT_PUBLIC_SITE_URL=https://bestswim.es` y todas las env vars de producción cargadas en el host.
- [ ] HSTS activo y certificado TLS válido en Hostinger.
- [ ] Verificar gating real (anon/free/premium) tras la tarea #2.
- [ ] Lighthouse móvil y PC ≥ 90 en Rendimiento/SEO/Buenas prácticas.

---

## 5. Propuesta de mejora de diseño

Ver los mockups interactivos entregados junto a este reporte (nueva paleta, hero, pricing y modo lectura de contenido). Resumen de la dirección propuesta en la tarea **#6**.

---

## 6. Actualización — correcciones aplicadas (2026-06-16)

### ✅ Pack #1 — Endurecimiento de seguridad (tarea #1)
- **Cabeceras de seguridad** en `next.config.mjs`: CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` y `Strict-Transport-Security` (solo producción). CSP compatible con Supabase/Stripe; pendiente endurecer `script-src` con nonces más adelante.
- **`/api/contact`**: parseo de JSON seguro, validación de email, límites de longitud, honeypot (`company`) y rate-limit en memoria por IP (5/min).
- **Webhook de Stripe**: idempotencia por `event.id` (en memoria) y manejo de `invoice.payment_failed` / `invoice.paid`.
- **`/admin/training`**: autorización en servidor (redirige a no logueados, `notFound()` a no-admin); la ruta pasó de SSG a dinámica.

### ✅ Pack #2 — Muro de pago en servidor (tarea #2)
- Nuevo `src/lib/content-access.ts` (`getServerContentAccessLevel`) como única fuente de verdad; `/api/content-access` refactorizado para usarlo.
- Nuevo `src/content/access.ts` que **elimina los `blocks` de los documentos/sesiones bloqueados antes de serializarlos** al navegador (`sanitizeSectionForLevel`, `sanitizeChallengeForLevel`).
- `[...slug]/page.tsx` resuelve el nivel en servidor, sanea el contenido y pasa `accessLevel` como prop; ahora es `force-dynamic`.
- Los componentes cliente (`rich-content.tsx`, `multimedia-page.tsx`) reciben `accessLevel` por prop (sin fetch ni parpadeo).
- **Cambio de comportamiento:** las sesiones de los **retos** ahora se bloquean por posición (intro libre; público 3 / free 10 / premium ∞). Antes estaban totalmente abiertas. Es fácilmente ajustable si prefieres otra política.

> Verificado: `typecheck`, `lint` y `next build` en verde.

### ✅ Tarea #9 — Fuga de contenido del portal cerrada
`client-portal.tsx` importaba `getPortalTrainingDocumentBySourceKey`, lo que empaquetaba todo `imported-content.json` (1,7 MB) en el bundle del portal y exponía los cuerpos a cualquier usuario logueado. Corregido:
- Nuevo endpoint [`/api/portal/content`](../src/app/api/portal/content/route.ts) que verifica entitlement vía RLS (el usuario debe poder leer una fila de `training_sessions` con ese `source_key`) y devuelve el documento solo si está autorizado.
- `PortalSessionCard` resuelve el documento por `fetch` (con caché por `source_key`+locale y estado de carga) en vez de importar el contenido.
- **Verificado tras `next build`:** `imported-content.json` ya **no** aparece en `.next/static` (cliente); solo en `.next/server`. El bundle del portal se reduce ~1,7 MB y el muro de pago queda cerrado también para usuarios logueados.

### ✅ Tarea #3 — Esquema de Supabase consolidado y ordenado
- Nueva guía canónica [`docs/SUPABASE-ORDEN-DESPLIEGUE.md`](SUPABASE-ORDEN-DESPLIEGUE.md): orden de ejecución reproducible de los 9 scripts (con dependencias de datos y la supersesión de la política RLS de `training_sessions` explicadas) + checklist de producción.
- Nuevo script [`docs/supabase-verificacion.sql`](supabase-verificacion.sql): verifica las 15 tablas, columnas críticas, funciones (public + private), RLS activa y la política final `training_select_published_by_scope`.

### ✅ Tarea #6 — Paleta y diseño aplicados
- Tokens en `tailwind.config.ts`: texto muted con mejor contraste (`swim-steel` → #AFC6E0) y nuevos acentos `swim-coral` (#FF6B4A), `swim-gold` (#FFC24B), `swim-mint` (#34D399).
- CTA principal en **coral** (`button.tsx`, variante primary) para destacar conversión; el cian se conserva como color de identidad (badges, iconos, enlaces).
- Membresía: dona "BEST VALUE / BEST DEAL" y plan anual en **oro**, plan free en **menta**.
- **Conservado tal cual:** el banner marquee (landing y portal), la dona giratoria (clase `bestswim-value-seal-text` + textos), y el desplazamiento automático de retos/testimonios. El hero mantiene su tratamiento (imagen completa + fondo desenfocado) para no recortar fotos.
- Pendiente opcional: "modo lectura" claro para el contenido largo (cambio mayor en `rich-content.tsx`); se puede aplicar aparte si lo quieres.

### ✅ Entorno movido a D:\dev\BestSwim (fuera de OneDrive)
- Dependencias reinstaladas con `--legacy-peer-deps` (conflicto `eslint-config-next@16` ↔ `eslint 8.57`), fijado en `.npmrc` para instalaciones consistentes.
- `scripts/start-dev.cjs` acepta `PORT`; dev en `http://localhost:3100` (OneDrive queda como fallback/restauración). El error EPERM del build queda resuelto.

### ✅ Tarea #5 — Imágenes y Core Web Vitals
- `next.config.mjs`: `images.formats` AVIF/WebP.
- Hero (LCP), entrenador e historias migrados a `next/image` (`fill` + `sizes` responsive + `priority` en el primer slide). Verificado: el HTML sirve `/_next/image?...&w=...` (srcset responsive).
- Carrusel (retos/camps/partners) queda `<img>` lazy+webp (ya optimizado); migración opcional con QA visual en navegador.

### ✅ Tarea #7 — Placeholders limpiados
- `[...slug]/page.tsx`: copy interno ("Horizons/GitHub/Supabase") → copy profesional localizado.
- Pendiente de contenido del propietario: `multimedia.ts` (3 drills "Nombre Drill" placeholder).
- La división de componentes monolíticos se trasladó a la tarea #10 (mantenibilidad, no bloqueante).

### ✅ Tarea #8 — Pruebas + CI
- Vitest configurado; 7 pruebas de la lógica del muro de pago en `src/content/access.test.ts` (public/free/premium, gating por documento, gating por sesión de aguas abiertas, retos) — todas en verde.
- `.github/workflows/ci.yml`: lint + typecheck + test + build en cada push/PR.
- Build de producción verificado en verde tras todos los cambios.

### Verificación de runtime pendiente (antes de producción)
Probar las tres rutas con sesión real: **anónimo** (ve 3 ítems), **free** (10) y **premium** (todo). Confirmar con *Ver código fuente* / payload RSC en `/es/natacion/entrenamiento` que el texto de las sesiones bloqueadas **no** está presente. Cubrir con las pruebas de la tarea #8.
