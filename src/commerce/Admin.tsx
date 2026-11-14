import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import type {
  Appointment,
  Business,
  CustomerSummary,
  Order,
  ProjectFile,
  ShopItem,
  StaffMember,
} from "./types";
import { money, humanStatus } from "./types";
import { api } from "./api";
import { Notice } from "./Shell";
import { Files, Upload, date } from "./Portal";
import { starterServices } from "./catalog";
type Template = { id: string; title: string; body: string; approved: boolean };
type AdminData = {
  items: ShopItem[];
  orders: Order[];
  settings: Business;
  templates: Template[];
  defaults: { nda: string; contract: string };
  configured: Record<string, boolean>;
  role: StaffMember["role"];
};
type Tax = {
  active: boolean;
  settings_status: string;
  registrations: { country: string; status: string }[];
  codes: { id: string; name: string; description: string }[];
};
const newItem: ShopItem = {
  ...starterServices[0],
  id: "",
  slug: "",
  title: "",
  summary: "",
  description: "",
  kind: "digital",
  category: "PCB design",
  image_url: "",
  scope: "",
  exclusions: "",
  price_minor: 1000,
  delivery_days: 0,
  published: false,
  checkout_enabled: false,
  agreement_required: false,
  booking_required: false,
};
export default function CommerceAdmin() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("orders");
  const [selected, setSelected] = useState<ShopItem | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [tax, setTax] = useState<Tax | null>(null);
  const load = useCallback(async () => {
    const loaded = await api<AdminData>("admin");
    setData(loaded);
    if (loaded.role === "editor") setTab("products");
    else if (loaded.role === "support") setTab("orders");
  }, []);
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);
  const loadFiles = useCallback(async () => {
    setFiles(
      selected?.id
        ? await api<ProjectFile[]>("item-files", undefined, { id: selected.id })
        : [],
    );
  }, [selected?.id]);
  useEffect(() => {
    loadFiles().catch((e) => setError(e.message));
  }, [loadFiles]);
  async function run(work: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await work();
      await load();
      await loadFiles();
      setNotice("Saved successfully.");
      window.dispatchEvent(new Event("catalog:refresh"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!data)
    return (
      <div className="page-wrap">
        <div className="page-intro">
          <h1>Business workspace</h1>
        </div>
        {error ? (
          <Notice error>
            {error}
            <button
              onClick={() => load().catch((e) => setError(e.message))}
              className="small-button"
            >
              Retry
            </button>
          </Notice>
        ) : (
          <p>Loading…</p>
        )}
      </div>
    );
  const allowedTabs =
    data.role === "editor"
      ? ["products"]
      : data.role === "engineer"
        ? ["orders", "products", "calendar"]
        : data.role === "support"
          ? ["orders", "customers", "calendar"]
          : data.role === "sales"
            ? ["orders", "customers", "calendar", "legal templates"]
            : [
                "orders",
                "products",
                "customers",
                "calendar",
                "staff access",
                "company & payments",
                "legal templates",
              ];
  return (
    <div className="page-wrap">
      <Helmet>
        <title>Business workspace — Capistor</title>
      </Helmet>
      <header className="portal-heading">
        <div>
          <p className="eyebrow">CAPISTOR ADMIN · TWO-FACTOR PROTECTED</p>
          <h1>Your business workspace.</h1>
        </div>
        <div className="actions">
          <button
            className="small-button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                const result = await api<{ configured: boolean }>(
                  "rebuild",
                  {},
                );
                setNotice(
                  result.configured
                    ? "Public page updates are building. They will appear after deployment finishes."
                    : "Your changes are saved. Set the deploy hook in hosting settings, or redeploy manually, to refresh the pages search engines see.",
                );
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            Publish page updates
          </button>
          {["owner", "admin"].includes(data.role) && (
            <Link className="small-button" to="/admin/blog">
              Manage blog posts ↗
            </Link>
          )}
        </div>
      </header>
      <div className="tabs" role="tablist" aria-label="Business sections">
        {allowedTabs.map(
          (t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ),
        )}
      </div>
      {error && <Notice error>{error}</Notice>}
      {notice && <Notice>{notice}</Notice>}
      {tab === "orders" && (
        <>
          <p className="micro">
            Latest 200 orders. Open an order to issue agreements, publish
            updates, review files, and reconcile bank payments.
          </p>
          <div className="orders-list">
            {data.orders.length ? (
              data.orders.map((o) => (
                <Link
                  className="order-row"
                  to={`/portal/orders/${o.id}`}
                  key={o.id}
                >
                  <div>
                    <p className="eyebrow">{o.reference}</p>
                    <p className="micro">{date(o.created_at)}</p>
                  </div>
                  <div>
                    <h3>{o.item_snapshot.title}</h3>
                    <p>
                      {o.client_name} · {o.company}
                    </p>
                  </div>
                  <span className="badge">{humanStatus(o.status)}</span>
                  <div>
                    {money(o.total_minor, o.currency)}
                    <p className="micro">{humanStatus(o.payment_status)}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="panel">
                <h2>No orders yet.</h2>
                <p>
                  Publish your offers, complete your policies and enable the
                  payment routes you’re ready to support.
                </p>
              </div>
            )}
          </div>
        </>
      )}
      {tab === "products" && (
        <div className="admin-grid">
          <aside className="admin-list">
            <button onClick={() => setSelected({ ...newItem })}>
              + New product or service
            </button>
            {data.items.map((i) => (
              <button onClick={() => setSelected(i)} key={i.id}>
                <strong>{i.title}</strong>
                <br />
                {money(i.price_minor, i.currency)} ·{" "}
                {i.published ? "Published" : "Draft"}
              </button>
            ))}
          </aside>
          <div>
            {selected ? (
              <>
                <ItemEditor
                  key={`${selected.id}-${selected.slug}`}
                  item={selected}
                  busy={busy}
                  codes={tax?.codes || []}
                  save={(item) =>
                    run(async () => {
                      const saved = await api<ShopItem>("save-item", item);
                      setSelected(saved);
                    })
                  }
                />
                {selected.id && (
                  <div className="panel">
                    <h2>Downloadable product files</h2>
                    <p className="micro">
                      Use only for digital products. Save first, upload files,
                      scan and approve them, then enable checkout. Purchases
                      retain access to the approved files included at the time
                      of ordering.
                    </p>
                    <Upload
                      destination={{ item_id: selected.id }}
                      onDone={loadFiles}
                    />
                    <Files files={files} admin run={run} />
                  </div>
                )}
              </>
            ) : (
              <div className="panel">
                <h2>Your catalogue, your prices.</h2>
                <p>
                  Select an item or create a new product. Prices are entered in
                  normal currency units. Existing orders preserve the price and
                  licence they were placed with.
                </p>
              </div>
            )}
            <button
              className="small-button"
              disabled={busy}
              onClick={() =>
                void run(async () => setTax(await api<Tax>("tax")))
              }
            >
              Load Stripe Tax status & classifications
            </button>
            {tax && (
              <Notice>
                {tax.active
                  ? "Tax settings and a registration are active. Confirm the correct classification with your accountant."
                  : "Automatic Tax is not ready. Complete the required registration in Stripe before selecting automatic tax."}
              </Notice>
            )}
          </div>
        </div>
      )}
      {tab === "customers" && <CustomersPanel />}
      {tab === "calendar" && <CalendarPanel />}
      {tab === "staff access" && <StaffPanel />}
      {tab === "company & payments" && (
        <>
          <div className="panel">
            <h2>Connection status</h2>
            <div className="form-grid">
              {Object.entries(data.configured).map(([k, v]) => (
                <p key={k}>
                  <span className="badge">
                    {k}: {v ? "Configured" : "Setup needed"}
                  </span>
                </p>
              ))}
            </div>
            <p className="micro">
              A configured secret is not proof that a provider is live or fully
              tested. Stripe business verification, webhook delivery, tax
              registrations and wallet eligibility must be checked separately.
            </p>
            <button
              className="small-button"
              onClick={() =>
                void run(async () => setTax(await api<Tax>("tax")))
              }
            >
              Check Stripe Tax
            </button>
            {tax && (
              <Notice>
                Settings: {tax.settings_status}. Active registrations:{" "}
                {tax.registrations.map((r) => r.country).join(", ") || "None"}.{" "}
                {tax.active
                  ? "Ready for classification review."
                  : "Automatic tax remains gated."}
              </Notice>
            )}
          </div>
          <Settings
            settings={data.settings}
            busy={busy}
            save={(s) => run(() => api("save-settings", s))}
          />
        </>
      )}
      {tab === "legal templates" && (
        <div className="panel admin-form">
          <h2>Agreement templates</h2>
          <Notice>
            These are starting drafts, not a guarantee of legal enforceability.
            Have the terms reviewed for your business and applicable law.
            Approving a template allows service order requests; each generated
            client document still requires your review, issue and signature.
          </Notice>
          <p className="micro">
            Available fields: company_name, company_address, client_name,
            client_company, client_address, client_email, effective_date,
            support_email, reference, project_title, scope, exclusions, total,
            delivery_days, revisions and brief. Wrap a field in double braces,
            for example {"{{client_name}}"}.
          </p>
          {(["nda", "contract"] as const).map((kind) => {
            const t = data.templates.find((t) => t.id === kind);
            return (
              <form
                className="stack-form"
                key={`${kind}-${t?.body}`}
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  void run(() =>
                    api("save-template", {
                      id: kind,
                      title: f.get("title"),
                      body: f.get("body"),
                      approved: f.get("approved") === "on",
                    }),
                  );
                }}
              >
                <h3>{kind.toUpperCase()}</h3>
                <label>
                  Title
                  <input
                    name="title"
                    defaultValue={
                      t?.title ||
                      (kind === "nda"
                        ? "Mutual confidentiality agreement"
                        : "Engineering services agreement")
                    }
                    required
                  />
                </label>
                <label>
                  Template text
                  <textarea
                    className="large"
                    name="body"
                    defaultValue={t?.body || data.defaults[kind]}
                    required
                    maxLength={40000}
                  />
                </label>
                <label className="checkbox">
                  <input
                    name="approved"
                    type="checkbox"
                    defaultChecked={t?.approved}
                  />
                  <span>
                    The template has been reviewed and all required clauses are
                    complete.
                  </span>
                </label>
                <button className="button" disabled={busy}>
                  Save template
                </button>
              </form>
            );
          })}
        </div>
      )}
    </div>
  );
}
function ItemEditor({
  item,
  busy,
  codes,
  save,
}: {
  item: ShopItem;
  busy: boolean;
  codes: Tax["codes"];
  save: (item: unknown) => Promise<void>;
}) {
  return (
    <form
      className="panel admin-form stack-form"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const s = (key: string) => String(f.get(key) || "");
        void save({
          ...(item.id ? { id: item.id } : {}),
          slug: s("slug"),
          title: s("title"),
          kind: s("kind"),
          category: s("category"),
          summary: s("summary"),
          description: s("description"),
          image_url: s("image_url"),
          price_minor: Math.round(Number(f.get("price")) * 100),
          currency: s("currency"),
          tax_mode: s("tax_mode"),
          tax_code: s("tax_code"),
          tax_bps: Math.round(Number(f.get("tax")) * 100),
          delivery_days: Number(f.get("delivery_days")),
          revision_limit: Number(f.get("revision_limit")),
          scope: s("scope"),
          exclusions: s("exclusions"),
          license_text: s("license_text"),
          version: s("version"),
          published: f.get("published") === "on",
          checkout_enabled: f.get("checkout_enabled") === "on",
          requires_quote: f.get("requires_quote") === "on",
          agreement_required: f.get("agreement_required") === "on",
          booking_required: f.get("booking_required") === "on",
        });
      }}
    >
      <h2>{item.id ? "Edit offer" : "Create an offer"}</h2>
      <div className="form-grid">
        <label className="field">
          Title
          <input
            name="title"
            defaultValue={item.title}
            required
            maxLength={150}
          />
        </label>
        <label className="field">
          URL slug
          <input
            name="slug"
            defaultValue={item.slug}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            maxLength={120}
          />
        </label>
        <label className="field">
          Offer type
          <select name="kind" defaultValue={item.kind}>
            <option value="digital">Downloadable product</option>
            <option value="service">Service</option>
          </select>
        </label>
        <label className="field">
          Category
          <input
            name="category"
            defaultValue={item.category}
            required
            maxLength={80}
          />
        </label>
        <label className="field">
          Price
          <input
            name="price"
            type="number"
            min="1"
            max="1000000"
            step="0.01"
            required
            defaultValue={item.price_minor / 100}
          />
        </label>
        <label className="field">
          Currency
          <select name="currency" defaultValue={item.currency}>
            {["USD", "AED", "EUR", "GBP"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Tax treatment
          <select name="tax_mode" defaultValue={item.tax_mode}>
            <option value="none">No tax collection configured</option>
            <option value="manual">Manual rate (added to price)</option>
            <option value="automatic">Stripe Tax (included in price)</option>
          </select>
        </label>
        <label className="field">
          Manual tax percentage
          <input
            name="tax"
            type="number"
            min="0"
            max="25"
            step="0.01"
            defaultValue={item.tax_bps / 100}
          />
        </label>
        <label className="field wide">
          Stripe tax code (automatic mode only)
          <input
            name="tax_code"
            list="tax-codes"
            defaultValue={item.tax_code}
            maxLength={100}
          />
          <datalist id="tax-codes">
            {codes.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </datalist>
          <span className="micro">
            Set manual rate to 0 for other modes. Automatic Tax requires an
            active registration and uses Stripe only.
          </span>
        </label>
        <label className="field">
          Business days after kickoff
          <input
            name="delivery_days"
            type="number"
            min="0"
            max="365"
            defaultValue={item.delivery_days}
            required
          />
        </label>
        <label className="field">
          Revision rounds
          <input
            name="revision_limit"
            type="number"
            min="0"
            max="20"
            defaultValue={item.revision_limit}
            required
          />
        </label>
        <label className="field">
          Version
          <input
            name="version"
            defaultValue={item.version}
            required
            maxLength={50}
          />
        </label>
        <label className="field">
          Cover image URL
          <input
            name="image_url"
            defaultValue={item.image_url}
            placeholder="https://… or /public-image.webp"
          />
        </label>
      </div>
      {[
        ["summary", "Short description", item.summary],
        [
          "description",
          "Description, requirements & compatibility",
          item.description,
        ],
        ["scope", "Exact inclusions / file list", item.scope],
        ["exclusions", "Exclusions / limitations", item.exclusions],
        [
          "license_text",
          "Licence: allowed use, redistribution, resale, attribution & restrictions",
          item.license_text,
        ],
      ].map(([name, label, value]) => (
        <label key={name}>
          {label}
          <textarea
            name={name}
            defaultValue={value}
            required={["summary", "scope", "exclusions"].includes(name)}
            maxLength={name === "summary" ? 300 : 20000}
          />
        </label>
      ))}
      {[
        ["published", "Publish on the website", item.published],
        [
          "checkout_enabled",
          "Enable online ordering (digital products require approved files)",
          item.checkout_enabled,
        ],
        [
          "requires_quote",
          "Custom service: final scope and price require a quote",
          item.requires_quote,
        ],
        [
          "agreement_required",
          "Require a project NDA and services agreement before payment",
          item.agreement_required,
        ],
        [
          "booking_required",
          "This service is a scheduled consultation",
          item.booking_required,
        ],
      ].map(([name, label, checked]) => (
        <label className="checkbox" key={String(name)}>
          <input
            name={String(name)}
            type="checkbox"
            defaultChecked={Boolean(checked)}
          />
          <span>{label}</span>
        </label>
      ))}
      <button className="button" disabled={busy}>
        Save offer
      </button>
    </form>
  );
}
function Settings({
  settings: s,
  busy,
  save,
}: {
  settings: Business;
  busy: boolean;
  save: (s: unknown) => Promise<void>;
}) {
  return (
    <form
      className="panel admin-form stack-form"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const values: Record<string, string | boolean> = {};
        for (const key of [
          "legal_name",
          "contact_email",
          "address",
          "registration_number",
          "verification_url",
          "portrait_url",
          "license_url",
          "terms",
          "privacy",
          "refund_policy",
        ])
          values[key] = String(f.get(key) || "");
        for (const key of [
          "license_redacted_confirmed",
          "legal_approved",
          "bank_enabled",
          "stripe_enabled",
          "btc_enabled",
          "fiverr_enabled",
        ])
          values[key] = f.get(key) === "on";
        void save(values);
      }}
    >
      <h2>Company, trust & payment options</h2>
      <div className="form-grid">
        {[
          ["legal_name", "Legal company name"],
          ["contact_email", "Contact email"],
          ["address", "Business address"],
          ["registration_number", "Business registration number"],
          ["verification_url", "Official registry verification URL"],
          ["portrait_url", "Portrait image URL"],
          ["license_url", "Public, redacted licence URL"],
        ].map(([key, label]) => (
          <label className="field" key={key}>
            {label}
            <input
              name={key}
              type={key === "contact_email" ? "email" : "text"}
              defaultValue={String(s[key as keyof Business] || "")}
              required={["legal_name", "contact_email", "address"].includes(
                key,
              )}
            />
          </label>
        ))}
      </div>
      <label className="checkbox">
        <input
          type="checkbox"
          name="license_redacted_confirmed"
          defaultChecked={s.license_redacted_confirmed}
        />
        <span>
          The public licence copy excludes sensitive IDs, signatures and
          personal information.
        </span>
      </label>
      {[
        ["terms", "Customer terms"],
        ["privacy", "Privacy & data retention policy"],
        ["refund_policy", "Cancellation & refund policy"],
      ].map(([key, label]) => (
        <label key={key}>
          {label}
          <textarea
            name={key}
            className="large"
            defaultValue={String(s[key as keyof Business] || "")}
            maxLength={key === "refund_policy" ? 20000 : 40000}
          />
        </label>
      ))}
      <label className="checkbox">
        <input
          name="legal_approved"
          type="checkbox"
          defaultChecked={s.legal_approved}
        />
        <span>
          I have reviewed and approved the published customer policies. This
          permits ordering where individual offers are enabled.
        </span>
      </label>
      <h3>Payment routes</h3>
      {[
        [
          "stripe_enabled",
          "Enable Stripe Checkout (cards and eligible Apple Pay, Google Pay & Link)",
        ],
        ["bank_enabled", "Enable private bank transfer instructions"],
        ["btc_enabled", "Enable the configured BTCPay server"],
        ["fiverr_enabled", "Show the external Fiverr ordering option"],
      ].map(([key, label]) => (
        <label className="checkbox" key={key}>
          <input
            name={key}
            type="checkbox"
            defaultChecked={Boolean(s[key as keyof Business])}
          />
          <span>{label}</span>
        </label>
      ))}
      <p className="micro">
        Secrets and bank details are configured on the server, never in public
        frontend settings. Enabling a route requires its server configuration.
      </p>
      <button className="button" disabled={busy}>
        Save business settings
      </button>
    </form>
  );
}

