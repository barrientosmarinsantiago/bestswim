# Best Swim

Clean Next.js rebuild for Best Swim: bilingual landing page, Supabase Auth, Stripe subscriptions, and an admin-ready weekly training content model.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn-style primitives
- Framer Motion
- Supabase Auth, Postgres, RLS
- Stripe Checkout, Customer Portal, webhooks

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Add Supabase and Stripe values in `.env.local`.

4. Run the Supabase schema in `docs/supabase-schema.sql`.

5. Start development:

```bash
npm run dev
```

The Spanish landing page is at `/es`; `/` redirects to `/es`, and English is available at `/en`.

## Production Notes

- Configure Supabase OAuth providers for Google, Facebook, and Apple.
- Add redirect URLs for `https://bestswim.es/es/auth/callback` and `https://bestswim.es/en/auth/callback`.
- Configure Stripe monthly and annual Price IDs.
- Set the Stripe webhook endpoint to `/api/stripe/webhook`.
- Follow `docs/stripe-setup.md` for the Checkout, Customer Portal, and webhook setup.
- Promote admin users by setting `profiles.role = 'admin'` in Supabase.
