# Cloudflare hosting preparation

The existing Node commerce handler now runs through Cloudflare's Node HTTP adapter (`workers/index.mjs`). The checked-in Wrangler configuration is **staging only**, with test Stripe mode, automatic email disabled and indexing disabled. It has not been deployed to Cloudflare.

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
