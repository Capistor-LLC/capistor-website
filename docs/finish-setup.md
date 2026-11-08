# Finish the Capistor staging setup

## What is implemented

The new storefront, editable service/digital product catalogue, verified client login, MFA-protected business workspace, order history and exports, versioned NDA/contracts, private-file workflows, and Stripe/bank/optional BTCPay integrations are on `codex/storefront-client-portal`. The home hero uses the existing 3840×2160 PCB close-up with CSS edge blending. Suggested service prices are USD 99, 249, and 750 starting price; change these in the workspace. No invented digital products are offered for sale.

This is a review build, **not a completed live payment launch**. The new Supabase project was created by the owner, but its reference and keys have not been connected. R2 activation/bucket setup has not been verified. The dashboard-control tool became unavailable, so those account steps could not be completed in this pass. The old production database was asked to resume; its final restoration state was not verified. Do not apply staging payment data or test keys to the live database.

## 1. Connect the new Supabase project

In **capistor-staging → Settings → API**, take its Project URL and public publishable/anon key. Put them in local `.env.local` and Vercel **Preview only** as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Set the same URL as `SUPABASE_URL`. Put the service-role/secret API key only in `SUPABASE_SERVICE_ROLE_KEY` (server-only, never `VITE_`). Use `.env.example` as the checklist; do not overwrite existing local Stripe/bank values or commit the file.

In the new project's SQL Editor, run these files once, in order:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_commerce.sql`
3. `supabase/migrations/0003_blog.sql`

These instructions are for the empty staging project. Back up and inspect the existing production schema before any production migration. Never rerun 0001 after 0002 on an established installation: 0002 replaces the legacy admin helper with the MFA version.

In Authentication, enable email login and TOTP, set the staging Site URL, and allow the exact staging `/login` callback. Add `http://127.0.0.1:5173/login` for local testing. Configure your own SMTP sender before inviting clients. Sign in with your owner email. If no owner existed when migrations ran, execute:

```sql
insert into public.staff_members(user_id)
select id from auth.users
where lower(email) = 'shoaib@capistor.com'
  and email_confirmed_at is not null
on conflict do nothing;
```

Refresh the site and open `/admin/commerce`; enroll an authenticator when prompted. Keep its recovery arrangements outside the source repository. Clients do not need staff access.

## 2. Connect Cloudflare R2

Finish the R2 subscription activation if still pending. Create `capistor-private-staging` with public R2.dev access and public custom domains disabled. Create a credential limited to that bucket's object read/write operations. Save `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY` in local and Vercel Preview secrets. Create a separate production bucket later.

Copy the exact CORS example from `launch-runbook.md`, replacing the preview hostname. Add a lifecycle rule deleting `staging/` objects after one day. Files under `private/` must follow the published retention policy. Uploads are quarantined; the owner must scan/review them and record the review before release. An automatic malware-scanning service is not included.

## 3. Connect Stripe sandbox

The CLI/plugin and official implementation plan are installed, and a genuine sandbox Checkout session was created successfully with invoices and dynamic payment methods. This was **not** a completed payment or webhook/fulfillment test.

Use the existing test key in Preview only. Set `STRIPE_MODE=test` and `VITE_PAYMENT_MODE=test`. Leave `APP_ORIGIN` unset on Vercel Preview to use the branch URL; locally use `http://127.0.0.1:5173`. Set Stripe's webhook to:

```text
https://YOUR-PREVIEW-HOST/api/commerce?action=stripe-webhook
```

Subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.paid`, `charge.refunded`, and `charge.dispute.created`. Put the endpoint's signing secret into `STRIPE_WEBHOOK_SECRET`. Enable and test eligible Apple Pay, Google Pay and Link methods in Stripe. These wallets still use Stripe's processing and fees.

Tax settings existed, but no active Tax registrations were observed. Confirm obligations and registrations with your accountant before using automatic Tax. Select each product's appropriate tax code. Automatic Tax prices are inclusive so signed totals remain fixed. No registration was created automatically.

Bank/BTC are disabled in test mode. Bank details are already kept in ignored local server configuration; copy them privately to production secrets only when launching. Confirm which currencies the bank account accepts. BTCPay still needs a provider/store, credentials and separate webhook tests. Route switching after payment starts requires operator reconciliation.

## 4. Finish your content and commercial terms

In `/admin/commerce`:

- Set company information, a verified registry link, and an appropriately redacted licence. Your real portrait and original Fiverr profile are already used.
- Set final service prices, turnaround assumptions, scope and exclusions.
- Complete and review terms, privacy, refund policy, NDA and project-contract templates. Resolve all placeholders before approval. Project-specific drafts require owner review and both signatures; the app does not promise legal enforceability.
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

`check:setup` reports names of missing variables without printing secrets. It currently reports missing Supabase, R2 and webhook configuration. For local testing, run `npm run dev:api` and `npm run dev` in separate terminals.

Complete one service and one digital-product purchase in staging: verified login, owner MFA, NDA/contract signatures, private upload, quarantine/approval, successful and failed test payments, signed webhook delivery, invoice links, paid download, refund/dispute, cross-client denial and JSON/CSV exports. Test wallets on compatible devices. A successful build or Checkout URL does not prove these connected flows work.

Check the final hero on desktop and mobile. Earlier layouts were visually inspected; the last 4K replacement and blending could not be re-screenshotted after dashboard/browser controls became unavailable.

Use a hosting plan permitting commercial use before accepting real sales; the observed Vercel account was Hobby. Finish Stripe business verification. Use a separate live Supabase project/bucket/keys and live webhook, set `STRIPE_MODE=live`, `VITE_PAYMENT_MODE=live`, and an explicit HTTPS `APP_ORIGIN`, then recheck the live configuration before enabling product checkout. No paid plan upgrade, production merge, or live-charge activation was performed here.

For analytics, disable **Enhanced Measurement** in the existing GA4 stream first, then set production `VITE_GA_MEASUREMENT_ID=G-R7RH1P15MH` and `VITE_GA_MANUAL_ONLY=true`. Verify a consented public page view; keep client/admin paths excluded. Submit the production `/sitemap.xml` in Search Console after launch. Previous zero GA readings reflected missing data and are not reliable evidence of zero visitors.

Technical follow-ups: full-repository lint still contains old typing/unused-variable issues in legacy components; the new commerce code has its own clean lint command. Large lazy-loaded legacy editor chunks remain. Automatic virus scanning, automated backups/restore drills, pending-payment route cancellation, and post-payment contract amendments are future improvements. Files are downloaded individually; exports contain records and file metadata, not a ZIP of all deliverables.

See `launch-runbook.md` for the operational detail and `stripe-integration-plan.md` for the Stripe decisions.