function StaffPanel() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => {
    api<StaffMember[]>("staff").then(setStaff).catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <div className="panel admin-form">
      <h2>Staff access and permissions</h2>
      <p>
        Every staff account needs its own verified login and authenticator.
        Roles control business access; only the owner can invite, change or
        disable staff.
      </p>
      {error && <Notice error>{error}</Notice>}
      {notice && <Notice>{notice}</Notice>}
      <div className="staff-list">
        {staff.map((s) => (
          <div className="staff-row" key={s.user_id}>
            <div><strong>{s.display_name}</strong><p className="micro">{s.email}</p></div>
            <span className="badge">{s.role}</span>
            <span>{s.active ? "Active" : "Disabled"}</span>
          </div>
        ))}
      </div>
      <details>
        <summary>Invite or update a staff member</summary>
        <form
          className="stack-form"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const f = new FormData(form);
            setBusy(true); setError(""); setNotice("");
            api<{ invited: boolean }>("save-staff", {
              email: f.get("email"),
              display_name: f.get("display_name"),
              role: f.get("role"),
              active: f.get("active") === "on",
            })
              .then((r) => {
                setNotice(r.invited ? "Invitation sent and access prepared." : "Staff access updated.");
                form.reset();
                load();
              })
              .catch((e) => setError(e.message))
              .finally(() => setBusy(false));
          }}
        >
          <div className="form-grid">
            <label className="field">Full name<input name="display_name" required maxLength={150} /></label>
            <label className="field">Email<input name="email" type="email" required /></label>
            <label className="field">Role<select name="role"><option value="admin">Administrator</option><option value="sales">Sales</option><option value="engineer">Engineer</option><option value="support">Support</option><option value="editor">Content editor</option><option value="owner">Owner</option></select></label>
          </div>
          <label className="checkbox"><input type="checkbox" name="active" defaultChecked /><span>Access is active</span></label>
          <button className="button" disabled={busy}>Save staff access</button>
        </form>
      </details>
    </div>
  );
}

