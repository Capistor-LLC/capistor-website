# Capistor Technologies
## Website owner & engineering handover
28 November 2026 | UAE time | Production baseline b86e9cd

This guide explains the actual application and how to operate, change and recover it. It is written for Shoaib as the owner taking over development. It contains no passwords, API secrets, customer records or private download links.

Live website: https://capistortechnologies.com
Source repository: https://github.com/Capistor-LLC/capistor-website
Production source baseline: https://github.com/Capistor-LLC/capistor-website/commit/b86e9cdb968a9fe28fcfd0e6058f5d06e6a3f7b5

The website is a working service-ordering application, with separate production and staging infrastructure. It is not yet a finished digital-product business: the showcase engineering bundles still need real release files and validation before sale. Google login has application support but is not activated at this handover snapshot.

Read pages 3-5 for the big picture, 6-14 for running the business, and 15-22 for maintaining the software. Keep this guide alongside the repository, not as a replacement for it.

---PAGE---
# Reading map
## Find the task you need
3. Architecture: which service does what
4. Your dashboard and URL directory
5. What happens during a page visit
6. Client ordering: three distinct paths
7. Your daily staff workflow
8. Catalogue, pricing and digital releases
9. NDA, contracts, signatures and change history
10. Payments, wallets, bank transfers and refunds
11. Consultation calendar and meeting links
12. Private files and exportable history
13. Login, staff roles and Google setup
14. Business email and deliverability
15. Code map: where to make changes
16. Database: where the information lives
17. Local development and testing
18. Build, deploy and roll back
19. Configuration and secret inventory
20. Backups and disaster recovery
21. Troubleshooting and evidence
22. Remaining work and ownership checklist
23. Glossary and reference links

Every page is intended to answer both “what does this do?” and “what should I do next?”. URLs are clickable. Repository paths are relative to the capistor-website project folder. Commands run from that folder unless stated otherwise.

Important distinction: saving code to GitHub, deploying code to Cloudflare, editing business data in Supabase, and copying private files from R2 are four different operations. One does not automatically perform the others.

---PAGE---
# The architecture
## Six services, one customer experience
[ARCHITECTURE]

Cloudflare handles the domain, HTTPS and hosting. Its Worker serves the built website and the commerce API. The same account holds the private R2 file buckets, but files are not public website assets.

React renders the pages and forms in the customer's browser. It sends authenticated requests to the Worker. Supabase supplies identity, sessions and the PostgreSQL database: products, orders, documents, payments, calendar and history.

Stripe collects card and eligible wallet payments on its own hosted checkout. It reports confirmed events to the Worker. Resend sends transactional messages; Supabase uses Resend SMTP for account messages. Zoho is the human business mailbox for reading and replying to customer email.

GitHub stores source code and its history. Cloudflare currently deploys through Wrangler on the development machine. A Git push alone does not publish to the live Cloudflare site.

R2 holds bytes; Supabase holds file metadata and permission records. Stripe holds card details; Capistor holds order and payment references. Keeping these responsibilities separate makes the system easier to secure and recover.

---PAGE---
# Dashboard & URL directory
## Bookmark these destinations
Website: https://capistortechnologies.com
Customer account: https://capistortechnologies.com/portal
Staff entrance: https://capistortechnologies.com/staff
Commerce administration: https://capistortechnologies.com/admin/commerce
Editorial administration: https://capistortechnologies.com/admin/blog
Shop: https://capistortechnologies.com/shop
Services: https://capistortechnologies.com/services
Public journal: https://capistortechnologies.com/journal

GitHub source: https://github.com/Capistor-LLC/capistor-website
Cloudflare account: https://dash.cloudflare.com/bbdebe6c12f4f314bae387d27f0176f1
Production Worker: https://dash.cloudflare.com/bbdebe6c12f4f314bae387d27f0176f1/workers/services/view/capistor-production/production
Production Supabase: https://supabase.com/dashboard/project/mqzxzvesyjfftddquxik
Staging Supabase: https://supabase.com/dashboard/project/bzkmfhjsqcttyrvbasjj
Stripe live account: https://dashboard.stripe.com/acct_1UZ81FLFAmiFFgyn/
Resend: https://resend.com/emails
Zoho inbox: https://mail.zoho.com
Zoho administration: https://mailadmin.zoho.com
Google OAuth configuration: https://console.cloud.google.com/apis/credentials

