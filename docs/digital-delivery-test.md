# Digital delivery staging verification — 26 November 2026

Three explicitly labelled sample ZIP bundles were installed in the existing staging Supabase/R2 environment. Production catalogue records were not changed.

## Verified
- A Stripe sandbox card checkout completed for steering bellcrank order CAP-95A6C9A6D4.
- The deployed Stripe webhook automatically marked the order paid.
- The customer download returned 76,179 bytes with the expected SHA-256.
- Another customer was denied access (404).
- Replaying the authentic Stripe completion event through the updated local webhook handler queued exactly one digital-delivery notification.
- No real payment was taken.
- A separate manual verification email with the sample ZIP was sent to the owner's requested Gmail address using the connected Capistor Gmail account. This is not evidence of automated website email delivery or recipient inbox delivery.

## Email limitation
The website notification remains queued. Sandbox email dispatch is disabled and the Resend account's free test sender permits only its Hotmail account address. The capistor.com sender domain is not verified. Do not label queued email as delivered. A verified sender, or an owner-controlled Resend account with the desired test recipient as its account email, is needed to complete the automatic email test.

## Repeatable setup
Run only with staging credentials:
1. python3 scripts/build-demo-bundles.py
2. node --env-file=.env.local --import tsx scripts/seed-demo-downloads.ts
3. Buy a sample from the staging storefront using Stripe card 4242 4242 4242 4242, a future expiry and any three-digit CVC.
4. node --env-file=.env.local --import tsx scripts/audit-digital-delivery.ts ORDER_ID

The seeding script refuses production database, production bucket, and live payment mode. Never enable these samples for real-money sales. The bundles contain a concept image, example BOM, sample setup guide and release notes; the steering bundle additionally contains original demonstration OpenSCAD geometry. They contain no validated manufacturing files.

## Raspberry Pi
The existing Node/Vite app can be run on a suitably provisioned Raspberry Pi for development. This does not supply an email sender or remove the need for internet-facing HTTPS webhook delivery. Keep staging on its existing Vercel URL for this test; no new hardware hosting or purchase is required.
