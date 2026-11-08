export type ShopItem = {
  id: string;
  slug: string;
  title: string;
  kind: "service" | "digital";
  category: string;
  summary: string;
  description: string;
  image_url: string;
  price_minor: number;
  currency: string;
  tax_mode: "none" | "manual" | "automatic";
  tax_code: string;
  tax_bps: number;
  delivery_days: number;
  revision_limit: number;
  scope: string;
  exclusions: string;
  license_text: string;
  version: string;
  published: boolean;
  checkout_enabled: boolean;
  requires_quote: boolean;
};
export type Order = {
  id: string;
  reference: string;
  client_id: string;
  item_id: string;
  item_snapshot: ShopItem;
  client_name: string;
  company: string;
  billing_address: string;
  brief: string;
  status: string;
  payment_status: string;
  total_minor: number;
  currency: string;
  due_at: string | null;
  invoice_url?: string | null;
  invoice_pdf?: string | null;
  tax_minor?: number | null;
  outcome: string;
  accepted_terms: string;
  accepted_license: string;
  created_at: string;
};
export type OrderEvent = {
  id: string;
  kind: string;
  title: string;
  detail: string;
  findings: string;
  outcome: string;
  created_at: string;
};
export type ProjectFile = {
  id: string;
  filename: string;
  size_bytes: number;
  sha256: string;
  status: string;
  version_label: string;
  created_at: string;
  review_note: string;
  uploaded_by: string;
};
export type Signature = {
  id: string;
  document_id: string;
  signer_name: string;
  signer_email: string;
  party: string;
  document_sha256: string;
  signed_at: string;
  consent_text: string;
};
export type OrderDocument = {
  id: string;
  kind: string;
  title: string;
  body: string;
  version: number;
  sha256: string;
  status: string;
  created_at: string;
};
export type OrderDetail = {
  order: Order;
  events: OrderEvent[];
  files: ProjectFile[];
  documents: OrderDocument[];
  signatures: Signature[];
  payments: {
    id: string;
    provider: string;
    state: string;
    created_at: string;
  }[];
  downloads: ProjectFile[];
  isAdmin: boolean;
};
export type Business = {
  legal_name: string;
  contact_email: string;
  address: string;
  registration_number: string;
  verification_url: string;
  portrait_url: string;
  license_url: string;
  license_redacted_confirmed: boolean;
  terms: string;
  privacy: string;
  refund_policy: string;
  legal_approved: boolean;
  bank_enabled: boolean;
  stripe_enabled: boolean;
  btc_enabled: boolean;
  fiverr_enabled: boolean;
};
export const money = (amount: number, currency = "USD") =>
  new Intl.NumberFormat("en", { style: "currency", currency }).format(
    amount / 100,
  );
export const humanStatus = (status: string) => status.replace(/_/g, " ");
