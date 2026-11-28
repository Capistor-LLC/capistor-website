# Capistor Technologies website

Production: https://capistortechnologies.com

Start with the **[owner and engineering handover](docs/owner-handover.md)** or its **[23-page PDF](output/pdf/capistor-owner-handover.pdf)**. The handover explains services, URLs, customer/staff workflows, deployment, backups and known gaps as of 28 November 2026.

## Architecture

React + TypeScript + Vite frontend; Node commerce handler hosted on Cloudflare Workers; Supabase Auth/PostgreSQL; private Cloudflare R2 files; Stripe Checkout and customer portal; Resend transactional mail; Zoho business inbox. Production and staging are separate.

GitHub is the source backup. **Pushing main does not deploy the production Cloudflare Worker.** Vercel is a retained legacy deployment. See [Cloudflare hosting](docs/cloudflare-hosting.md) and [launch status](docs/domain-launch-status.md).

## Local development

Use Node 22 LTS and npm. Run `npm ci`. Configure ignored `.env.local` from `.env.example` with staging credentials; never commit credentials. Run `npm run dev:api` in one terminal and `npm run dev` in another. Vite normally serves http://127.0.0.1:5173 and proxies `/api` to port 3001. Match `APP_ORIGIN` to the actual frontend URL.

## Validation

```sh
npm run typecheck
npm run lint:commerce
npm test
npm run build:worker
```

Build with environment-specific browser variables before deploying. Production uses `wrangler.production.jsonc`; staging uses `wrangler.jsonc`. Never deploy a reused `dist` build to the other environment. Secrets live in encrypted Worker bindings and provider dashboards.

## Key documents

- [Order workflow](docs/order-workflow.md)
- [Product release audit](docs/product-release-audit.md)
- [Stripe integration](docs/stripe-integration-plan.md)
- [Billing portal](docs/billing-portal.md)
- [Notification delivery](docs/notification-delivery.md)
- [Google login activation](docs/google-login-activation.md)

## Rebuild the handover PDF

In an isolated Python environment, install `reportlab` and `pypdf`, then run `python scripts/build-handover.py`. The editable source is `docs/owner-handover.md`. Render and inspect every page after changes; the generator checks the page count to catch overflow.