Staging website: https://capistor-staging.capistor-website.workers.dev
Production alternate host: https://capistor-production.capistor-website.workers.dev
The alternate host is deliberately not indexed. Use the main domain with customers. Dashboard links require your provider account login; the website staff login does not log you into these providers.

---PAGE---
# A request, explained
## From a browser click to saved data
1. DNS directs capistortechnologies.com to Cloudflare. HTTPS protects the connection. The www host redirects to the main domain, preserving the path.
2. workers/index.mjs runs first. It applies routing and headers. Public files come from dist; browser routes can fall back to the application shell. Missing static assets return 404.
3. React Router in src/App.tsx chooses the page. Public pages are also prerendered during the build for initial loading and search engines. React then attaches interactive behaviour.
4. Commerce actions go to /api/commerce?action=... . server/handler.ts dispatches them. Public catalogue access differs from private order access.
5. The backend validates the Supabase session, then checks ownership, role, MFA level, input shape and the current order state. The server derives trusted prices and totals; the browser cannot mark an order paid.
6. The backend updates Supabase or calls Stripe/R2/Resend. It sends only the permitted result back to the browser. Private routes have no-store/noindex headers.

Two sources of content matter: saved database records drive commerce and editorial content, while source files provide layout, fallback catalogue content and some journal articles. A database edit may become visible after loading while the prerendered HTML remains old until the next build.

If a page appears stale after editing a product or article, verify the live record first, then rebuild and deploy. Do not repeatedly edit prices to solve a deployment problem.

---PAGE---
# The client ordering journey
## Three paths with different gates
CONSULTATION: service page -> separate checkout page -> sign in -> contact details and brief -> accept policies -> create order -> confirmed payment -> choose available time -> generated meeting link and email notices -> attend call -> staff records outcome.

ENGINEERING SERVICE: service page -> sign in and brief -> order received -> staff scopes and quotes -> generated NDA/contract drafts -> staff issues reviewed versions -> both parties sign required documents -> payment -> work and updates -> client review -> completion.

DIGITAL DOWNLOAD: shop item -> checkout -> sign in and purchase details -> accept licence and policies -> verified payment -> entitlement to the approved product bundle -> authenticated download and purchase history. This flow has been exercised in staging; production showcase items remain disabled until release assets are ready.

Creating an order is not the same as paying. A successful browser return from Stripe is not proof of payment. A bank receipt is not cleared funds. Server settlement is the point that unlocks paid work, booking or product access.

When the client is already signed in, checkout reuses that session. The owner can also be a customer: staff privileges come from the staff record plus MFA, not from a separate copy of the account. Use a separate test customer to check ordinary customer permissions.

The order page is the durable home for payment status, agreements, updates, files, bookings, support and exports. Email brings the customer back to this record rather than acting as the only project history.

---PAGE---
# Running the staff portal
## A practical daily routine
Open /staff, sign in with your designated owner account and complete authenticator verification. You will reach /admin/commerce. Keep authenticator recovery information in your password manager. Do not remove MFA merely to troubleshoot a callback.

Orders: open new requests, read the brief, check agreement and payment status, then choose the next permitted action. Add dated findings, decisions and deliverables to the order instead of keeping the only copy in email.

Products: manage commerce prices, scope, publication and whether checkout is available. Company & payments: maintain business details and enabled payment routes. Legal templates: maintain the templates used for new document drafts.

Calendar: inspect upcoming appointments, publish/block availability and update a meeting link. Notifications: inspect queued or failed delivery and use supported retry controls. Customers: inspect recorded profile, purchases and consented activity. Staff access: owner-controlled staff invitations, roles and activation.

For a bank order, match the exact reference, amount and currency against your bank statement before confirming settlement. For a file, review its exact uploaded version before approving it. For a contract, issue the reviewed version before asking for signatures.

End-of-day checks: unpaid/uncertain payments, tomorrow's calls, failed emails, unsigned documents, customer questions and files awaiting review. A “completed” project should have a final outcome, release files and an exportable history.

