# Capistor commerce: setup and operation

This branch adds a storefront and authenticated commerce backend to the existing Vite/Vercel site. It retains Supabase and uses a private Cloudflare R2 bucket. Checkout and legal approvals default off. No sample downloadable product is sold as if it were a real release.

## 1. Database and accounts

Use an isolated Supabase staging project if available. Back up the existing database and review current policies before applying migrations to production. Apply `0001_init.sql` only for an empty installation. Apply `0002_commerce.sql`, then `0003_blog.sql`, once in order. Migration 0002 is transactional and introduces commerce tables, transactional payment/signature functions, audit immutability and MFA-based staff authorization. It changes the existing `is_admin()` helper; legacy admin writes will require MFA thereafter. Migration 0003 preserves existing editorial tables and content while replacing their policies with MFA-protected policies.

The existing verified `shoaib@capistor.com` user is bootstrapped as staff only if present when migration 0002 runs. If not, the owner must first sign in, then a database administrator must explicitly add that verified user's UUID to `staff_members`. Never grant admin based on a client-supplied email or user metadata. Admin login requires an authenticator code (AAL2); clients use verified email links. Enable and test Supabase TOTP. Configure Site URL and exact allowed redirect URLs for the staging and production `/login` routes. Avoid broad production wildcards. Configure a production SMTP sender for reliable client sign-in; Supabase's built-in test sender has limitations.

Keep service keys on the server. Set the variables documented in `.env.example`, in Vercel Preview for staging, and separately in Production. The existing public VITE variables can be shared with the browser; the service role must never have a VITE prefix. Public account registration does not confer staff access.

## 2. R2 private files

Create a private bucket such as `capistor-private-staging`, with public R2.dev access and custom public domains disabled. Use a bucket-scoped credential permitting the required object read/write/copy/delete operations; do not use an account-wide administrator token. Configure CORS for exact app origins only:

```json
[{"AllowedOrigins":["http://127.0.0.1:5173","https://YOUR-PREVIEW-HOST"],"AllowedMethods":["PUT","GET","HEAD"],"AllowedHeaders":["content-type","content-length"],"ExposeHeaders":["etag"],"MaxAgeSeconds":300}]
```

Use a separate production bucket/credential and production origins at launch. Add a lifecycle rule deleting `staging/` objects after one day. Keep `private/` objects according to the published retention policy. Configure account usage alerts and monitor storage/requests. The API limits upload count and file size; signed object URLs are bearer links and can be replayed until they expire, so infrastructure billing alerts still matter.

Uploads have a 25 MB limit, restricted filename extensions, server-verified size and SHA-256, and promotion of the exact verified bytes from an upload-only staging key to an immutable private key. Download links expire after 60 seconds. Project files require both NDA signatures before upload. Do not enable public bucket access to make CORS work.

There is no automatic malware engine included. Every new upload is quarantined. Administrators retrieve it for isolated scanning/review, record findings against its exact hash, then approve or reject it. ZIPs and engineering formats can contain malicious content; scan archive contents and use an isolated workstation. Rejected/quarantined files cannot be downloaded by clients. Product downloads and company deliverables require confirmed payment. Refunds/disputes suspend access.

## 3. Stripe Payments, wallets, invoices and Tax

See `stripe-integration-plan.md`. Hosted Checkout dynamically offers eligible cards, Link, Apple Pay and Google Pay; no card data enters this app. Wallets still use Stripe as processor. Enable desired methods in Stripe Dashboard and test with eligible devices. Complete business onboarding before live mode.