function CustomersPanel() {
  const [customers, setCustomers] = useState<CustomerSummary[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api<CustomerSummary[]>("customers").then(setCustomers).catch((e) => setError(e.message));
  }, []);
  return (
    <div className="panel admin-form">
      <h2>Customer profiles and buying journey</h2>
      <p className="micro">
        Optional page activity appears only after analytics consent. Operational
        orders, payments, refunds and disputes are recorded independently.
      </p>
      {error && <Notice error>{error}</Notice>}
      {!customers ? <p>Loading customer profiles…</p> : customers.length ? (
        <div className="customer-table-wrap">
          <table className="customer-table">
            <thead><tr><th>Customer</th><th>Phone</th><th>Journey</th><th>Orders</th><th>Relationship</th></tr></thead>
            <tbody>{customers.map((c) => (
              <tr key={c.user_id}>
                <td><strong>{c.full_name || c.email}</strong><br /><span className="micro">{c.company}<br />{c.email}</span></td>
                <td>{c.phone_e164 || "Not provided"}<br /><span className="micro">{c.phone_verified_at ? "Verified" : "Not SMS-verified"}{c.marketing_phone_consent_at ? " · marketing opted in" : ""}</span></td>
                <td>{c.visits} visits<br />{c.product_views} product views<br />{c.checkout_starts} checkout starts<br />{c.checkout_abandoned} drop-offs{c.last_dropoff_stage ? ` at ${humanStatus(c.last_dropoff_stage)}` : ""}{c.recent_products.length ? <><br /><span className="micro">Recent: {c.recent_products.join(", ")}</span></> : null}</td>
                <td>{c.orders} total<br />{c.paid_orders} paid<br />{c.refunds} refunds · {c.disputes} disputes</td>
                <td>Since {date(c.created_at)}<br /><span className="micro">Last seen {c.last_seen_at ? date(c.last_seen_at) : "not recorded"}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p>No customer profiles yet.</p>}
    </div>
  );
}

function CalendarPanel() {
  const [calendar, setCalendar] = useState<{ slots: { id: string; starts_at: string; ends_at: string; status: string }[]; appointments: Appointment[] } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => api<{ slots: { id: string; starts_at: string; ends_at: string; status: string }[]; appointments: Appointment[] }>("calendar").then(setCalendar).catch((e) => setError(e.message)), []);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <div className="admin-grid calendar-admin">
      <div className="panel admin-form">
        <h2>Upcoming consultations</h2>
        {error && <Notice error>{error}</Notice>}
        {notice && <Notice>{notice}</Notice>}
        {calendar?.appointments.length ? calendar.appointments.map((a) => (
          <article className="appointment-row" key={a.id}>
            <p className="eyebrow">{date(a.starts_at)} · {humanStatus(a.status)}</p>
            <p>Order <Link to={`/portal/orders/${a.order_id}`}>{a.order_id.slice(0, 8)}…</Link></p>
            <form className="stack-form" onSubmit={(e) => {
              e.preventDefault(); const f = new FormData(e.currentTarget); setBusy(true);
              api("update-appointment", { id: a.id, meeting_url: f.get("meeting_url") || "", status: f.get("status"), notes: f.get("notes") || "" })
                .then(() => { setNotice("Appointment updated."); load(); })
                .catch((e) => setError(e.message)).finally(() => setBusy(false));
            }}>
              <label>Meeting URL<input name="meeting_url" type="url" defaultValue={a.meeting_url} placeholder="https://…" /></label>
              <label>Status<select name="status" defaultValue={a.status}><option>scheduled</option><option>completed</option><option>cancelled</option><option>no_show</option></select></label>
              <label>Internal / client-visible notes<textarea name="notes" /></label>
              <button className="small-button" disabled={busy}>Update appointment</button>
            </form>
          </article>
        )) : <p>No consultations booked.</p>}
      </div>
      <div className="panel admin-form">
        <h2>Publish available times</h2>
        <form className="stack-form" onSubmit={(e) => {
          e.preventDefault(); const form = e.currentTarget; const f = new FormData(form); setBusy(true); setError("");
          api("add-availability", { starts_at: new Date(String(f.get("starts_at"))).toISOString(), ends_at: new Date(String(f.get("ends_at"))).toISOString() })
            .then(() => { setNotice("Availability published."); form.reset(); load(); })
            .catch((e) => setError(e.message)).finally(() => setBusy(false));
        }}>
          <label>Start<input name="starts_at" type="datetime-local" required /></label>
          <label>End<input name="ends_at" type="datetime-local" required /></label>
          <button className="button" disabled={busy}>Add available time</button>
        </form>
        <h3>Open and booked slots</h3>
        {calendar?.slots.map((s) => <p key={s.id}><span className="badge">{s.status}</span> {date(s.starts_at)} – {date(s.ends_at)}</p>)}
      </div>
    </div>
  );
}
