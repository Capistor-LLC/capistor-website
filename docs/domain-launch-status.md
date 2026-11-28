# Launch status — 28 November 2026

## Live infrastructure

- https://capistortechnologies.com serves the production Cloudflare Worker over HTTPS. `www` redirects to the apex while preserving the path. Public pages are indexable; login, staff, portal and API pages are private/no-store/noindex. The workers.dev alias remains noindex.
- Production uses Supabase `mqzxzvesyjfftddquxik`, private R2 `capistor-private-production`, Stripe live mode and a domain-restricted Resend sending key. Credentials are encrypted Worker secrets. No paid hosting subscription was added.
- Supabase Site URL and exact login callbacks use the new domain. Private R2 CORS permits the final origins and retained deployment origins, with no public bucket access. The expired old domain was removed from R2 CORS.
- Stripe webhook `we_1UfQUmLFAmiFFgynWPt2RILA` now targets the final domain's `/api/commerce?action=stripe-webhook`, preserving all five event subscriptions. Billing portal configuration remains `bpc_1UeuQWLFAmiFFgyn84W6GiMf`.
- Stripe and bank transfer are enabled for eligible service orders. Bank instructions use the owner's approved Wio account. Unpaid Stripe checkouts are closed before switching to bank transfer; completed, processing or uncertain card attempts block the switch. Only verified settlement unlocks paid features.

## Consultation operations

The owner confirmed daily availability from 10 am to 9 pm UAE time. The schedule generates hourly starts from 10 am through 8 pm, 45-minute calls, 15-minute gaps, and at least 24 hours' notice when publishing new slots. Thirty days are replenished daily; existing booked or blocked slots are never reopened. Staff can block/reopen future unbooked times in Calendar.

Paid clients select an available time in their order workspace. Booking is transactionally protected against duplicate orders/slots. A random Jitsi room link is generated without customer/project identifiers; staff can replace it. The host must sign in to Jitsi and start the room before the call. Client and owner booking notices are queued, and scheduled retries run every ten minutes with stable provider idempotency keys, attempt limits and a 23-hour automatic retry window. Older/uncertain notices remain for staff review.

This does not reserve a chosen slot before payment; customers choose after confirmed payment. No real-money charge was submitted during testing.

## Email

Zoho Mail Free is configured for `shoaib@capistortechnologies.com`, with `support@` and `inquiry@` aliases. MX/SPF/DKIM were verified publicly and in Zoho. Resend's sending domain is verified; DMARC monitoring is published.

Production Supabase signup, magic-link, password reset, invitation and email-change templates now link to a branded confirmation page. Verification requires a button press rather than consuming the token on page load; the hash is removed from the visible URL. The email template bodies are maintained in Supabase.

Resend message `01a21ee2-94d9-758a-867d-17e02bdc3c08` was delivered to the owner's Gmail on 28 November. Insights passes sender/link-domain alignment and DMARC with no "needs attention" warning. This proves provider delivery, not inbox placement. The owner reports junk placement; domain reputation/recipient filtering remains an operational issue. Do not promise inbox placement or send bulk warm-up mail.

## Evidence

- 77 automated tests pass, including payment boundaries, asynchronous webhook signatures, private file access, scheduling, bank fallback and email-link parsing; TypeScript and commerce lint pass.
- Final-domain authenticated order access and live billing portal returned 200; customer admin access returned 403.
- Live Stripe checkout creation returned 200 without charging a card. Switching the QA order to bank returned the correct IBAN, amount and currency, while leaving payment unconfirmed.
- Final-domain signed client upload/CORS succeeded. The file stayed quarantined and an unreviewed download returned 409.
- Staging paid consultation booking/retry, private download bytes, cross-customer denial, upload quarantine and repeated finalization passed.
- Staging paid digital order `CAP-95A6C9A6D4` delivered an email and a 76,179-byte sample ZIP with matching checksum. Another customer received 404. See ignored `.local/delivery-proof/worker-result.json`.
- Production deployment version: `21b0be48-965d-4109-9b0d-0fb8d88615e2`.

## Remaining limitations

- Digital previews stay disabled for paid sales. Real, validated release bundles are required; see `product-release-audit.md` for unresolved PCB DRC issues and missing CAD source.
- Google/Apple OAuth and SMS verification/marketing are not configured. Email/password and one-time email links are available; wallet eligibility is handled by Stripe and differs from social login.
- Zoho mailbox send/receive and a live two-person Jitsi call still need human operational checks. Provider delivery to Gmail has been verified.
- No real-money checkout settlement, live refund, or load/capacity test was performed. Sandbox settlement was tested. New authentication templates have confirmed delivery; full invitation/email-change round trips need dedicated QA accounts.
- Unused migration credentials should be reviewed/revoked once old hosting is retired. Preserve credentials still used by Vercel until that decision.
- Registration cost was $11.17 of the $20 setup budget. No paid email/hosting upgrade was purchased.