The older /admin area contains portfolio/editorial tools. The commerce Products tab controls sellable shop_items; the legacy products editor controls portfolio content. They are different datasets.

---PAGE---
# Products, prices & releases
## Publishing an item safely
In commerce Products, create or edit the item's title, slug, kind, category, summary, image, description, scope and exclusions. Set currency, price, tax behaviour, delivery days, revisions and licence. Review agreement, quote and booking requirements for that item.

Prices are stored in minor currency units: USD 99.00 is 9900. The UI presents normal money values. The server creates an order snapshot so a later catalogue price change does not silently rewrite an existing client's agreement.

Publication controls whether an item is visible. Checkout availability controls whether it can actually be ordered. A visible showcase is not proof its deliverables are ready. Keep checkout disabled while assembling the release bundle.

For each PCB release, prepare source schematic and board files, Gerbers and drills, BOM, useful rendered images, Gerber preview, build/setup tutorial, version/changelog and applicable third-party notices. For CAD, include editable source where promised, printable exports, assembly instructions and limitations. Use truthful images of the actual release.

Upload the bundle through staff file controls, inspect it in an isolated environment, approve the exact file hash, and verify a paid staging customer can download it. Another customer must be denied. Check that the archive opens and matches every promised deliverable before enabling sale.

Current audit: basketball timer has unresolved connectivity/DRC issues; another PCB is still work in progress; the CAD showcase lacks a finished source release. See docs/product-release-audit.md. Making a public repository private does not revoke licences already granted to others. Verify ownership and third-party obligations before sale.

---PAGE---
# Agreements & change history
## Automated drafts, human approval
server/documents.ts supplies default NDA and engineering contract text. legal_templates stores configurable templates. Creating a relevant service order fills fields from its client, company, brief, scope, price, delivery estimate and reference.

Automatic generation creates a draft, not an approved legal agreement. Staff reviews the actual scope and exclusions, edits as needed, and issues a version. The client and company sign the exact required version. Signatures preserve identity, timestamp, consent and document fingerprint.

Use the negotiation record for a proposal, client objection, response and decision. The order retains versions and differences so a later disagreement can be traced to what was actually proposed and accepted. Do not replace a signed document in place.

The system blocks payment until required agreements are complete. Project uploads require the NDA gate. Quotes and agreements become restricted as signatures/payment progress. A material post-signature scope change should use a separately accepted new scoped order, not a hidden edit to the old price.

Public terms, privacy and refund wording live in src/commerce/legalContent.ts, with business settings providing company information. Digital licences permit personal/internal company use and modification while restricting resale/redistribution of design files, subject to third-party rights.

Read the actual guarantee wording: it describes correction/rework and refund conditions for engineering flaws and supplied PCB defects. It is not simply an unconditional refund for any reason. Match sales promises, QC records and signed scope to this text. This handover describes implementation; it does not certify enforceability or replace professional review.

---PAGE---
# Payments & billing
## Where money and payment truth live
Stripe Hosted Checkout collects eligible cards, Link, Apple Pay and Google Pay. Wallet availability depends on Stripe and the customer's device/account. These are Stripe payment methods, not independent ways to avoid Stripe processing fees. Google Pay is separate from Google account login.

The Worker creates a Checkout Session from the saved order. Stripe sends signed webhooks to https://capistortechnologies.com/api/commerce?action=stripe-webhook . The backend verifies the event and authoritative payment, including amount and currency, before settlement. Repeated events must not create a second fulfillment.

The customer billing portal lets a signed-in customer manage supported billing details and saved payment methods. server/billing.ts looks up that user's Stripe customer in the matching mode. Stripe hosts the sensitive card screens. Checkout/invoice references remain with the order.

Bank transfer is enabled. Instructions are revealed to the authenticated customer when their order can accept payment. If an existing Stripe attempt is open, the bank fallback first checks and expires the unpaid session. Paid, processing or uncertain attempts are blocked for reconciliation to prevent double collection.

Only owner/admin with MFA can confirm cleared bank funds. Refunds and disputes are managed in Stripe Dashboard for Stripe payments, then reflected through webhooks. A support ticket is not itself a refund. Bank refunds require a real manual bank action and an auditable order record.

