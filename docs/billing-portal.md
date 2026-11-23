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
