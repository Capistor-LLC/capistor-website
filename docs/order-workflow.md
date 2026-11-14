# Current order workflow

```mermaid
flowchart TD
  A[Product or service page] --> B[Continue to checkout]
  B --> C[Sign in and enter order details]
  C --> D{Requires agreements?}
  D -->|Yes| E[System generates project-specific NDA and contract drafts]
  E --> F[Staff reviews and issues each document]
  F --> G[Client and company sign the exact version]
  G --> H[Payment becomes available]
  D -->|No| H
  H --> I[Stripe Checkout]
  I --> J[Verified payment webhook]
  J --> K{Order type}
  K -->|Digital| L[Approved purchased files available]
  K -->|Consultation| M[Client selects a published available slot]
  K -->|Engineering| N[Staff posts updates and deliverables]
  M --> O[Staff adds meeting link]
  N --> P[Client reviews deliverables]
  L --> Q[Order history, support cases and export]
  O --> Q
  P --> Q
```

## Staff controls and expectations

| Control | Current effect | Prerequisite |
| --- | --- | --- |
| Staff portal | Opens commerce administration | Verified staff account and authenticator verification |
| Products | Edit price, scope, publication and checkout availability | Owner, admin or editor role |
| Issue document | Publishes an immutable version for client signature | Reviewed draft and appropriate staff role |
| Record negotiation | Adds proposal, objection or decision to order history | Access to the order |
| Confirm bank settlement | Records a real bank payment | Live payment mode and owner/admin role; unavailable in sandbox |
| Calendar | Publish availability and manage booked appointments | Appropriate staff role |
| Meeting URL | Saves the joining link for the appointment | Staff supplies the URL; provider generation is not connected |
| Files | Upload, review and approve delivery files | Appropriate access; private files remain controlled |
| Export | Downloads the project record | Access to the order |

## Current limitations to resolve

Digital showcase items cannot be purchased until approved bundles exist and checkout is enabled. NDA and contract drafts are automatic, but issuing them still requires staff review. Calls are booked after payment; meeting-link generation and notification delivery require provider integration. Google and Apple sign-in require configured OAuth providers. Phone collection does not yet verify the phone number. Sandbox bank settlement is intentionally rejected; use Stripe test checkout to exercise verified-payment workflows.