Bitcoin is disabled. Tax registrations are not created automatically. Current tax choices must be reviewed with your accountant before changing tax settings. Live checkout and billing-session creation were verified without charging a real card; full production payment/refund testing remains a separate exercise.

---PAGE---
# Calendar & consultations
## Payment first, then choose a slot
The approved schedule is every day, 10:00-21:00 UAE time (UTC+4). Starts are hourly from 10:00 through 20:00. A call lasts 45 minutes, leaving a 15-minute gap. The replenisher creates future slots for roughly 30 days with at least 24 hours' notice when generating them.

CONSULTATION_SCHEDULE=daily-10-21-dubai enables this schedule in production. A daily Cloudflare trigger at 00:00 UTC replenishes it. Existing booked and blocked times are preserved. Change or remove this setting when changing the recurring schedule; editing a single slot does not change the recurring rule.

After verified payment, the client selects an available slot. The booking database function locks the slot/order and makes repeat requests safe. There is no pre-payment reservation. The API currently lists the first 60 future open slots, rather than the entire calendar.

MEETING_PROVIDER=jitsi creates a random room link after booking. The appointment stores the link and notifications are queued for staff/client. Staff must sign in to Jitsi to host; guests may wait for the moderator. The staff Calendar can replace the link if you prefer another provider.

Downloadable calendar files help add an appointment to a personal calendar. This is not a two-way Google Calendar integration. External calendar conflicts are not automatically imported, so block unavailable times in the website calendar yourself.

Before a real consultation, verify the meeting link with a second participant, microphone and camera. Automatic meeting creation does not prove the call itself has been tested. Check booking email delivery and the recorded UAE time before promising a slot.

---PAGE---
# Files, downloads & exports
## Private by default
R2 stores the actual file bytes. project_files stores names, object keys, sizes, hashes, ownership and review status. order_entitlements links paid digital purchases to the files they may access. The production bucket is capistor-private-production; staging uses a separate private bucket.

Uploads use short-lived signed URLs and a 25 MB file limit with allowed engineering/image/document extensions. Finalization verifies size and SHA-256 and promotes the verified bytes to a private immutable key. New uploads are quarantined until reviewed.

There is no automatic malware scanner. Use an isolated review environment for unfamiliar files and archives. Record findings and approve or reject the exact version. Do not turn on public bucket access to solve upload errors; correct CORS or signed-request configuration instead.

Client downloads require the appropriate owner/entitlement, payment and approval gates. Refunds/disputes can suspend access. Download links expire quickly (60 seconds) and should not be copied into a permanent product listing. The portal generates fresh links after checking access.

The JSON project export contains the visible order record, documents, signatures and file metadata; the CSV export contains dated history. These exports are not ZIP archives of all uploaded bytes. Download the actual files separately when archiving a project.

A Git backup does not include R2 objects. A database backup does not include their bytes either. Recovery requires both metadata and matching objects. Retain a manifest of object keys and hashes with an encrypted file backup, and test restoring a small sample.

---PAGE---
# Accounts, roles & Google login
## The access model
Supabase Auth handles email/password, verified email links and session refresh. src/commerce/Login.tsx handles the screens; src/lib/supabase.ts creates the PKCE client. The backend validates sessions with Supabase before checking permissions. Being registered is not staff authorization.

The designated owner is krish.shoaib55@gmail.com. The owner can invite staff and assign owner, admin, sales, engineer, support or editor roles. Sensitive server actions apply role checks; all staff administration requires AAL2 authenticator verification. Google login will not bypass staff MFA.

Google status at handover: the application already checks Supabase's enabled providers and displays “Continue with Google” when Google is enabled. Google Cloud is signed out in the available browser, so no OAuth client has been created or activated in this task. Email login remains available.

Activation recipe: in the owner's Google Cloud project, configure Google Auth branding/audience for Capistor, its public domain, support email, home and policy URLs. Create a Web application OAuth client using the main website origin and this exact authorized redirect:
https://mqzxzvesyjfftddquxik.supabase.co/auth/v1/callback

Store the resulting client ID and secret in production Supabase Authentication > Sign In / Providers > Google. Do not put the secret in frontend VITE variables or Git. Use only basic identity scopes. Check Supabase's redirect allowlist for the actual /login?next=... return flow; use tightly scoped entries, not a site-wide wildcard.

