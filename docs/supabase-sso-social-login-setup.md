# Best Swim Supabase Social Login Setup

Date: 2026-06-08

This project uses Supabase Auth social login for Google, Facebook and Apple. In Supabase terminology these are OAuth social providers. Enterprise SSO is a different feature and is not needed for this client portal phase.

## App URLs

Production site:

- `https://bestswim.es`

Local development:

- `http://localhost:3000`

Supabase app callback routes already implemented in this repo:

- `/es/auth/callback`
- `/en/auth/callback`
- `/pt/auth/callback`

The client portal uses:

```ts
const origin = getAuthRedirectOrigin(window.location.origin)

supabase.auth.signInWithOAuth({
  provider,
  options: {
    redirectTo: `${origin}/${locale}/auth/callback?next=/${locale}/clientes`
  }
})
```

`getAuthRedirectOrigin` prevents local OAuth redirects from using `0.0.0.0` or `127.0.0.1`. In local development, those hosts are normalized to `http://localhost:3000` so Supabase cookies stay on one browser origin.

## Supabase Dashboard

1. Open your Supabase project.
2. Go to Authentication > URL Configuration.
3. Set Site URL:
   - `https://bestswim.es`
4. Add Redirect URLs:
   - `https://bestswim.es/es/auth/callback`
   - `https://bestswim.es/en/auth/callback`
   - `https://bestswim.es/pt/auth/callback`
   - `http://localhost:3000/es/auth/callback`
   - `http://localhost:3000/en/auth/callback`
   - `http://localhost:3000/pt/auth/callback`
   - Do not use `http://0.0.0.0:3000` or `http://127.0.0.1:3000` as Site URL or as Redirect URLs. Use `http://localhost:3000` for local OAuth testing.
5. Go to Authentication > Providers.
6. Enable Google, Facebook and Apple after creating each provider app.

## Environment Variables

Set these in local `.env.local` and in production hosting:

```env
NEXT_PUBLIC_SITE_URL=https://bestswim.es
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<sb_publishable_xxx>
SUPABASE_SECRET_KEY=<sb_secret_xxx>
```

Use the new Supabase API keys where available:

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is safe for browser/client use when RLS is enabled.
- `SUPABASE_SECRET_KEY` is server-only and must never be exposed in the browser or with `NEXT_PUBLIC_`.

Legacy fallback names still work in the code during migration:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=<legacy-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<legacy-service-role-key>
```

## Provider Redirect URI

For Google, Facebook and Apple provider dashboards, the OAuth callback/redirect URI generally points to Supabase Auth:

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

Supabase receives the provider response first, then redirects back to the locale-specific callback route configured in `redirectTo`.

## Google

1. Create or select a Google Cloud project.
2. Configure OAuth consent screen / Google Auth Platform audience.
3. Create OAuth credentials for a web application.
4. Add authorized redirect URI:
   - `https://<project-ref>.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret.
6. In Supabase > Authentication > Providers > Google:
   - Enable Google.
   - Paste Client ID and Secret.
   - Save.

## Facebook

1. Create an app in Meta for Developers.
2. Configure Authentication / Account Creation use case.
3. Ensure both `public_profile` and `email` permissions are available.
4. In Facebook Login settings, add Valid OAuth Redirect URI:
   - `https://<project-ref>.supabase.co/auth/v1/callback`
5. Copy App ID and App Secret.
6. In Supabase > Authentication > Providers > Facebook:
   - Enable Facebook.
   - Paste App ID and Secret.
   - Save.
7. While the Facebook app is in Development mode, only app roles/testers can log in. Move the app live when ready.

## Apple

1. Use an Apple Developer account.
2. Create/configure an App ID with Sign in with Apple enabled.
3. Create a Services ID for the web login.
4. Configure the website domain and return URL for the Supabase OAuth flow:
   - Domain: `<project-ref>.supabase.co`
   - Return URL: `https://<project-ref>.supabase.co/auth/v1/callback`
5. Generate Apple client secret/key as required by Apple/Supabase.
6. In Supabase > Authentication > Providers > Apple:
   - Enable Apple.
   - Add Services ID / Client ID and generated secret.
   - Save.

Important Apple note: Apple may not provide the user's full name in the OAuth flow after the first authorization. Use the `profiles` table and onboarding fields if Best Swim needs reliable names.

## Smoke Test

Test each provider in this order:

1. `http://localhost:3000/es/clientes`
2. `http://localhost:3000/en/clientes`
3. `http://localhost:3000/pt/clientes`
4. Production equivalents after deployment.

Expected behavior:

- User clicks provider button.
- Provider consent screen opens.
- Provider redirects to Supabase callback.
- Supabase redirects to `/<locale>/auth/callback?next=/<locale>/clientes`.
- App exchanges code for session.
- User lands in `/<locale>/clientes`.
- `profiles` row is upserted with user id, email and locale.

## Access Logic To Implement Next

The next portal step should enforce:

- Anonymous users: marketing pages and limited public content only.
- Free trial users: 15-day access to sample sessions, basic drills, basic library, portal.
- Body Factory in-person students: permanent Free access flag.
- Premium subscribers: full protected library, 4 sessions/week, multimedia, calendar, discounts, coaching and nutrition planning.
- Admins: publish and schedule ES/EN/PT training content.
