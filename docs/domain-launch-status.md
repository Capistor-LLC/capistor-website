# Domain launch status — 26 November 2026

## Confirmed

- Cloudflare registration for `capistortechnologies.com` is active, expiring 26 November 2027. Purchase cost: $11.17. The original $20 setup budget leaves $8.83; no additional paid plans were purchased.
- Resend sending domain added in Tokyo. Cloudflare now has its provider-specified DKIM TXT record at `resend._domainkey`, DNS-only CNAME `rsend` → `rsend-apne1.forge.rmta.net`, and DNS-only CNAME `send` → `send.forge.rmta.net`.
- DMARC TXT `_dmarc` is `v=DMARC1; p=none;` (monitoring, not enforcement).
- All four records resolve in public DNS. Resend now reports the domain verified and ready to send. This is not proof of email delivery.
- Zoho Mail Free is active (5 user licenses, 5 GB owner mailbox). Created `shoaib@capistortechnologies.com`, with `inquiry@` and `support@` aliases delivering into the same mailbox. Zoho reports all MX/SPF/DKIM records verified.
- Public DNS resolves MX 10 `mx.zoho.com`, MX 20 `mx2.zoho.com`, MX 50 `mx3.zoho.com`; root SPF authorizes `zohomail.com`, and `zmail._domainkey` contains Zoho's generated DKIM key.
- Updated current application contact/policy addresses in both databases and source. Existing order documents were not rewritten. Vercel Production and Preview `NOTIFICATION_FROM` now use `Capistor Technologies <support@capistortechnologies.com>`. Preview `ALLOW_SANDBOX_EMAIL=true` is enabled for the requested owner delivery test. A deployment is required to apply environment changes.

## Required before launch

1. Prove mailbox send/receive and alias delivery. Leave Resend's `send` and `rsend` records intact.
2. Confirm Resend verification, configure the new sender and authenticated SMTP, and prove automated sign-in and paid-order emails reach the owner. Do not confuse the earlier manually sent sample ZIP with automatic website delivery.
3. Resolve commercial hosting within budget. Existing Vercel Hobby is not the launch hosting solution; Cloudflare Workers compatibility still needs implementation and validation. No migration has been deployed.
4. Connect the domain to the validated host, configure TLS, APP_ORIGIN, Supabase redirects, R2 CORS, Stripe webhook URL, canonical URLs and sitemap. The website still contains old-domain references; change them as part of this coordinated cutover.
5. Repeat authenticated ordering, payment webhook, private file delivery, consultation booking and billing portal checks on the final origin. Production payment methods remain disabled until these checks pass.
6. Real digital product release bundles remain a separate launch blocker. Staging samples must not become paid production deliverables.

Do not mark the business email, automatic delivery, hosting migration or launch complete based only on domain registration or DNS propagation.

## Automated email test outcome

The real deployed sandbox webhook was replayed for owner order `CAP-95A6C9A6D4`. Settlement remained valid, but all three permitted email attempts were rejected. The latest deployment exposes a sanitized provider diagnostic: the API key is associated with an unverified domain. The old key must be replaced with a sending-only key scoped to the newly verified domain. No automated delivery success is claimed. Review this rejected notification and reconcile the provider record before authorizing another attempt; do not bypass the retry ceiling silently.

Source/contact updates and sanitized email diagnostics are on main and the staging branch (through `48a03fc`). Cloudflare hosting preparation and local audit evidence are documented in `cloudflare-hosting.md`.
