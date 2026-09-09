# Best Swim GDPR and Cookie Compliance Register

Version: 2026-05-27
Owner: Best Swim
Status: Working compliance register. Review with qualified legal counsel before production launch.

## Purpose

This register keeps a controlled record of privacy, personal-data and cookie-compliance decisions for Best Swim. It should be updated whenever the website adds a new provider, cookie, tracking purpose, payment flow, authentication provider, data field or marketing workflow.

## Public Policies

- Privacy policy route: `/es/politica-de-privacidad` and `/en/politica-de-privacidad`
- Cookie policy route: `/es/politica-de-cookies` and `/en/politica-de-cookies`
- Cookie preference center: sitewide banner and footer preference button
- Current policy date: 2026-05-27

## Controller Details To Complete Before Launch

- Legal business name: TBD
- NIF/CIF or registered business identifier: TBD
- Registered address: TBD
- Privacy contact email: TBD
- Data Protection Officer: TBD, only if legally required
- Supervisory authority for Spain: Agencia Española de Protección de Datos (AEPD)

Do not launch paid subscriptions or user accounts until the controller identity and privacy contact details are completed in the public policy.

## Processing Activities

| Activity | Data Categories | Purpose | Legal Basis | Main Providers | Retention |
| --- | --- | --- | --- | --- | --- |
| Contact and lead forms | Identity, contact, message, sports goal | Reply to requests and manage interest | Consent, legitimate interest or pre-contractual steps | Supabase, hosting/email provider TBD | Until request is resolved, then business/legal limitation period |
| Client account and SSO | Identity, email, auth identifiers, locale | Login, account access, security | Contract or pre-contractual steps | Supabase Auth, Google, Facebook, Apple | While account is active plus legal/security retention |
| Membership and billing | Identity, contact, Stripe customer ID, subscription status | Checkout, invoices, cancellation, access control | Contract and legal obligations | Stripe, Supabase | Legal accounting/tax period and contractual limitation period |
| Training portal access | User ID, subscription status, viewed content, training interest | Deliver protected content and weekly training | Contract, legitimate interest | Supabase | While membership/account is active, then limited historical audit |
| Swim camp interest | User ID, contact, interest flag, event name | Notify interested logged-in clients | Consent or legitimate interest | Supabase | Until event closes or user withdraws interest |
| Security logs | IP, device/browser metadata, auth events | Security, fraud prevention, abuse prevention | Legitimate interest and legal obligations | Hosting, Supabase, Stripe | Short operational retention unless incident requires longer |
| Cookies and preferences | Consent choices, timestamp, version | Store cookie choices and avoid repeated prompts | Legal obligation and consent for non-essential cookies | Browser local storage and first-party cookie | Up to 180 days in current implementation |

## Cookie Consent Rules

- Strictly necessary cookies may run without prior consent when required for security, session or requested services.
- Analytics, performance, enhanced functionality and marketing cookies must not load before consent.
- The user must be able to accept all, reject non-essential cookies and configure preferences with comparable visibility.
- Consent must be specific by purpose, freely given and reversible.
- Store the consent version and timestamp so policy changes can trigger a new consent request.
- Run a cookie scan before launch and after each new provider integration.

## Current Cookie Preference Implementation

- Storage key: `bestswim_cookie_consent_v1`
- Cookie name: `bestswim_cookie_consent`
- Version: `2026-05-27`
- Retention: 180 days
- Categories:
  - Necessary: always active
  - Analytics: optional
  - Marketing/functionality: optional

## Security Measures

- Use Supabase Row Level Security for profile, subscription and training-content access.
- Use Stripe Customer Portal for billing changes instead of storing payment card data locally.
- Keep service role keys server-side only.
- Validate Stripe webhooks with signatures.
- Use least-privilege admin access for content publishing.
- Keep dependencies patched and review production environment variables before launch.
- Back up database content and define recovery procedures.

## Data Subject Rights Procedure

Requests may include access, rectification, erasure, restriction, portability, objection and withdrawal of consent.

Internal handling:

1. Verify the requester's identity when necessary.
2. Log request date, scope and channel.
3. Confirm whether Best Swim is controller for the requested data.
4. Export, correct, delete or restrict data where legally appropriate.
5. Reply within the applicable GDPR deadline.
6. Preserve evidence of the response and any lawful refusal.

## Breach Response

If a personal-data breach is suspected:

1. Contain the incident and preserve evidence.
2. Identify affected systems, data categories and users.
3. Assess risk to individuals.
4. Notify the supervisory authority when legally required.
5. Notify affected users when legally required.
6. Document root cause, mitigation and preventive actions.

## Launch Blockers

- Complete controller identity and privacy contact details.
- Confirm final providers and sign/review data-processing terms where required.
- Decide whether newsletters or marketing automation are active at launch.
- Complete production cookie scan.
- Confirm no analytics, pixels or embedded media set non-essential cookies before consent.
- Have the privacy and cookie policies reviewed by qualified legal counsel.
