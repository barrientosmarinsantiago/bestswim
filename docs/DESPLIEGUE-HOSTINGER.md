# Despliegue en Hostinger — bestswim.es

## El plan sirve: confirmado

Plan **Business Web Hosting** (Europe/France), con soporte de aplicaciones Node.js.
Verificado en *Plan de hosting → Detalles del plan → Detalles de Node.js*:

- **Next.js figura como framework de backend compatible**, no solo de frontend. Esa
  distinción es la que importa: "backend" significa que ejecuta el servidor Node, que es
  lo que necesitan el middleware, las 9 rutas de API y el renderizado del muro de pago.
- Node.js 24.x / 22.x / 20.x / 18.x — cubre el `engines: >=20.9.0` del proyecto.
- **5 apps Node.js** incluidas. `archmyst.com` es un sitio estático (Astro) y no consume
  slot, así que Best Swim sería la primera.

No hace falta VPS. Lo que **no** vale, y conviene no confundir al crear el sitio, es la
opción *"Sitio web PHP/HTML personalizado"*: eso sirve ficheros sin ejecutar nada. La
opción correcta al añadir el sitio es **"Desplegar app web"** (*Sitios web → Web Apps*).

### Límites del plan a tener presentes

| Recurso | Plan Business | Comentario |
|---|---|---|
| Disco | 50 GB (0,06 usados) | `.next` 28 MB + `public` 45 MB + `node_modules`. De sobra. |
| Inodos | 600.000 (1.292 usados) | `node_modules` de Next ronda las 40.000 entradas. Holgado. |
| RAM | 3 GB | Compartida con el resto del plan. Ver *si el build falla*. |
| CPU | 2 núcleos | El build local tarda ~30 s; aquí será más. |
| **Procesos** | **120 máximo** | El límite más relevante: `next build` lanza varios workers. |

## 1 · Variables de entorno

Se configuran en el panel de la app Node.js. **Nunca en el repositorio.**

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

Dos avisos que ahorran un despliegue fallido:

- Las `NEXT_PUBLIC_*` se incrustan **en el build**, no se leen al arrancar. Cambiar una
  exige reconstruir; reiniciar el proceso no basta.
- Si falta `NEXT_PUBLIC_SITE_URL` el sitio compila igual, pero publica un sitemap lleno de
  `http://localhost:3000` y Google lo descarta entero.

## 2 · Crear la app

*Sitios web → Añadir sitio web → **Desplegar app web***, conectando el repositorio
`barrientosmarinsantiago/bestswim`, rama `main`.

Valores que pedirá el panel:

| Campo | Valor |
|---|---|
| Versión de Node | 22.x (o 20.x) |
| Gestor de paquetes | npm |
| Comando de instalación | `npm ci` |
| Comando de build | `npm run build` |
| Comando de inicio | `npm start` |

`npm ci` funciona porque `package-lock.json` y `.npmrc` (con `legacy-peer-deps=true`, que
hace falta por el conflicto de `eslint-config-next@16`) están ambos versionados.

`npm start` es `next start` **sin `-p`**, a propósito: así respeta el `PORT` que inyecta
Hostinger. Si se fija el puerto a mano, el proceso escucha donde el servidor no le habla y
el dominio responde 502.

El `prebuild` genera los iconos (`favicon.ico`, `apple-touch-icon`, 96/192/512) antes de
compilar, así que no hay que subirlos a mano.

### Si el build falla por memoria o procesos

Con 3 GB compartidos y tope de 120 procesos, `next build` puede quedarse corto. Por orden:

1. Limitar los workers: `NEXT_BUILD_WORKERS=2` en las variables de entorno.
2. Ampliar el heap: `NODE_OPTIONS=--max-old-space-size=2048`.
3. Si aun así falla, compilar en local y subir `.next` junto al repo, dejando en el panel
   solo `npm start` como comando de arranque.

## 3 · Dominio y TLS

1. Apuntar `bestswim.es` a la app y `www` con un `CNAME`.
2. Emitir el certificado SSL desde el panel.
3. Forzar HTTPS y redirigir `www` → sin `www` **con 301**, no 302: una redirección temporal
   reparte la autoridad entre los dos hosts en vez de consolidarla.

La redirección de `/` a `/es` la hace el middleware con un **307 (temporal), a propósito**.
Un 308 lo cachea el navegador de forma permanente y dejaría clavada la raíz en español para
siempre, cerrando la puerta a detectar el idioma del visitante más adelante. Para el
buscador no supone diferencia: el `canonical` y el `hreflang x-default` ya indican qué
versión indexar.

El sitio envía `Strict-Transport-Security` en producción (`next.config.mjs`), así que el
HTTPS debe funcionar **antes** de publicar: con HSTS activo, un fallo de certificado deja el
dominio inaccesible en los navegadores que ya lo visitaron.

> El `bestswim.es` que aparece hoy en el panel es la prueba hecha con Horizons. Hay que
> retirarlo antes de apuntar el dominio a la app nueva, o el DNS seguirá resolviendo a él.

## 4 · Webhook de Stripe

Endpoint a `https://bestswim.es/api/stripe/webhook`, con los eventos
`checkout.session.completed`, `customer.subscription.created|updated|deleted` y
`payment_intent.succeeded`. El *signing secret* va a `STRIPE_WEBHOOK_SECRET`.

Sin esto los pagos se cobran y **no se concede acceso**: la entitlement se otorga desde el
webhook, no desde la redirección de vuelta del checkout.

## 5 · Comprobación tras publicar

```bash
curl -I https://bestswim.es                       # 307 -> /es
curl -s https://bestswim.es/robots.txt            # Host y Sitemap con el dominio real
curl -s https://bestswim.es/sitemap.xml | head    # <loc> con https://bestswim.es, no localhost
curl -sI https://bestswim.es/favicon.ico          # 200
curl -s https://bestswim.es/es | grep -c ld+json  # 1 -> datos estructurados presentes
```

En navegador: la home carga, `/es/natacion/entrenamiento` muestra el extracto y pide acceso
al llegar al límite, y el checkout del Pase Semanal abre Stripe.

### Aviso: Hostinger sirve su propio robots.txt en el dominio de preview

En el despliegue de prueba a `*.hostingersite.com` comprobamos que `/robots.txt` **no** es
el que genera `src/app/robots.ts`, sino uno inyectado por Hostinger:

```
User-agent: Googlebot
Disallow: /

User-agent: *
Allow: /
```

Es decir: el servidor intercepta esa ruta en los dominios temporales. Al pasar al dominio
definitivo hay que **verificar que `/robots.txt` devuelve el nuestro** (el que lleva las
líneas `Sitemap:` y `Host:`). Si siguiera saliendo el de Hostinger, el sitemap nunca se
anunciaría y habría que desactivar esa inyección desde el panel.

La etiqueta `<meta name="robots">` sí sale del código y no la toca nadie, que es por lo que
conviene tener las dos: `NEXT_PUBLIC_NOINDEX=1` cerró el preview aunque el robots.txt del
servidor dejaba pasar a todo lo que no fuera Googlebot.

Después, y solo después, seguir `docs/SEO-INDEXACION.md` sobre el dominio ya en producción
con HTTPS.

## Orden recomendado

1. Retirar del panel el `bestswim.es` de la prueba con Horizons.
2. Crear en Stripe el producto del Pase Semanal (pago único, 1 €) y recoger los tres price ID.
3. Crear la app con *Desplegar app web* desde GitHub, con las variables puestas.
4. Dominio + TLS + redirección 301 de `www`.
5. Webhook de Stripe y una compra de prueba en modo test.
6. Search Console, Bing e IndexNow.
