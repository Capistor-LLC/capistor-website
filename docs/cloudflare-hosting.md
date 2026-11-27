# Cloudflare hosting preparation

The existing Node commerce handler now runs through Cloudflare's Node HTTP adapter (`workers/index.mjs`). The checked-in Wrangler configuration is **staging only**, with test Stripe mode, automatic email enabled for the owner delivery test and indexing disabled. It is deployed at https://capistor-staging.capistor-website.workers.dev.

Run `npm run build:worker`, then `npm run dev:worker`. Local credentials belong in ignored, mode-0600 `.dev.vars`; never in Wrangler configuration. `npm run check:worker` checks the bundle without deploying. Worker environment variables populate `process.env` through the compatibility date's Node support.

The adapter preserves security headers, private/no-store responses for client/admin/API routes, API routing, public prerendered assets and legacy redirects. Missing asset files return 404. The preparation script removes the legacy catch-all `_redirects` file from the built output because it conflicts with Workers' HTML routing.

## Validation on 26 November 2026

- Wrangler bundle dry-run passed (about 488 KiB gzip).
- Local Workerd served home/services and private client routes; authenticated catalogue and orders worked.
- Customer admin access correctly returned 403.
- Four sample product/service orders, duplicate-request protection, document creation/signatures, messages and support cases worked against the staging database.
- Consultation and digital-product Stripe test checkout creation returned 200. Design services with outstanding staff agreements correctly returned 409.
- First audit had one development hot-reload interruption; a second complete audit had no server errors.
- 63 tests, type checking and commerce lint passed.

This is not proof of deployed Workers CPU limits, private file transfers, production payments, or production domain routing. Repeat those checks on an actual staging Worker before creating a production configuration. Free-plan CPU capacity in particular still requires deployed measurement.

## Remaining deployment dependencies

1. Authorize the Wrangler CLI for this account, Workers deployment and required zone information. No billing permission or paid subscription is required for staging preparation.
2. Install staging credentials as encrypted Worker secrets, set the actual APP_ORIGIN and rebuild with staging frontend variables. Confirm correct Supabase content is prerendered (the existing prerender script still needs its staging-variable selection corrected).
3. Test deployed payment settlement, signed R2 downloads/uploads, email and client navigation.
4. Prepare a separate production Worker with live credentials, indexing enabled and approved origin. Only then attach the purchased domain, update Supabase callbacks, R2 CORS and Stripe webhook destination.

References: https://developers.cloudflare.com/workers/runtime-apis/nodejs/http/ and https://developers.cloudflare.com/workers/runtime-apis/nodejs/process/

## Deployed validation

Wrangler was authorized with account/user read, Worker/script/route write, tail read and zone read, plus refresh access; no billing access. Staging secrets were installed encrypted. The six catalogue items prerender from staging correctly. The full hosted customer audit passed, including checkout creation, agreements, messages, support, idempotency and denial of customer admin access. Stripe webhook replay, email delivery and private R2 download/checksum/cross-customer denial passed. See `domain-launch-status.md` for message evidence.

Production still requires separate credentials/configuration, final-origin routing and checks. Current deployment is staging only. Free-plan CPU headroom under load has not been measured.

## Production build

`wrangler.production.jsonc` is a separate production Worker configuration. Build with `VITE_PAYMENT_MODE=live`, the production `VITE_SUPABASE_URL` and its public `VITE_SUPABASE_ANON_KEY`, then deploy with `npx wrangler deploy --config wrangler.production.jsonc`. Never deploy a staging build to production or a production build to staging. The current asset preparation intentionally keeps all static pages noindex until the final domain launch is validated. Production secret installation and pending Stripe account verification are recorded in `domain-launch-status.md`.
