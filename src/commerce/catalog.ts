import type { Business, ShopItem } from "./types";
import {
  CUSTOMER_TERMS,
  DIGITAL_PRODUCT_LICENSE,
  PRIVACY_POLICY,
  REFUND_POLICY,
} from "./legalContent";
export const FIVERR_URL = "https://www.fiverr.com/shoaibmustafa7";
export const defaultBusiness: Business = {
  legal_name: "CAPISTOR TECHNOLOGIES - FZCO",
  contact_email: "inquiry@capistor.com",
  address: "Dubai, United Arab Emirates",
  registration_number: "",
  verification_url: "",
  portrait_url: "/cv_assets/my_picture.png",
  license_url: "",
  license_redacted_confirmed: false,
  terms: CUSTOMER_TERMS,
  privacy: PRIVACY_POLICY,
  refund_policy: REFUND_POLICY,
  legal_approved: true,
  bank_enabled: false,
  stripe_enabled: false,
  btc_enabled: false,
  fiverr_enabled: true,
};
const base = {
  kind: "service" as const,
  description: "",
  image_url: "",
  currency: "USD",
  tax_mode: "none" as const,
  tax_code: "",
  tax_bps: 0,
  delivery_days: 3,
  revision_limit: 1,
  license_text: "",
  version: "1.0",
  published: true,
  checkout_enabled: false,
  requires_quote: false,
  agreement_required: true,
  booking_required: false,
};
export const starterServices: ShopItem[] = [
  {
    ...base,
    id: "00000000-0000-4000-8000-000000000001",
    slug: "hardware-idea-review",
    title: "Hardware idea review",
    category: "01 / FIND DIRECTION",
    summary: "Turn a rough idea into a practical next step.",
    price_minor: 9900,
    checkout_enabled: true,
    agreement_required: false,
    booking_required: true,
    scope:
      "45-minute consultation; a written feasibility and next-steps summary; one follow-up question round.",
    exclusions:
      "Detailed circuit design, market validation, patent advice, physical testing and certification.",
  },
  {
    ...base,
    id: "00000000-0000-4000-8000-000000000002",
    slug: "pcb-pre-order-review",
    title: "PCB pre-order review",
    category: "02 / CHECK YOUR DESIGN",
    summary: "Get another pair of eyes before fabrication.",
    price_minor: 24900,
    scope:
      "One low-voltage, two-layer PCB up to 50 components; schematic and layout review; prioritised findings; one follow-up question round.",
    exclusions:
      "Mains, safety-critical, RF or high-speed designs; physical testing; certification; implementation of fixes.",
  },
  {
    ...base,
    id: "00000000-0000-4000-8000-000000000003",
    slug: "custom-pcb-design",
    title: "Custom PCB design",
    category: "03 / BUILD YOUR PRODUCT",
    summary: "A project shaped around your requirements.",
    price_minor: 75000,
    delivery_days: 15,
    requires_quote: true,
    scope:
      "Scope, deliverables, file formats, revisions, test plan and delivery dates agreed in a project-specific proposal.",
    exclusions:
      "Manufacturing, components, firmware, enclosure and certification unless expressly included in the proposal.",
  },
  {
    ...base,
    id: "00000000-0000-4000-8000-000000000004",
    slug: "basketball-shot-timer-pcb-pack",
    title: "Basketball shot timer PCB pack",
    kind: "digital",
    category: "PCB DESIGN / MANUFACTURING PACK",
    summary:
      "A compact ATmega328P timer board package with a manufacturing-ready handoff.",
    description:
      "Designed as a compact timer controller with USB-C, LiPo power, display, sound and button interfaces. The release page shows the board render and production contents before purchase. Files unlock in the customer workspace after verified payment.",
    image_url: "/products/basketball-shot-timer-pcb.webp",
    price_minor: 7900,
    delivery_days: 0,
    revision_limit: 0,
    scope:
      "Gerber fabrication archive\nDrill and board-outline files\nGerber top-view snapshot\nPopulated 3D PCB render\nEditable KiCad source files\nBill of materials (BOM)\nAssembly and setup tutorial\nVersioned release notes",
    exclusions:
      "Physical PCB, components, assembly, firmware customisation, certification and commercial redistribution rights are not included.",
    license_text: DIGITAL_PRODUCT_LICENSE,
    checkout_enabled: false,
    version: "1.0 (preview)",
  },
  {
    ...base,
    id: "00000000-0000-4000-8000-000000000005",
    slug: "steering-bellcrank-3d-print-kit",
    title: "3D-printable steering bellcrank kit",
    kind: "digital",
    category: "CAD / 3D PRINT",
    summary:
      "A compact parametric steering linkage concept for robotics and RC prototypes.",
    description:
      "An editable, printer-friendly bellcrank and mounting bracket concept for small steering prototypes. The storefront image is a product visualisation; the dimensioned CAD and print files included in the final release are authoritative.",
    image_url: "/products/steering-bellcrank-concept.webp",
    price_minor: 2900,
    delivery_days: 0,
    revision_limit: 0,
    scope:
      "Editable parametric CAD source\nSTEP interchange files\nSTL print files\nExploded assembly view\nHardware list\nRecommended print orientation and settings\nAssembly tutorial\nVersioned release notes",
    exclusions:
      "Printed parts, metal hardware, servo, vehicle-specific fitment, structural certification and commercial redistribution rights are not included.",
    license_text: DIGITAL_PRODUCT_LICENSE,
    checkout_enabled: false,
    version: "1.0 (preview)",
  },
  {
    ...base,
    id: "00000000-0000-4000-8000-000000000006",
    slug: "restaurant-call-pager-design-pack",
    title: "Restaurant call pager design pack",
    kind: "digital",
    category: "PCB + ENCLOSURE / PRODUCT FILES",
    summary:
      "A touch-enabled illuminated table pager design with PCB and enclosure files.",
    description:
      "A compact restaurant table call-pager reference design combining the circuit board, LED presentation and printable enclosure geometry. The final private release can be replaced and approved from the admin workspace before checkout is enabled.",
    image_url: "/products/restaurant-pager-pcb.webp",
    price_minor: 5900,
    delivery_days: 0,
    revision_limit: 0,
    scope:
      "Editable KiCad schematic and PCB\nGerber and drill archive\nBOM and placement data\nTop and bottom fabrication previews\nPopulated PCB renders\nSTEP enclosure and board models\nSetup and manufacturing notes\nVersioned release notes",
    exclusions:
      "Physical hardware, firmware customisation, wireless infrastructure, compliance certification and commercial redistribution rights are not included.",
    license_text: DIGITAL_PRODUCT_LICENSE,
    checkout_enabled: false,
    version: "1.0 (preview)",
  },
];