Test a normal Google customer returning to checkout, a repeat sign-in, sign-out, and the owner still requiring MFA. Confirm identities are linked to the intended existing user before changing staff access. See the official setup guide in the references. Apple login is not part of this handover's requested addition.

---PAGE---
# Email: sending versus receiving
## Two providers with different jobs
Zoho hosts the business mailbox. shoaib@capistortechnologies.com is the mailbox, with support@ and inquiry@ aliases. Log into Zoho to read and reply. Resend sends application messages; it is not your inbox.

Supabase authentication messages use smtp.resend.com on port 465 with the Resend SMTP credential. The sender is Capistor Technologies <support@capistortechnologies.com>. Login/recovery templates use the branded website confirmation screen rather than consuming the token just by opening a link.

server/notifications.ts queues transactional delivery in notification_outbox, calls Resend and records results. A Cloudflare trigger every ten minutes retries recent failures within the provider idempotency window, with a maximum of three attempts. Older/uncertain failures need staff reconciliation; do not blindly resend indefinitely.

Cloudflare DNS contains Zoho MX records and Zoho SPF/DKIM, plus Resend sending authentication and DMARC. Do not replace Zoho MX records with outbound-mail records. A provider's domain verification and a “delivered” event are different from inbox placement.

Most recent verification: Resend accepted/delivered the auth test and its Insights no longer flagged sender/link-domain alignment. That does not prove it reached the inbox rather than junk. Ask recipients to mark legitimate mail as not spam, keep volumes low and relevant, and investigate bounces/complaints before increasing outreach.

Business mailbox send/receive still needs an owner check. Auth templates and provider configuration live outside Git; export non-secret template text and record settings when changing them. Never commit reset links, SMTP passwords or live email payloads containing client data.

---PAGE---
# Code map
## Change the right layer
src/App.tsx: all public, customer and admin routes. src/commerce/Shell.tsx and commerce.css: shared layout, navigation and commerce styling. src/commerce/Public.tsx: homepage, item presentation and separate checkout.

src/commerce/Portal.tsx: customer workspace and order view. Admin.tsx and OrderAdmin.tsx: staff sections and order controls. Login.tsx and emailLink.ts: sign-in, recovery, MFA and confirmation parsing. context.tsx and api.ts: catalogue state and authenticated API calls.

src/commerce/catalog.ts: fallback catalogue. legalContent.ts: public policies. Journal.tsx and articles.ts: built-in editorial pages. src/components/admin: older portfolio/blog CMS. src/lib/supabase.ts: browser data/auth connection.

server/handler.ts: API routing. auth.ts and policy.ts: authentication, role checks, validation and status rules. orders.ts: order creation/history. admin.ts and operations.ts: catalogue, quotes, documents, staff, calendar and support operations.

server/payments.ts and stripe-checkout.ts: payment creation and verification. bank-fallback.ts: safe Stripe-to-bank transition. billing.ts: customer portal. files.ts: private upload/review/download. notifications.ts: email/outbox. scheduling.ts: slots and meeting links. environment.ts: production/test boundaries.

supabase/migrations: schema, row-level security and transactional database functions. workers/index.mjs: Cloudflare runtime adapter and schedules. wrangler.production.jsonc / wrangler.jsonc: production/staging settings. scripts/prerender.mjs: public HTML and sitemap. scripts/prepare-worker.mjs: Worker assets preparation.

tests/: automated behavioural checks. docs/: operations and evidence. package-lock.json: reproducible dependency versions. Use small changes and review the diff; a visual edit should not require changing payment rules.

---PAGE---
# Database map
## Records and relationships
IDENTITY: Supabase auth.users is the identity source. staff_members attaches roles to user IDs. customer_profiles stores customer details and marketing consent. stripe_customers maps a user plus payment mode to the correct Stripe customer.

CATALOGUE: shop_items is the sellable catalogue. business_settings controls company/payment configuration. legal_templates stores agreement templates. Legacy products/product_images describe portfolio work; blog_posts/blog_series describe editorial content; subscribers is the legacy subscriber list.

ORDERS: client_orders connects a customer to an item snapshot. order_events preserves progress/history. order_documents stores document versions; document_signatures records consent to exact versions; document_negotiation_events records proposals, objections and decisions. policy_acceptances records policy consent.

