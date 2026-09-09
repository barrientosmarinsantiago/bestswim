# Despliegue en Hostinger — bestswim.es

## Antes de nada: qué tipo de plan hace falta

**Best Swim no puede ir en hosting estático.** El sitio usa `middleware.ts` (redirección de
idioma y sesión de Supabase), rutas de API (`/api/stripe/*`, `/api/portal/*`) y renderizado
en servidor para el muro de pago. Todo eso necesita un proceso Node vivo.

- **Sirve:** Hostinger VPS, o cualquier plan con **Node.js Hosting** (Node ≥ 20.9).
- **No sirve:** Hosting web compartido de solo ficheros. Ahí `next build` produce una app
  que nadie ejecuta: la web respondería 404 o serviría el HTML sin sesión, sin checkout y
  sin gating — es decir, con el contenido premium abierto.

Si el plan contratado es compartido, esto es lo primero a resolver; el resto del documento
asume Node/SSR.

## 1 · Variables de entorno

En el panel de Node.js de Hostinger, o en un `.env.production` en el servidor. **Nunca en
el repositorio.**

```env
NEXT_PUBLIC_SITE_URL=https://bestswim.es
NODE_ENV=production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://nfsfxnjygfpnizxeyfod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...            # solo servidor, nunca NEXT_PUBLIC_

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_WEEKLY_PRICE_ID=price_...         # pago único, 1 €
STRIPE_MONTHLY_PRICE_ID=price_...        # recurrente, 22 €
STRIPE_ANNUAL_PRICE_ID=price_...         # recurrente, 240 €
NEXT_PUBLIC_WEEKLY_PRICE_LABEL=1 € / 7 días
NEXT_PUBLIC_MONTHLY_PRICE_LABEL=22 € / mes
NEXT_PUBLIC_ANNUAL_PRICE_LABEL=240 € / año (20 €/mes)

# SEO (ver docs/SEO-INDEXACION.md)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_BING_SITE_VERIFICATION=
NEXT_PUBLIC_BUILD_DATE=2026-09-09
NEXT_PUBLIC_WEEKLY_PRICE_AMOUNT=1
NEXT_PUBLIC_MONTHLY_PRICE_AMOUNT=22
NEXT_PUBLIC_ANNUAL_PRICE_AMOUNT=240
INDEXNOW_KEY=
```

Las `NEXT_PUBLIC_*` se incrustan **en tiempo de build**: cambiar una exige reconstruir, no
basta con reiniciar el proceso.

## 2 · Despliegue

```bash
git clone https://github.com/barrientosmarinsantiago/bestswim.git
cd bestswim
npm ci                 # respeta package-lock; hay .npmrc con legacy-peer-deps
npm run build          # prebuild genera los iconos
npm run start          # respeta process.env.PORT, que es lo que inyecta Hostinger
```

`start` es `next start` sin `-p`: si se fija el puerto a mano, el proceso escucha donde
Hostinger no le habla y el dominio da 502.

Conviene dejarlo bajo un gestor de procesos (PM2 en VPS, o el propio panel de Node) para
que reviva tras un reinicio:

```bash
pm2 start npm --name bestswim -- run start
pm2 save && pm2 startup
```

## 3 · Dominio y TLS

1. Apuntar `bestswim.es` a la IP del servidor (registro `A`) y `www` con un `CNAME`.
2. Emitir el certificado (Let's Encrypt desde el panel).
3. Forzar HTTPS y redirigir `www` → sin `www` **con 301**, no con 302: una redirección
   temporal reparte la autoridad entre los dos hosts en vez de consolidarla.

La redirección de `/` a `/es` la hace el middleware con un **307 (temporal), a propósito**.
Un 308 lo cachea el navegador de forma permanente y dejaría clavada la raíz en español
para siempre, cerrando la puerta a detectar el idioma del visitante más adelante. Para el
buscador no supone diferencia: el `canonical` y el `hreflang x-default` ya indican qué
versión indexar.

El sitio ya envía `Strict-Transport-Security` en producción (`next.config.mjs`), así que
el HTTPS debe estar funcionando antes de publicar: con HSTS activo un fallo de certificado
deja el dominio inaccesible en los navegadores que ya lo visitaron.

## 4 · Webhook de Stripe

En el panel de Stripe, endpoint a `https://bestswim.es/api/stripe/webhook`, con los eventos
`checkout.session.completed`, `customer.subscription.created|updated|deleted` y
`payment_intent.succeeded`. Copiar el *signing secret* a `STRIPE_WEBHOOK_SECRET`.

Sin esto los pagos se cobran y **no se concede acceso**: la entitlement se otorga desde el
webhook, no desde la redirección de vuelta.

## 5 · Comprobación tras publicar

```bash
curl -I https://bestswim.es                       # 307 -> /es
curl -s https://bestswim.es/robots.txt            # Host y Sitemap con el dominio real
curl -s https://bestswim.es/sitemap.xml | head    # <loc> con https://bestswim.es, no localhost
curl -sI https://bestswim.es/favicon.ico          # 200
```

En navegador: la home carga, `/es/natacion/entrenamiento` muestra el extracto y pide
acceso al llegar al límite, y el checkout del Pase Semanal abre Stripe.

Después, y solo después, seguir `docs/SEO-INDEXACION.md`: verificar la propiedad en
Search Console y Bing sobre el dominio ya en producción con HTTPS.

## Orden recomendado

1. Confirmar que el plan de Hostinger es Node/SSR.
2. Crear en Stripe el producto del Pase Semanal (pago único, 1 €) y recoger los tres price ID.
3. Desplegar con las variables puestas.
4. Dominio + TLS + redirección 301 de www.
5. Webhook de Stripe y una compra de prueba en modo test.
6. Search Console, Bing e IndexNow.
