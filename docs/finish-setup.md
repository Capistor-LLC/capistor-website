# Finish the Capistor staging setup

## What is implemented

The new storefront, editable service/digital product catalogue, password and social-provider-ready client login, MFA-protected staff workspace, order history and exports, versioned NDA/contracts, negotiation records, support/dispute tickets, consultation calendar, private-file workflows, and Stripe/bank/optional BTCPay integrations are on `codex/storefront-client-portal`. Suggested service prices are USD 99, 249, and 750 starting price; change these in the workspace. Three preview products are included at USD 79, 29 and 59. Their visuals and file lists are examples: replace and approve the final private bundles before enabling product checkout.

This is a connected staging build, **not a completed live payment launch**. On 14 November 2026, `capistor-staging` was migrated and connected to the protected Vercel Preview, the private `capistor-private-staging` R2 bucket was connected with a bucket-scoped credential and exact-origin CORS, and a Stripe sandbox webhook was registered. Production variables and the production Supabase project were not changed. Test keys remain Preview-only.

## 1. Supabase staging status

The project reference is `bzkmfhjsqcttyrvbasjj`. Preview uses dedicated `VITE_STAGING_SUPABASE_URL` and `VITE_STAGING_SUPABASE_ANON_KEY` variables when `VITE_PAYMENT_MODE=test`, so the existing shared production browser variables remain untouched. The server URL and secret are stored only in Preview/server configuration. Do not commit `.env.local` or copy the staging secret into a `VITE_` variable.

The following migrations were applied successfully, in order:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_commerce.sql`
3. `supabase/migrations/0003_blog.sql`

The exact Preview `/login` callback plus `127.0.0.1` and `localhost` development callbacks are allowlisted. The Site URL is the protected branch Preview. Back up and inspect the existing production schema before any production migration. Never rerun 0001 after 0002 on an established installation: 0002 replaces the legacy admin helper with the MFA version.

Email/password and email-link login are available, but configure your own SMTP sender before inviting clients. Google and Apple buttons require their provider credentials in Supabase. The designated owner is `krish.shoaib55@gmail.com`. Sign in with that verified account, choose **Activate owner workspace**, and enable/test TOTP. Migration 0004 also promotes that exact verified account when it already exists. The equivalent manual recovery query is:

```sql
insert into public.staff_members(user_id,email,display_name,role,active)
select id,lower(email),'Shoaib Mustafa','owner',true from auth.users
where lower(email) = 'krish.shoaib55@gmail.com'
and email_confirmed_at is not null
on conflict(user_id) do update set role='owner',active=true;
```

Refresh the site and open `/admin/commerce`; enroll an authenticator when prompted. Keep its recovery arrangements outside the source repository. Clients do not need staff access.

## 2. Cloudflare R2 staging status

`capistor-private-staging` exists with R2.dev access and custom public domains disabled. Its credential is limited to object read/write/list operations on that bucket. `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY` are stored locally and in Vercel Preview only. Create a separate production bucket and credential later.

Exact-origin CORS permits `PUT`, `GET` and `HEAD` only from the branch Preview and `http://127.0.0.1:5173`. The connected flow was tested with a real presigned PUT: the server verified size and SHA-256, promoted the exact bytes to `private/`, recorded the upload event, marked the file `quarantined`, and removed the disposable test object. Add a lifecycle rule deleting abandoned `staging/` objects after one day. Files under `private/` must follow the published retention policy. Uploads remain quarantined until the owner scans/reviews them and records the outcome; an automatic malware-scanning service is not included.

## 3. Connect Stripe sandbox

The CLI/plugin and official implementation plan are installed. A genuine sandbox Checkout session was created successfully with invoices and dynamic payment methods. The protected Preview webhook now subscribes to the five required events and a signed end-to-end delivery probe returned HTTP 200; a deliberately invalid signature returned HTTP 400. No card payment, refund or dispute was completed during this setup.

The existing test key, `STRIPE_MODE=test`, `VITE_PAYMENT_MODE=test`, explicit branch `APP_ORIGIN`, and endpoint signing secret are Preview-only. The webhook uses Vercel's project automation-bypass query parameter because Preview remains login-protected; Stripe signatures are still verified from the raw request body. Rotate both secrets together if either URL is exposed.

```text
https://YOUR-PREVIEW-HOST/api/commerce?action=stripe-webhook
```