PAYMENTS: payment_attempts records external checkout/bank attempts. payment_events supports verified event processing and deduplication. order_entitlements records access after settlement. Do not edit payment_status by hand to force fulfillment: use the authorized settlement flow.

FILES & OPERATIONS: project_files contains private object metadata, availability_slots supplies the calendar, appointments connects booked orders to times, support_cases preserves issues, and notification_outbox tracks delivery. customer_events supports consented journey analysis; api_limits supports rate limiting.

Migrations 0001-0006 are the current baseline. They are ordered changes, not scripts to rerun blindly on a live database. New changes belong in a new migration. Test against staging and back up production before applying them.

Row-level security restricts browser access. The backend uses a powerful service credential, so server-side ownership and role checks are essential as well. Preserve both layers. Transactional functions handle operations such as booking and settlement that cannot safely be split into unrelated browser writes.

---PAGE---
# Work on the site locally
## A repeatable development loop
Use a current compatible Node installation (the project uses Node 20+ features; prefer Node 22.12+ LTS) and Git. Clone the repository and install the lockfile exactly. Keep your local staging settings in ignored .env.local, starting from .env.example.


```sh
git clone https://github.com/Capistor-LLC/capistor-website.git
cd capistor-website
npm ci
git switch -c codex/my-change
```

Use the staging Supabase project, test Stripe mode and staging R2 bucket. Set APP_ORIGIN=http://127.0.0.1:5173. Start two terminals:


```sh
# Terminal 1: backend at port 3001
npm run dev:api
# Terminal 2: frontend, normally port 5173
npm run dev
```

Vite proxies /api to the local backend. Open the printed URL. If Vite chooses another port, align APP_ORIGIN and allowed redirects; do not disable origin checks. A frontend-only preview cannot exercise payments and private file APIs by itself.

Before committing:

```sh
npm run typecheck
npm run lint:commerce
npm test
npm run build:worker
```

These checks cover selected commerce/server code; lint:commerce is not a whole-repository certification. A passing build is not proof of external credentials, email placement or real payment settlement. Test the customer path affected by your change in staging, including an access-denied case.

---PAGE---
# Publish & roll back
## Git backup and deployment are separate
1. Review and commit a small change. Push your branch to GitHub. Use a pull request for review where practical; merge into main after validation. Current production hosting does not automatically deploy main.
2. Build specifically for the intended environment. Staging and production share the local dist folder, so always rebuild before switching target. Public VITE variables are embedded in the browser bundle.
3. Deploy with the matching Wrangler config. Verify the main URL, login, a service page, customer API access and Worker logs. Record the Git SHA and deployment version together.

Production build pattern (the project URL and key are public project settings, not the service secret):

```sh
VITE_PAYMENT_MODE=live \
VITE_SUPABASE_URL=https://mqzxzvesyjfftddquxik.supabase.co \
VITE_SUPABASE_ANON_KEY=PUBLIC_PROJECT_KEY \
PUBLIC_INDEXING=true npm run build:worker
npx wrangler deploy --config wrangler.production.jsonc
```

Staging uses test browser settings and wrangler.jsonc. Do not enable PUBLIC_INDEXING for staging. Server secrets are installed separately in the Worker, never bundled into dist. Reload a dashboard settings page before editing it after CLI changes, to avoid overwriting newer bindings with stale form data.

Last verified runtime deployment: 21b0be48-965d-4109-9b0d-0fb8d88615e2. If a release fails, use Cloudflare deployment history to restore a known good Worker version, then verify critical routes. A Worker rollback does not undo database migrations, payments or file changes.

Keep schema migrations backward-compatible where possible. Restore databases only through a reviewed recovery plan. The old Vercel deployment remains a legacy installation; changing it does not change the main domain's current Cloudflare Worker.

---PAGE---
# Configuration inventory
## What belongs where
PUBLIC BUILD SETTINGS: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_PAYMENT_MODE. Staging overrides: VITE_STAGING_SUPABASE_URL and VITE_STAGING_SUPABASE_ANON_KEY. Optional analytics: VITE_GA_MEASUREMENT_ID and VITE_GA_MANUAL_ONLY. PUBLIC_INDEXING controls public indexing during the build.

