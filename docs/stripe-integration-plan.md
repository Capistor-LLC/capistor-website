# Capistor Stripe integration

Generated and reviewed with the official `stripe_implementation_planner` MCP on 2026-11-07. Guide `iguide_61ViZtn3cD5rwWZ1r41Q80oe8JDf4` accepted hosted Checkout, web origin. Stripe CLI 1.55.8 and the Stripe agent plugin were installed using the requested commands.

## Architecture

Capistor sells its own services and files; Connect and subscriptions are unnecessary. The application owns authenticated orders, fixed quotes, scope, agreements, and file permissions. Hosted Checkout owns card entry, authentication, and eligible dynamic payment methods, including Apple Pay, Google Pay, and Link. Do not hardcode payment_method_types. Wallets are payment methods processed by Stripe, not separate fee-free processors. Verify current UAE fees before launch: https://stripe.com/ae/pricing.

Create sessions server-side from immutable order snapshots. Use a persistent attempt ID as an idempotency key. Confirm agreements before creating payment attempts, freeze financial scope once payment starts, and validate the provider's actual paid total/currency against the stored order. Never trust client totals or success-page parameters. A signed raw-body webhook and authoritative Stripe retrieval settle orders transactionally. Duplicate events do not duplicate delivery; additional payments require reconciliation. Refunds and disputes suspend downloads.

Use `invoice_creation.enabled` for automatic paid invoices for one-time Checkout purchases. Store invoice ID, PDF and hosted URL from verified Stripe events, available only to the order owner or MFA-authenticated staff. This avoids creating a second payable invoice. Custom/milestone work can use separately scoped orders. Independent manually issued Stripe invoices are not automatically matched to portal orders.

Tax modes are explicit: no tax collection, manually specified rate, or Stripe Tax with inclusive pricing. Automatic Tax needs active settings, an active registration, and an owner-selected product tax code. Never infer legal registration obligations or silently register a jurisdiction. Tax-inclusive Stripe prices keep the agreed payable total fixed. Automatic-tax orders use Stripe only; external bank/BTC options require their own configured tax treatment. Tax codes are loaded from Stripe. The owner must confirm classification and registration with their accountant.

Bank transfers use private bank instructions and an order reference. A receipt upload is not proof of settlement. Staff explicitly confirm actual cleared funds and exact amount/currency. Bitcoin uses a separately configured BTCPay server and verified settled invoices, disabled by default. Fiverr is an optional external ordering route, not a representation that Capistor holds escrow.

## Account checks (sandbox)

API authentication succeeded. Country AE; default currency AED; details_submitted false; charges_enabled false. Stripe Tax settings active; zero active tax registrations. These checks do not establish live readiness. Complete Stripe business verification and wallet settings in Dashboard. No registration was created and no real customer was charged.

## Relevant Stripe documentation

- Hosted Checkout: https://docs.stripe.com/payments/accept-a-payment?payment-ui=checkout&ui=stripe-hosted
- Post-payment invoices: https://docs.stripe.com/payments/checkout/post-payment-invoices
- Dynamic methods: https://docs.stripe.com/payments/payment-methods/dynamic-payment-methods
- Tax with Checkout: https://docs.stripe.com/tax/checkout
- Fulfillment: https://docs.stripe.com/checkout/fulfillment
- Webhooks: https://docs.stripe.com/webhooks

## Validation and launch

Test successful and failed payments, retries, signed/invalid webhooks, asynchronous confirmation, refunds/disputes, invoice delivery, authorization, and download access. Run the migration and configure secrets in staging before enabling checkout. Test Apple Pay on eligible Apple devices and Google Pay with an eligible wallet/browser; a desktop screenshot does not prove wallet eligibility. Live setup needs separate live keys and signing secret; rotate shared development secrets before public launch. Keep legal approvals, payment providers and product checkout disabled until the owner finishes setup.
