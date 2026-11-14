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

Not yet verified end to end: browser MFA, recovery email delivery and password change, completed Stripe payment/webhook, paid digital download, file upload, booking after payment, refunds, external email/SMS delivery, Google/Apple OAuth. These are not implied by passing unit tests or successful checkout-session creation.

Production dependencies: live payment configuration, OAuth credentials, messaging/video provider configuration, verified product bundles and business availability. No production payments have been enabled.
