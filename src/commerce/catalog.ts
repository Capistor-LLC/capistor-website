import type { Business, ShopItem } from "./types";
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
  terms: "",
  privacy: "",
  refund_policy: "",
  legal_approved: false,
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
];