PRODUCTION WORKER VARIABLES: DEPLOYMENT_ENV=production; STRIPE_MODE=live; APP_ORIGIN=https://capistortechnologies.com; NOTIFICATION_FROM=Capistor Technologies <support@capistortechnologies.com>; MEETING_PROVIDER=jitsi; CONSULTATION_SCHEDULE=daily-10-21-dubai; STRIPE_PORTAL_CONFIGURATION_ID identifies the live portal configuration.

ENCRYPTED WORKER SECRETS: SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, RESEND_API_KEY and BANK_DETAILS_JSON. SUPABASE_URL, R2_ACCOUNT_ID and R2_BUCKET are also installed as bindings. Names are safe to document; values are not safe to publish.

EXTERNAL SETTINGS: Supabase Site URL, redirect allowlist, SMTP, auth templates and OAuth provider secrets; Stripe payment methods, portal and webhook subscription; Cloudflare DNS and R2 CORS; Zoho mailbox aliases and authentication. Git does not automatically back up these dashboard settings.

The Stripe key is restricted to required commerce operations, not payout or general account management. R2 credentials are bucket-scoped. Keep test and live secrets separate. If a secret is exposed, rotate it in its provider, update the correct host and verify the integration; deleting it from the latest Git commit alone is insufficient.

.env.local, .dev.vars, .local, .wrangler and .vercel are ignored. Keep your own encrypted password-manager inventory and recovery codes. Never prefix a secret with VITE_: that prefix makes it eligible for the public browser bundle.

---PAGE---
# Backups & recovery
## Four things must survive a lost laptop
SOURCE: GitHub main contains committed application source, migrations and docs. Clone it on another machine to confirm access. Uncommitted changes, ignored files and dashboard edits are not included. A local Git bundle can provide a second code-history copy, stored securely off the laptop.

DATABASE: schedule encrypted exports of required Supabase schema/data and verify your provider's actual backup/restore options. Include relationships, roles and operational records in the recovery design. Auth identity recovery needs separate attention; do not assume a public-schema export restores users, MFA or provider settings.

FILES: copy private R2 objects to an encrypted backup with a key/hash manifest and retention rules. Do not publish client files in GitHub. Database and file backups should have compatible dates so metadata points to real bytes.

CONFIGURATION & ACCESS: preserve non-secret settings, DNS records, CORS, webhook event selections, template text and deployment IDs. Store secrets and account recovery material in a password manager. Review who can recover GitHub, Cloudflare, Supabase, Stripe, Zoho and Resend if the owner loses a device.

Restore order: regain provider access -> restore schema/data to an isolated project -> restore matching objects to a private bucket -> install credentials/configuration -> build against that environment -> test login, ownership, download, booking and sandbox payment -> cut over the domain only after validation.

Do not replay historical payment events blindly against a new database: reconcile existing Stripe/bank transactions and deduplication records first. Avoid sending duplicate customer emails during a restore. Test recovery on a small staging sample before an incident.

At handover, Git source backup is verified. A recurring off-provider database/R2 backup job and full disaster-recovery drill have not been established. These are owner tasks, not implied features of the Git backup.

---PAGE---
# Diagnose problems with evidence
## Start at the failed layer
LOGIN LOOP / MFA: check Supabase auth logs, Site URL and redirects; verify the browser retained its session and staff account reached AAL2. A normal customer account should not gain admin access. Do not fix a 403 by weakening role checks.

“COULD NOT SAVE”: inspect the /api/commerce response, required fields and Worker logs. Check environment alignment and schema version. Save the action, timestamp and non-sensitive error code; redact tokens, briefs and client details before sharing logs.

PAYMENT BLOCKED: inspect order status, required signatures, enabled route, existing payment attempts and Stripe mode. Processing or uncertain payments need reconciliation. For an eligible unpaid order, bank fallback is available. Do not create multiple charges while experimenting.

DOWNLOAD BLOCKED: verify confirmed payment, entitlement, correct user, approved file and R2 metadata. A 409 on a quarantined file is expected protection. Upload CORS errors need the exact site origin and headers permitted, not public bucket access.

