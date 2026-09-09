# Best Swim Social Login Provider Setup

Use this guide after Google has been tested successfully. The Supabase callback URL is the same for Google, Facebook and Apple:

```text
https://nfsfxnjygfpnizxeyfod.supabase.co/auth/v1/callback
```

Local app callback routes already configured in Best Swim:

```text
http://localhost:3000/es/auth/callback
http://localhost:3000/en/auth/callback
http://localhost:3000/pt/auth/callback
```

Production app callback routes:

```text
https://bestswim.es/es/auth/callback
https://bestswim.es/en/auth/callback
https://bestswim.es/pt/auth/callback
```

## Supabase URL Configuration

In Supabase Dashboard > Authentication > URL Configuration:

Site URL for local testing:

```text
http://localhost:3000
```

When production is ready, set Site URL to:

```text
https://bestswim.es
```

Add all redirect URLs listed above.

## Google

1. Go to Google Cloud / Google Auth Platform.
2. Create or select the Best Swim project.
3. Configure the OAuth consent screen / audience.
4. Create an OAuth client.
5. Application type: `Web application`.
6. Authorized JavaScript origins:

```text
http://localhost:3000
https://bestswim.es
```

7. Authorized redirect URI:

```text
https://nfsfxnjygfpnizxeyfod.supabase.co/auth/v1/callback
```

8. Copy the Client ID and Client Secret.
9. In Supabase > Authentication > Providers > Google:
   - Enable Google.
   - Paste Client ID into `Client IDs`.
   - Paste Client Secret.
   - Save.

## Facebook

1. Go to Meta for Developers.
2. Create or select the Best Swim app.
3. Add/configure the Facebook Login authentication use case.
4. Make sure the app can request:
   - `public_profile`
   - `email`
5. In Facebook Login settings, enable:
   - Client OAuth Login
   - Web OAuth Login
6. Valid OAuth Redirect URI:

```text
https://nfsfxnjygfpnizxeyfod.supabase.co/auth/v1/callback
```

7. Copy the App ID and App Secret.
8. In Supabase > Authentication > Providers > Facebook:
   - Enable Facebook.
   - Paste App ID as Client ID.
   - Paste App Secret.
   - Save.
9. While the Meta app is in development mode, only users added as app roles/testers can sign in.
10. Move the app Live when public login is ready.

## Apple

Apple is the most demanding provider. You need an active Apple Developer account.

1. Go to Apple Developer > Certificates, Identifiers & Profiles.
2. Create or use an App ID with Sign in with Apple enabled.
3. Create a Services ID for Best Swim web login.
4. Configure Sign in with Apple for that Services ID.
5. Website domain for the Supabase OAuth flow:

```text
nfsfxnjygfpnizxeyfod.supabase.co
```

6. Return URL:

```text
https://nfsfxnjygfpnizxeyfod.supabase.co/auth/v1/callback
```

7. Create/download the Apple private key needed for Sign in with Apple.
8. Keep the following values:
   - Services ID / Client ID
   - Team ID
   - Key ID
   - Private key
9. In Supabase > Authentication > Providers > Apple:
   - Enable Apple.
   - Paste the required Apple values.
   - Save.

Apple may only provide the user's full name during the first authorization. Store names in the `profiles` table later if Best Swim needs reliable identity fields.

## Test Checklist

For each provider:

1. Open:

```text
http://localhost:3000/es/clientes
```

2. Click the provider button.
3. Complete provider consent.
4. Confirm you return to:

```text
http://localhost:3000/es/clientes
```

5. Check Supabase > Authentication > Users.
6. Confirm a matching row exists in `public.profiles`.

## References

- Supabase Google provider: https://supabase.com/docs/guides/auth/social-login/auth-google
- Supabase Facebook provider: https://supabase.com/docs/guides/auth/social-login/auth-facebook
- Supabase Apple provider: https://supabase.com/docs/guides/auth/auth-apple
- Supabase sessions: https://supabase.com/docs/guides/auth/sessions
- Google OAuth clients: https://support.google.com/cloud/answer/6158849
- Apple Sign in with Apple environment: https://developer.apple.com/documentation/signinwithapple/configuring-your-environment-for-sign-in-with-apple
