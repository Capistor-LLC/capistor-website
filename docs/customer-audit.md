# Customer journey audit — 14 November 2026

Tested against the deployed staging API with a separate verified customer account. QA orders and support cases are labelled as test fixtures. No payment was completed and no customer messages were sent externally.

| Feature | Observed result |
| --- | --- |
| Customer authentication | Password sign-in succeeded |
| Customer history | HTTP 200 |
| Staff isolation | Customer receives HTTP 403 |
| Consultation order | Created successfully; repeated request returns same order |
| Stripe checkout | Checkout session created successfully after deployment processing-time change |
| PCB review order | Created with two immediately visible issued documents |
| Customer NDA and contract signatures | Both accepted through authenticated endpoint |
| Custom PCB order | NDA immediately visible and signable; contract waits for final quote |
| Payment before company signatures | Rejected as intended |
| Order conversation | Customer message recorded |
| Support tickets | Customer support case recorded |
| Available appointment slots | Endpoint responds successfully |
| Digital product ordering | Blocked: approved sale bundles are missing |

## Completed-payment follow-up

A Stripe Checkout browser transaction using the sandbox Visa card succeeded for QA order `724f164d-bb4e-406c-b328-747485282da5`. Without manually setting payment status, the provider webhook changed the database order to `paid` / `in_progress` and recorded `Payment confirmed`.

The paid order then passed the booking service: an appointment was created, a repeat request returned the same appointment, and the availability slot became booked. This verifies duplicate-request handling, not a concurrent two-customer race. A labelled appointment one year ahead is a QA fixture and must not be fulfilled.

A labelled, approved QA text file was stored privately in R2. The customer's signed download returned the exact bytes. Another customer's access was rejected. This tests service-order delivery, not a finished digital-product bundle or the upload/quarantine workflow.

## Upload and notifications follow-up — 15 November 2026

The customer upload service generated a signed R2 PUT URL, accepted the QA text file, verified its hash and size during finalization, and quarantined it. Repeated finalization preserved quarantine, and the download service blocked unreviewed access. This was exercised through the service and signed HTTP upload, not the browser file picker.

Staff notification status and manual appointment-email dispatch are implemented. Access controls, configuration guards and a mocked successful provider request are tested.

## Notification follow-up — 18 November 2026

Resend's verified Capistor sender and sending credential are configured in Vercel. Successful booking now attempts automatic customer email delivery; a delivery failure preserves the booking and leaves the notification available for staff review/retry. Sandbox external sending remains disabled, so no external email delivery has been verified. Provider acceptance is not inbox delivery. See notification-delivery.md for the remaining automation scope.

Not yet verified end to end: browser MFA, recovery email delivery and password change, paid digital-product entitlement, browser file picker, booking UI, refunds, external email/SMS delivery, Google/Apple OAuth. These are not implied by passing unit tests or successful checkout-session creation.

Production dependencies: live payment configuration, OAuth credentials, messaging/video provider configuration, verified product bundles and business availability. No production payments have been enabled.
