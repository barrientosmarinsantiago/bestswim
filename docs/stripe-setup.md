# Stripe setup for Best Swim

Best Swim uses Stripe-hosted Checkout for Premium subscriptions and Stripe Customer Portal for billing changes. Card details stay in Stripe; the app stores only customer and subscription identifiers in Supabase.

## Dashboard setup

1. Create one Stripe product for the Premium membership.
2. Add two **recurring** prices to that product:
   - Monthly Premium — 22 EUR / month
   - Annual Premium — 240 EUR / year (20 EUR/month)
3. Create a second product for the Weekly Pass, with a **one-off** price:
   - Weekly Pass — 1 EUR, 7 days of access

   It must be a one-time price, not a recurring one. The checkout route sends the
   weekly plan in `mode: "payment"`, and Stripe rejects a recurring price there.
   The pass does not auto-renew: access is granted for 7 days and then lapses.
4. Copy the three Price IDs into the app environment:

```env
STRIPE_WEEKLY_PRICE_ID=price_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_ANNUAL_PRICE_ID=price_...
```

4. Enable Stripe Customer Portal in the Stripe Dashboard.
5. Create a webhook endpoint:

```text
https://bestswim.es/api/stripe/webhook
```

6. Subscribe the endpoint to these events:

```text
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
payment_intent.succeeded
```

7. Copy the webhook signing secret into the app environment:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

## App environment

Set these variables for local and production environments:

```env
NEXT_PUBLIC_SITE_URL=https://bestswim.es
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_WEEKLY_PRICE_ID=price_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_ANNUAL_PRICE_ID=price_...
NEXT_PUBLIC_WEEKLY_PRICE_LABEL=1 EUR / 7 dias
NEXT_PUBLIC_MONTHLY_PRICE_LABEL=22 EUR / mes
NEXT_PUBLIC_ANNUAL_PRICE_LABEL=240 EUR / ano (20 EUR/mes)
```

Use test-mode keys and test-mode Price IDs locally.

## Checkout flow

1. A visitor chooses the Weekly Pass, or monthly or annual Premium, on the landing page.
2. The portal keeps that selected plan through OAuth sign-in.
3. The authenticated user clicks the Stripe Checkout button.
4. Stripe redirects back to `/clientes?checkout=success`.
5. The webhook stores the subscription in `public.subscriptions`. The Weekly Pass has no
   subscription: it arrives as a one-off payment, so the entitlement is granted from the
   `checkout.session.completed` event and expires after 7 days.
6. The Customer Portal button lets members manage payment methods, invoices, and cancellation.
