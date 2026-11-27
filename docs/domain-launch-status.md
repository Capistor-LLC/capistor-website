# Domain launch status — 26 November 2026

## Confirmed

- Cloudflare registration for `capistortechnologies.com` is active, expiring 26 November 2027. Purchase cost: $11.17. The original $20 setup budget leaves $8.83; no additional paid plans were purchased.
- Resend sending domain added in Tokyo. Cloudflare now has its provider-specified DKIM TXT record at `resend._domainkey`, DNS-only CNAME `rsend` → `rsend-apne1.forge.rmta.net`, and DNS-only CNAME `send` → `send.forge.rmta.net`.
- DMARC TXT `_dmarc` is `v=DMARC1; p=none;` (monitoring, not enforcement).
- All four records resolve in public DNS. Resend now reports the domain verified and ready to send. Automatic digital-delivery email has now been confirmed delivered (see evidence below).
- Zoho Mail Free is active (5 user licenses, 5 GB owner mailbox). Created `shoaib@capistortechnologies.com`, with `inquiry@` and `support@` aliases delivering into the same mailbox. Zoho reports all MX/SPF/DKIM records verified.
- Public DNS resolves MX 10 `mx.zoho.com`, MX 20 `mx2.zoho.com`, MX 50 `mx3.zoho.com`; root SPF authorizes `zohomail.com`, and `zmail._domainkey` contains Zoho's generated DKIM key.
- Updated current application contact/policy addresses in both databases and source. Existing order documents were not rewritten. Vercel Production and Preview `NOTIFICATION_FROM` now use `Capistor Technologies <support@capistortechnologies.com>`. Preview `ALLOW_SANDBOX_EMAIL=true` is enabled for the requested owner delivery test. A deployment is required to apply environment changes.

## Required before launch

1. Prove mailbox send/receive and alias delivery. Leave Resend's `send` and `rsend` records intact.
2. Custom Resend SMTP is saved in both Supabase projects. Paid-order email is verified delivered; sign-in/password recovery email still needs delivery testing.
3. Cloudflare staging is deployed and validated at https://capistor-staging.capistor-website.workers.dev. Production credential migration and domain cutover are still pending. No paid hosting subscription was enabled.
4. Connect the domain to the validated host, configure TLS, APP_ORIGIN, Supabase redirects, R2 CORS, Stripe webhook URL, canonical URLs and sitemap. The website still contains old-domain references; change them as part of this coordinated cutover.
5. Repeat authenticated ordering, payment webhook, private file delivery, consultation booking and billing portal checks on the final origin. Production payment methods remain disabled until these checks pass.
6. Real digital product release bundles remain a separate launch blocker. Staging samples must not become paid production deliverables.

Do not mark the business email, automatic delivery, hosting migration or launch complete based only on domain registration or DNS propagation.

## Automated delivery proof — 26 November 2026

Cloudflare deployed webhook returned HTTP 200 for the authentic Stripe test completion event for owner order `CAP-95A6C9A6D4`. The previously rejected notification was reconciled: all earlier attempts were HTTP 400, no accepted provider ID existed, and Resend showed no accepted email. One controlled retry was authorized in staging, with an immutable order event and the original failures retained in notification payload.

The retry succeeded using the approved new-domain sending key. Resend message `01a21945-5efc-713a-96ac-86b7123cd604` shows **delivered** to the owner's Gmail at 23:11 Dubai time. The email links to the authenticated Cloudflare order workspace.

A separate authenticated request to the deployed Worker downloaded the 76,179-byte steering sample ZIP from private R2. SHA-256 matched its database record. Another customer received HTTP 404 for the same file. Local evidence is in ignored `.local/delivery-proof/worker-result.json`.

The Worker needed asynchronous Stripe webhook verification; the synchronous SDK verifier rejected valid signatures under its Web Crypto build. This was corrected and covered by an async-crypto regression test that rejects altered and unsigned payloads. All 64 tests, type checking and commerce lint pass.

Staging Supabase Site URL and exact `/login` redirect now include the Cloudflare origin. All digital assets are still samples; this does not establish production product readiness or a real-money charge.

## Production hosting progress — 27 November 2026

Production Worker is deployed at https://capistor-production.capistor-website.workers.dev, separately from staging, using the production Supabase browser configuration. The server has encrypted production Supabase credentials, existing Stripe webhook signing secret and production-only R2 credentials. No paid hosting plan was enabled.

New-domain canonical/share/sitemap URLs are prepared. Production assets remain noindex until final cutover. APP_ORIGIN is currently the production workers.dev URL; no custom domain route has been attached. The live Stripe secret and Resend sending key are not yet installed in this Worker, and customer payments remain disabled in the production database.

Browser session restoration discarded one-time credential memory. A new approved production-only R2 key named `capistor-worker-production-deploy` was created and installed encrypted in the production Worker; the prior unused `capistor-worker-production-files` key should be revoked after checking no consumer uses it. Existing Vercel storage credentials were preserved.

The restricted Stripe key `capistor-cloudflare-commerce` exists but its one-time secret is unavailable. A replacement named `capistor-worker-production-deploy` is prepared with the same nine limited permissions: Checkout Sessions, Customers and Customer Portal write; Charges and Refunds, Payment Intents, Invoices, Products, Prices, and Tax Settings/Registrations read. Stripe requires account verification before creation/reveal can finish. No payouts, transfers, refund-write or webhook-management permissions were requested.

Next: complete Stripe verification and install its secret immediately; install a domain-scoped Resend sending key in production; configure exact production authentication callbacks and R2 CORS; validate production portal/checkout without charging a card; attach domain/TLS, update APP_ORIGIN and Stripe webhook URL, and enable indexing only on the final public origin. Release-ready digital bundles are still required before enabling their real-money sales.
