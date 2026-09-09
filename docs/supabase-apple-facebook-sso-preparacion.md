# Preparacion SSO Apple y Facebook

Fecha: 2026-06-08

Proyecto Supabase:

- Project ref: `nfsfxnjygfpnizxeyfod`
- Supabase Auth callback para Facebook y Apple: `https://nfsfxnjygfpnizxeyfod.supabase.co/auth/v1/callback`

La app Best Swim ya tiene preparados los botones `facebook` y `apple` en el portal clientes y la ruta de callback local:

- `http://localhost:3000/es/auth/callback`
- `http://localhost:3000/en/auth/callback`
- `http://localhost:3000/pt/auth/callback`
- `https://bestswim.es/es/auth/callback`
- `https://bestswim.es/en/auth/callback`
- `https://bestswim.es/pt/auth/callback`

## Requisitos de tu parte

Facebook:

- Acceso a Meta for Developers.
- Crear o seleccionar una app para Best Swim.
- App Domain: `bestswim.es`.
- Valid OAuth Redirect URI: `https://nfsfxnjygfpnizxeyfod.supabase.co/auth/v1/callback`.
- Permisos requeridos: `public_profile` y `email`.
- App ID.
- App Secret.
- Privacy Policy URL, icono de app y terminos si Meta los solicita antes de pasar a modo Live.
- Usuarios tester mientras la app este en Development mode.

Apple:

- Apple Developer Program activo.
- Team ID.
- App ID con capability `Sign in with Apple`.
- Services ID para web, por ejemplo `es.bestswim.web` o similar.
- Website Domain para el flujo OAuth de Supabase: `nfsfxnjygfpnizxeyfod.supabase.co`.
- Return URL: `https://nfsfxnjygfpnizxeyfod.supabase.co/auth/v1/callback`.
- Signing Key ID.
- Archivo privado `.p8` descargado de Apple y guardado en lugar seguro.
- Client secret de Apple generado con Team ID, Services ID, Key ID y `.p8`.

Nota Apple: en el flujo OAuth Apple no garantiza nombre completo. Best Swim debe seguir usando `profiles` y el onboarding para datos fiables del cliente.

## Configuracion Supabase preparada

En Supabase > Authentication > URL Configuration:

- Site URL: `https://bestswim.es`
- Redirect URLs:
  - `https://bestswim.es/es/auth/callback`
  - `https://bestswim.es/en/auth/callback`
  - `https://bestswim.es/pt/auth/callback`
  - `http://localhost:3000/es/auth/callback`
  - `http://localhost:3000/en/auth/callback`
  - `http://localhost:3000/pt/auth/callback`

En Supabase > Authentication > Providers:

- Facebook:
  - Enabled: ON
  - Client ID: Meta App ID
  - Client Secret: Meta App Secret
- Apple:
  - Enabled: ON
  - Client ID: Apple Services ID
  - Secret: Apple generated client secret

## Configuracion por script

Cuando tengas las credenciales, puedes aplicar la configuracion de providers con el script preparado:

```powershell
$env:SUPABASE_ACCESS_TOKEN="sbp_..."
$env:SUPABASE_PROJECT_REF="nfsfxnjygfpnizxeyfod"
$env:SUPABASE_AUTH_FACEBOOK_CLIENT_ID="..."
$env:SUPABASE_AUTH_FACEBOOK_SECRET="..."
$env:SUPABASE_AUTH_APPLE_CLIENT_ID="..."
$env:SUPABASE_AUTH_APPLE_SECRET="..."
npm run supabase:configure-social-auth
```

Para revisar el payload sin enviar secretos completos:

```powershell
npm run supabase:configure-social-auth -- --dry-run
```

El script usa la Supabase Management API `PATCH /v1/projects/{project_ref}/config/auth` y solo actualiza los providers para los que existan credenciales.

## Smoke test

1. Abre `http://localhost:3000/es/clientes`.
2. Click en Facebook.
3. Completa consentimiento con un usuario tester.
4. Debe volver a `http://localhost:3000/es/clientes`.
5. Repite con Apple.
6. Verifica en Supabase > Authentication > Users que se creo/actualizo el usuario.