Register a sandbox webhook at `https://YOUR-PREVIEW-HOST/api/commerce?action=stripe-webhook`. Subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.paid`, `charge.refunded`, and `charge.dispute.created`. Set the returned endpoint signing secret only in the matching environment. Local forwarding can use `stripe listen --forward-to 'http://127.0.0.1:3001/api/commerce?action=stripe-webhook'`; use the listener's distinct signing secret. Do not expose a signing secret in logs or client code.

The success page only displays progress. Signed webhooks retrieve authoritative Stripe state and settle the server order once. Amount and currency must match. Checkout creates paid invoices, not a second payable invoice. PDFs and hosted invoice links appear in the order. Additional payments, refunds, and disputes remain in the record and need human reconciliation where appropriate. An expired Checkout can be replaced after Stripe confirms expiry; an ambiguous older request is blocked rather than risking a duplicate charge.

For manual tax, the owner chooses an appropriate rate, which appears as a separate Stripe tax rate. For automatic Stripe Tax, configure active Tax settings and registrations and select a product tax code from the loaded Stripe catalogue. Stripe requires a shipping/use address to offer Google Pay alongside automatic Tax. Checkout explains that this address is for digital/service use and tax, and that nothing will be physically shipped. Automatic mode uses tax-inclusive prices so the signed total stays fixed; it disables external bank/BTC options for that order. No tax registrations are automatically created. The owner and accountant must establish obligations and classifications. Stripe invoices alone do not establish compliance with any applicable e-invoicing requirements.

Refunds and dispute handling are performed in Stripe Dashboard, then reflected by webhook. Test successful, failed and delayed payment, retries, full/partial refund, dispute, and invoice delivery before enabling live mode. Keep sandbox orders out of production fulfillment. `STRIPE_MODE=test` (the default) disables real bank/BTC instructions. Vercel Production rejects test payments, and Preview rejects live payments. At launch, set both `STRIPE_MODE=live` and `VITE_PAYMENT_MODE=live` alongside live secrets. Preview can omit APP_ORIGIN to use its exact Vercel branch origin; production must configure it explicitly.

## 4. Bank, Bitcoin and Fiverr

Bank details are a server-only JSON secret shown only to the authenticated order owner when payment is due. The stored order reference, currency and amount accompany instructions. An MFA-authenticated administrator confirms exact cleared funds and a bank transaction reference; uploaded receipts never mark an order paid. Do not send USD/EUR/GBP to the account without confirming the account supports that currency.

Bitcoin is disabled until a BTCPay URL, store ID, API credential and webhook secret exist. Configure the settled-invoice webhook at `/api/commerce?action=btcpay-webhook`. The server validates the raw HMAC and retrieves the invoice from the configured store. Underpayments, overpayments and uncertain creation require reconciliation. Test this separately before enabling. Payment routes are locked once started, including bank transfer. Switching after a pending or uncertain attempt currently requires operator reconciliation; there is no self-service route cancellation. Verify provider expiry/cancellation and cleared funds before a database administrator releases a pending attempt. Do not simply change payment_status to bypass the lock.

Fiverr links are an external route, with its own terms, scope and fees. Capistor does not advertise itself as an escrow provider. Do not mirror payment status from a screenshot, and do not ask a client to pay twice. The original Fiverr reviews remain on their attributable profile rather than being converted into an unsupported company rating.

## 5. Policies and agreements

In `/admin/commerce`, enter legal company details and policies, then approve them only after review. Add the registry verification URL and a redacted licence copy if appropriate. Never publish passport/Emirates ID numbers, private signatures or unredacted personal documents.

Complete and review NDA/contract templates, including governing law, dispute forum, liability, warranty, IP transfer, third-party licences, confidentiality duration, change requests, cancellation, acceptance and retention. Templates are drafts; this application does not certify legal enforceability. Per-client drafts are generated from the frozen order/brief and must be reviewed and issued by the owner. Both parties sign the exact version with explicit electronic consent. A new version never overwrites signatures. Quotes lock after a contract signature; agreements lock when payment starts. For material changes after signing, create a separately agreed new order.

The normal service flow is request → scope → both NDA/contract signatures → payment → kickoff → updates → review → completion. Uploads can begin once the NDA is signed, before payment; released company deliverables require payment. Milestones can be separate scoped orders. JSON exports contain the full visible record, documents, signatures and file metadata; CSV exports contain the dated history. Files are downloaded individually, not embedded in the export. Exports use safe CSV escaping and UTC timestamps.

## 6. Catalogue, editorial and reach

Add services or digital products in `/admin/commerce`. Set prices in ordinary currency units, scope/file list, limitations, compatible software, version and licence. Save a digital product, upload and approve its real files, then enable checkout. Price/licence updates do not rewrite existing orders. Publish practical articles through the existing `/admin/blog` editor. Keep claims attributable; avoid fabricated testimonials, certifications or guarantees.

Builds prerender public marketing pages, introductory articles, published CMS articles and published products with route-specific canonical tags and a sitemap. Rebuild after publishing to update indexable HTML; current catalogue and articles also load from Supabase in the browser. Submit the deployed sitemap to Search Console after launch. Avoid submitting preview URLs.

Set `VITE_GA_MEASUREMENT_ID=G-R7RH1P15MH` in Production if retaining the existing property. First disable **Enhanced Measurement** for that GA4 web stream, including history changes, forms and downloads. Only then set `VITE_GA_MANUAL_ONLY=true`; the app does not load Analytics without this confirmation. [Google documents](https://developers.google.com/analytics/devguides/collection/ga4/views) that enhanced history tracking can fire even with `send_page_view: false`. Optional analytics wait for consent, send public paths without query strings and exclude login, admin and client-order routes. The existing property previously showed no received data, so zero reported traffic was not proof of zero visitors. Confirm a real consented public page view in Realtime after deployment. Do not enable advertising signals or send briefs, filenames, email addresses, document text or bank details to Analytics.

## 7. Hosting and validation

The observed Vercel account was on Hobby. Vercel documents Hobby as personal/non-commercial; arrange an appropriate commercial plan or approved alternative before running the paid business site: https://vercel.com/docs/plans/hobby. No upgrade is performed by this code. Supabase's free project was paused during inspection, which explained failed data fetches; account for availability and backups before promising client access.

Local commands: `npm ci`, `npm run dev:api` in one terminal, `npm run dev` in another. Set APP_ORIGIN to the exact browser origin. Run `npm run typecheck`, `npm test`, `npm run build`, and `npm audit --omit=dev`. Tests include real local PostgreSQL migrations/RLS/transaction behavior via PGlite, plus payment and upload policy tests. They do not replace a connected end-to-end test of Supabase email/MFA, R2 CORS/uploads and delivered Stripe webhooks.

Deployment environment check: no secrets in VITE variables; correct origins and auth redirects; private bucket; endpoint-specific signing secret; disabled checkout until policies, files, provider setup and actual sandbox flows have been verified. Retain database backups and provider reconciliation procedures. Do not treat an isolated unit test or successful Checkout creation as proof that the whole live order lifecycle works.