The endpoint subscribes to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.paid`, `charge.refunded`, and `charge.dispute.created`. Hosted Checkout uses dynamic payment methods, so eligible Apple Pay, Google Pay and Link options are displayed by Stripe. Test each wallet on a compatible device. These wallets still use Stripe's processing and fees; they are not alternative processors.

Tax settings existed, but no active Tax registrations were observed. Confirm obligations and registrations with your accountant before using automatic Tax. Select each product's appropriate tax code. Automatic Tax prices are inclusive so signed totals remain fixed. No registration was created automatically.

Bank/BTC are disabled in test mode. Bank details are already kept in ignored local server configuration; copy them privately to production secrets only when launching. Confirm which currencies the bank account accepts. BTCPay still needs a provider/store, credentials and separate webhook tests. Route switching after payment starts requires operator reconciliation.

## 4. Finish your content and commercial terms

In `/admin/commerce`:

- Set company information, a verified registry link, and an appropriately redacted licence. Your real portrait and original Fiverr profile are already used.
- Set final service prices, turnaround assumptions, scope and exclusions.
- The customer terms, privacy policy, refund/quality guarantee, mutual NDA and engineering-services template are populated and versioned. Have the final production wording reviewed for Capistor's precise licence, tax position and target customer jurisdictions before live launch. Project-specific documents remain reviewable and versioned; objections and decisions are immutable.
- Configure Supabase Google and Apple OAuth clients, a production SMTP sender, an SMS provider for active phone verification, and a meeting provider if call links must be generated automatically. Until those providers are connected, the staff calendar records appointments and staff can add the meeting URL.
- Replace the three preview product bundles with the final private releases, make sale-source repositories private, scan/approve each R2 bundle, and only then enable product checkout.
- Add your real digital files, screenshots, compatible software, versions, licence and prices. Upload and approve files before enabling product checkout.
- Add a Vercel deploy hook as `VERCEL_DEPLOY_HOOK` if you want the workspace's **Publish page updates** button and blog publishing to rebuild search-visible pages.

Publish useful posts through `/admin/blog`. The legacy newsletter function's source now requires staff membership and MFA; deploy that updated function before using newsletter sending. No newsletters were sent during this work.

## 5. Validate and launch

Run locally:

```sh
npm ci
npm run check:setup
npm run typecheck
npm test
npm run build
npm audit
```

`check:setup` reports names of missing variables without printing secrets. The local ignored environment and Vercel Preview now contain Supabase, R2, Stripe and webhook configuration. For local testing, run `npm run dev:api` and `npm run dev` in separate terminals.

Connected checks completed: public catalogue, test-mode guards, disposable verified client login, authenticated order listing, protected webhook signature handling, R2 access, browser CORS, presigned upload, exact checksum promotion, quarantine and audit-event creation. Disposable object data was removed; immutable test audit records remain clearly labelled in the isolated staging database by design. Still complete one service and one real digital-product purchase in staging: owner MFA, owner/client NDA and contract signatures, successful and failed test payments, invoice links, paid download, refund/dispute, cross-client denial and JSON/CSV exports. Test wallets on compatible devices.

The final 4K PCB hero and edge blending were visually checked at desktop and 390 px mobile widths. The home, services, shop, portal/login, journal, about and service-detail routes had no horizontal overflow at the mobile breakpoint.

Use a hosting plan permitting commercial use before accepting real sales; the observed Vercel account was Hobby. Finish Stripe business verification. Use a separate live Supabase project/bucket/keys and live webhook, set `STRIPE_MODE=live`, `VITE_PAYMENT_MODE=live`, and an explicit HTTPS `APP_ORIGIN`, then recheck the live configuration before enabling product checkout. No paid plan upgrade, production merge, or live-charge activation was performed here.

For analytics, disable **Enhanced Measurement** in the existing GA4 stream first, then set production `VITE_GA_MEASUREMENT_ID=G-R7RH1P15MH` and `VITE_GA_MANUAL_ONLY=true`. Verify a consented public page view; keep client/admin paths excluded. Submit the production `/sitemap.xml` in Search Console after launch. Previous zero GA readings reflected missing data and are not reliable evidence of zero visitors.

Technical follow-ups: full-repository lint still contains old typing/unused-variable issues in legacy components; the new commerce code has its own clean lint command. Large lazy-loaded legacy editor chunks remain. Automatic virus scanning, automated backups/restore drills, pending-payment route cancellation, and post-payment contract amendments are future improvements. Files are downloaded individually; exports contain records and file metadata, not a ZIP of all deliverables.

See `launch-runbook.md` for the operational detail and `stripe-integration-plan.md` for the Stripe decisions.
