# Cloudflare hosting

Production: https://capistortechnologies.com (`wrangler.production.jsonc`).
Staging: https://capistor-staging.capistor-website.workers.dev (`wrangler.jsonc`).

The Node commerce handler runs through Cloudflare's Node HTTP adapter. Secrets are installed with `wrangler secret bulk` via stdin, never committed. When mixing dashboard and CLI changes, reload dashboard settings before editing: a stale dashboard form can overwrite newer server-side bindings. Verify the complete secret-name inventory after every configuration change.

## Build and deploy

Production builds require `VITE_PAYMENT_MODE=live`, production `VITE_SUPABASE_URL` and its public `VITE_SUPABASE_ANON_KEY`, plus `PUBLIC_INDEXING=true` for indexable public assets. Run `npm run build:worker` then `npx wrangler deploy --config wrangler.production.jsonc`.

Staging builds require `VITE_PAYMENT_MODE=test` and staging browser variables. Do not set `PUBLIC_INDEXING=true`. Rebuild before changing the deployment target; `dist` is shared locally. Never deploy production frontend assets to staging or staging assets to production.

The production Worker runs first to apply canonical-host redirects, private/no-store headers, API routing and noindex on alternate hosts. Missing asset files return 404. Legacy `_redirects` are removed during build. Security headers are shared with Vercel configuration.

## Scheduled work

- Every ten minutes: retry recent queued/failed transactional emails within the provider idempotency window, maximum three attempts. Older or uncertain failures require staff reconciliation.
- Daily at 00:00 UTC: replenish the next thirty days of owner-approved UAE consultation slots. Existing booked/blocked times are preserved.
- `MEETING_PROVIDER=jitsi` generates private random room links after confirmed booking. Staff must authenticate with Jitsi to host; links can be replaced in Calendar.
- `CONSULTATION_SCHEDULE=daily-10-21-dubai` enables the current approved schedule. Remove/change this setting before changing the recurring operating hours in code.

R2 CORS source is `config/r2-production-cors.json`. Keep buckets private. Browser uploads use short-lived signed URLs, integrity checks and quarantine.

See `domain-launch-status.md` for evidence and remaining launch limits. Free-plan CPU headroom under load is not yet measured. Configuration and basic successful requests are not a capacity guarantee.
