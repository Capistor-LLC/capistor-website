# Domain launch status — 26 November 2026

## Confirmed

- Cloudflare registration for `capistortechnologies.com` is active, expiring 26 November 2027. Purchase cost: $11.17. The original $20 setup budget leaves $8.83; no additional paid plans were purchased.
- Resend sending domain added in Tokyo. Cloudflare now has its provider-specified DKIM TXT record at `resend._domainkey`, DNS-only CNAME `rsend` → `rsend-apne1.forge.rmta.net`, and DNS-only CNAME `send` → `send.forge.rmta.net`.
- DMARC TXT `_dmarc` is `v=DMARC1; p=none;` (monitoring, not enforcement).
- All four records resolve in public DNS. Resend verification was pending at the last dashboard check. This is not proof of email delivery.
- Zoho's Forever Free signup is prepared using the owner's name and recovery email. Account creation, password, terms acceptance, and activation remain user steps. No mailbox or Zoho MX records exist yet.

## Required before launch

1. Complete Zoho account creation on the free plan. Verify the domain using the exact records supplied by the regional Zoho console, create the owner's mailbox and support/inquiry aliases, then configure its MX, SPF and DKIM. Leave Resend's `send` and `rsend` records intact.
2. Confirm Resend verification, configure the new sender and authenticated SMTP, and prove automated sign-in and paid-order emails reach the owner. Do not confuse the earlier manually sent sample ZIP with automatic website delivery.
3. Resolve commercial hosting within budget. Existing Vercel Hobby is not the launch hosting solution; Cloudflare Workers compatibility still needs implementation and validation. No migration has been deployed.
4. Connect the domain to the validated host, configure TLS, APP_ORIGIN, Supabase redirects, R2 CORS, Stripe webhook URL, canonical URLs and sitemap. The website still contains old-domain references; change them as part of this coordinated cutover.
5. Repeat authenticated ordering, payment webhook, private file delivery, consultation booking and billing portal checks on the final origin. Production payment methods remain disabled until these checks pass.
6. Real digital product release bundles remain a separate launch blocker. Staging samples must not become paid production deliverables.

Do not mark the business email, automatic delivery, hosting migration or launch complete based only on domain registration or DNS propagation.