MAIL IN JUNK: check Resend delivery/bounce details, authentication and domain alignment, then the recipient folder. Delivered is not inbox. BOOKING ABSENT: check paid status, open slots, schedule variable and cron logs. A calendar download is not automatic external-calendar sync.

Evidence at handover: 77 automated tests across 14 files previously passed, along with typecheck, commerce lint and production build. Live checkout-session and billing-portal creation succeeded without real charges. Bank fallback, future slots, private-file gates and customer/admin separation were checked. Staging verified paid booking, digital download bytes, repeat operations and another customer's denial.

Not established: production real-money settlement/refund, two-person Jitsi call, inbox placement, sustained load capacity, full recovery drill or activated Google login. Treat these as explicit tests to complete, not as proven by a green unit-test suite.

---PAGE---
# Ownership checklist
## Finish these in a controlled order
FIRST: activate and test Google OAuth after signing into the owner's Google Cloud account. Keep email login and staff MFA. Review the completed handover, verify GitHub access on your own machine and save provider recovery information.

BEFORE SELLING DIGITAL PRODUCTS: replace showcase files with validated releases, resolve PCB/CAD audit findings, verify rights/licences, approve uploads, test paid delivery and only then enable checkout. Bank settlement currently unlocks via the shared database settlement flow, but confirmBank does not queue the Stripe-style digital-delivery email; verify/fix that notification path before digital bank sales.

BEFORE MORE CLIENT TRAFFIC: run one controlled real payment/refund, test the actual consultation call, verify Zoho incoming/outgoing email, establish database/R2 backups, and review provider usage limits. Measure Worker CPU and frontend performance under realistic load before promising capacity.

NEXT ENGINEERING IMPROVEMENTS: add documented CI/CD for Cloudflare, export auth email templates to source, improve large frontend chunks, remove obsolete domain redirects/legacy deployment credentials after migration verification, and strengthen alerting for failed fulfillment or notification jobs.

NOT CURRENTLY INCLUDED: SMS/phone ownership verification, automatic external-calendar conflict sync, Bitcoin activation and full automated malware scanning. Customer analytics is consent-dependent and incomplete by nature; it cannot prove somebody read or understood a policy. Keep marketing consent separate from order contact details.

The domain was purchased for $11.17/year, with the recorded expiry 26 November 2027. Confirm renewal/billing in Cloudflare. Hosting/email were configured without a paid upgrade, but usage and provider pricing can change. Keep billing alerts and review current limits directly in each dashboard.

Your operating principle: sell only what is ready, preserve the order record, verify money before fulfillment, and change one layer at a time with a rollback plan.

---PAGE---
# Glossary & references
## Translate the technical terms
API: the server interface the pages call. Worker: the Cloudflare process serving API requests and assets. Frontend: browser pages. Backend: trusted server logic. Database: structured records. Object storage: uploaded file bytes.

OAuth: delegating sign-in to Google. PKCE: protection for the sign-in redirect exchange. MFA / AAL2: a second verified factor for staff access. RLS: database row-level rules deciding which records a session can access.

Webhook: a provider's signed event sent to the backend. Idempotency: repeating an operation without repeating its business effect. Entitlement: the recorded right to download a purchased item. SHA-256: a fingerprint identifying the exact file or document bytes.

Migration: a versioned database change. Prerender: producing public HTML at build time. Environment: a coordinated set of code, database, keys and payment mode. Staging: isolated test infrastructure. Production: the customer-facing live system.

Primary implementation references in this repository: docs/cloudflare-hosting.md; docs/domain-launch-status.md; docs/stripe-integration-plan.md; docs/billing-portal.md; docs/product-release-audit.md; docs/notification-delivery.md; docs/digital-delivery-test.md; docs/order-workflow.md. Historical setup notes may describe an earlier deployment; prefer this dated handover and current configuration when they differ.

Official Google login setup:
https://supabase.com/docs/guides/auth/social-sign-in/auth-google
Cloudflare Wrangler command reference:
https://developers.cloudflare.com/workers/wrangler/commands/

This document is reproducible from docs/owner-handover.md with scripts/build-handover.py. Install reportlab and pypdf in an isolated Python environment, run the generator from the repository root, then inspect the resulting PDF before sharing. It is an owner operations document; it intentionally excludes passwords and customer data.
