# Customer billing portal

Clients use **Your workspace → Manage billing with Stripe** to open a short-lived Stripe-hosted session. Stripe handles saved cards, billing details and invoices. No card numbers or CVCs are stored by Capistor.

Migration `0006_stripe_customers.sql` creates a server-only mapping from the authenticated Supabase user to a Stripe customer, separately for sandbox and live mode. Apply it before deploying this version. The endpoint accepts no customer ID or return URL from the browser. Customer creation uses a persisted reservation and Stripe idempotency; uncertain creations older than 23 hours require reconciliation rather than risking a duplicate profile.

Checkout reuses the mapped customer and offers Stripe's optional save-payment-method checkbox. It does not configure off-session charging. Billing edits remain in Stripe and do not change Capistor login credentials, frozen order details, or signed agreements. Legacy invoices created before this mapping remain linked from their individual order workspace; they are not automatically consolidated into the new Stripe customer.

Configure the portal separately in sandbox and live Stripe accounts: allow payment-method updates, invoice history and appropriate customer billing details. Disable subscription features unless subscriptions are actually introduced. `STRIPE_PORTAL_CONFIGURATION_ID` can select an explicit configuration; otherwise Stripe uses the account's default.

## Verification — 23 November 2026

- Applied migration to staging and confirmed it exists through the database API.
- 58 automated tests pass, including private mapping permissions, sandbox/live separation, identity reuse, retry expiry, trusted return URL, and optional card saving. TypeScript, commerce lint and production build pass.
- Created a real sandbox portal session and a sandbox Checkout session using the persistent customer. Stripe accepted optional card saving and invoice creation.
- Opened the hosted portal in a browser and successfully saved the sandbox Visa ending 4242 as the default payment method. No real card or real charge was used.
- Verified the deployed billing endpoint rejects anonymous access, ignores browser-supplied customer/return parameters, and creates the mapping for the authenticated QA customer.
- Saved live account's default portal configuration `bpc_1UeuQWLFAmiFFgyn84W6GiMf`.
- The live account `acct_1UZ81FLFAmiFFgyn` differs from the existing sandbox account. Production needs its own server key, webhook secret and production database/storage configuration; sandbox credentials must not be repurposed as live credentials.

Deploying source to main is separate from activating sales. Keep live checkout gated until production configuration and its webhook delivery are verified. Never record credentials or short-lived portal URLs in logs or committed files.

## Production wiring — 25 November 2026

- Restored the original production Supabase project and waited for Healthy status. Its five original content tables were present before applying commerce migrations 0002–0006 in one transaction; the resulting schema has 27 public tables.
- Seeded customer policies, NDA/contract templates, service descriptions and three digital previews. Payment-provider switches remain disabled pending production validation; digital downloads require approved release files.
- Saved the production database server credential and live Stripe webhook signing secret as Production-only Vercel secrets. Saved the live portal configuration and matching payment mode separately from Preview.
- Created live Stripe destination `we_1UfQUmLFAmiFFgynWPt2RILA` with the five events listed in the launch runbook. Its endpoint uses the publicly reachable main-branch Vercel alias until the custom domain is restored. Signed delivery still needs verification after deployment.
- Created private R2 bucket `capistor-private-production`, with public access disabled and CORS restricted to the production website origins. The owner installed its scoped Object Read & Write credentials in Production; the account ID and bucket configuration were subsequently saved. End-to-end upload verification must follow deployment.
- The custom domain did not resolve during this check. Production auth redirects, email delivery, storage access, live billing and the complete order flow remain launch checks. Do not interpret saved environment variables as proof of a successful deployment.

### Connected production checks

- Public catalog returns HTTP 200. An intentionally invalid webhook signature returns 400; a signed, non-transactional configuration probe returns 200. This checks signature handling, not Stripe-originated payment delivery.
- A dedicated internal QA customer can authenticate, list orders (200), and create a consultation request (200). Admin access is correctly denied (403). No payment or booking was made.
- The live billing endpoint creates a Stripe-hosted portal session (200) for that authenticated QA customer. No card or real charge was used.
- Corrected the production Supabase Site URL and added login callback allow-list entries for the exact production hosts, including recovery query parameters. Supabase still reports its built-in email service; custom SMTP and actual email delivery remain required before public signup.
