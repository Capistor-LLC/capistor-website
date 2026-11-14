import { useCallback, useEffect, useState, ReactNode } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../lib/useAuth";
import { api, exportRecord, uploadFile } from "./api";
import type { Order, OrderDetail, ProjectFile, OrderDocument } from "./types";
import { money, humanStatus } from "./types";
import { useCatalog } from "./context";
import { FIVERR_URL } from "./catalog";
import { Arrow, ButtonLink, Notice, PageIntro } from "./Shell";
import { AdminOrderTools } from "./OrderAdmin";
export const date = (s: string) =>
  new Date(s).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
export function PrivatePage({
  children,
  admin = false,
}: {
  children: ReactNode;
  admin?: boolean;
}) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <div className="page-wrap">
        <PageIntro label="CLIENT WORKSPACE" title="Checking your account…" />
      </div>
    );
  if (!user || (admin && !isAdmin))
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      {children}
    </>
  );
}
export function Portal() {
  const { user, signOut, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(() => {
    setError("");
    api<Order[]>("orders")
      .then(setOrders)
      .catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);
  return (
    <div className="page-wrap">
      <Helmet>
        <title>Your projects — Capistor</title>
      </Helmet>
      <header className="portal-heading">
        <div>
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h1>Your projects, in one place.</h1>
          <p className="micro">{user?.email}</p>
        </div>
        <div className="actions">
          {isAdmin && (
            <ButtonLink to="/admin/commerce" secondary>
              Admin
            </ButtonLink>
          )}
          <button className="small-button" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </header>
      {error ? (
        <Notice error>
          {error}{" "}
          <button className="small-button" onClick={load}>
            Retry
          </button>
        </Notice>
      ) : orders === null ? (
        <p>Loading your projects…</p>
      ) : orders.length ? (
        <div className="orders-list">
          {orders.map((o) => (
            <Link
              to={`/portal/orders/${o.id}`}
              className="order-row"
              key={o.id}
            >
              <div>
                <p className="eyebrow">{o.reference}</p>
                <p className="micro">{date(o.created_at)}</p>
              </div>
              <div>
                <h3>{o.item_snapshot.title}</h3>
                <p className="micro">
                  {humanStatus(o.payment_status)} · {humanStatus(o.status)}
                </p>
              </div>
              <span className="badge">{humanStatus(o.status)}</span>
              <strong>
                {money(o.total_minor, o.currency)} <Arrow />
              </strong>
            </Link>
          ))}
        </div>
      ) : (
        <section className="empty-shop">
          <h2>Your next project starts here.</h2>
          <p>
            No orders yet. Choose a service or explore the digital shop to get
            started.
          </p>
          <ButtonLink to="/services">Find a service</ButtonLink>
        </section>
      )}
    </div>
  );
}
export function OrderPage() {
  const { id } = useParams();
  const [data, setData] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("history");
  const [bank, setBank] = useState<Record<string, string> | null>(null);
  const { business } = useCatalog();
  const { user } = useAuth();
  const refresh = useCallback(async () => {
    try {
      setData(await api<OrderDetail>("order", undefined, { id: id! }));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, [id]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  useEffect(() => {
    if (
      !window.location.search.includes("payment=processing") ||
      data?.order.payment_status === "paid"
    )
      return;
    let count = 0;
    const interval = setInterval(() => {
      void refresh();
      if (++count >= 12) clearInterval(interval);
    }, 5000);
    return () => clearInterval(interval);
  }, [refresh, data?.order.payment_status]);
  async function action(work: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await work();
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function pay(provider: string) {
    await action(async () => {
      const r = await api<{ url?: string; bank?: Record<string, string> }>(
        "payment",
        { order_id: id, provider },
      );
      if (r.bank) setBank(r.bank);
      if (r.url) window.location.assign(r.url);
    });
  }
  if (!data)
    return (
      <div className="page-wrap">
        <PageIntro
          label="ORDER WORKSPACE"
          title={error ? "Unable to open this order" : "Loading your order…"}
        />
        {error && (
          <Notice error>
            {error}
            <button className="small-button" onClick={() => void refresh()}>
              Retry
            </button>
          </Notice>
        )}
      </div>
    );
  const { order: o, documents, signatures } = data;
  const latest = documents.filter(
    (d) => !documents.some((n) => n.kind === d.kind && n.version > d.version),
  );
  const signed = (kind: string) => {
    const d = latest.find((d) => d.kind === kind && d.status === "issued");
    return (
      !!d &&
      ["client", "company"].every((p) =>
        signatures.some(
          (s) =>
            s.document_id === d.id &&
            s.party === p &&
            s.document_sha256 === d.sha256,
        ),
      )
    );
  };
  const steps = [
    "Request",
    "Agreements",
    "Payment",
    "In progress",
    "Review",
    "Complete",
  ];
  const step =
    o.status === "completed"
      ? 5
      : o.status === "client_review"
        ? 4
        : o.status === "in_progress"
          ? 3
          : o.status === "awaiting_payment"
            ? 2
            : o.status === "awaiting_agreement"
              ? 1
              : 0;
  return (
    <div className="page-wrap">
      <Helmet>
        <title>{o.reference} — Capistor workspace</title>
      </Helmet>
      <Link
        className="back-link"
        to={data.isAdmin ? "/admin/commerce" : "/portal"}
      >
        ← {data.isAdmin ? "Admin workspace" : "Your projects"}
      </Link>
      <header className="portal-heading">
        <div>
          <p className="eyebrow">
            {o.reference} · CREATED {date(o.created_at)}
          </p>
          <h1>{o.item_snapshot.title}</h1>
        </div>
        <div className="actions">
          <button
            className="small-button"
            disabled={busy}
            onClick={() =>
              void action(() => exportRecord(o.id, "json", o.reference))
            }
          >
            Export full record
          </button>
          <button
            className="small-button"
            disabled={busy}
            onClick={() =>
              void action(() =>
                exportRecord(o.id, "csv", `${o.reference}-history`),
              )
            }
          >
            History CSV
          </button>
        </div>
      </header>
      {error && <Notice error>{error}</Notice>}
      {window.location.search.includes("payment=processing") &&
        o.payment_status !== "paid" && (
          <Notice>
            Payment confirmation is still being checked. This page cannot
            confirm a payment on its own. Please do not pay again while it is
            processing.{" "}
            <button className="small-button" onClick={() => void refresh()}>
              Refresh status
            </button>
          </Notice>
        )}
      {o.status === "cancelled" ? (
        <Notice>
          This order is cancelled. Contact Capistor if a payment still needs
          reconciliation.
        </Notice>
      ) : (
        <ol className="steps">
          {steps.map((s, i) => (
            <li key={s} className={i <= step ? "done" : ""}>
              {i + 1}. {s}
            </li>
          ))}
        </ol>
      )}
      <div className="portal-layout">
        <div>
          <div className="tabs" role="tablist" aria-label="Order sections">
            {["history", "agreements", "files", "scope", "support"].map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                aria-controls="order-tab"
                onClick={() => setTab(t)}
              >
                {humanStatus(t)}
              </button>
            ))}
          </div>
          <section id="order-tab" role="tabpanel" aria-label={tab}>
            {tab === "history" && (
              <>
                <div className="panel">
                  <h2>Project history</h2>
                  <p className="micro">
                    Times are shown in your local timezone. Exports retain UTC
                    timestamps.
                  </p>
                  <ol className="timeline">
                    {data.events.map((e) => (
                      <li key={e.id}>
                        <time dateTime={e.created_at}>
                          {date(e.created_at)}
                        </time>
                        <h3>{e.title}</h3>
                        {e.detail && <p>{e.detail}</p>}
                        {e.findings && (
                          <p>
                            <strong>Findings:</strong> {e.findings}
                          </p>
                        )}
                        {e.outcome && (
                          <p>
                            <strong>Outcome:</strong> {e.outcome}
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
                <form
                  className="panel stack-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const message = String(new FormData(form).get("message"));
                    void action(async () => {
                      await api("message", { order_id: o.id, message });
                      form.reset();
                    });
                  }}
                >
                  <h2>Add to the conversation</h2>
                  <label>
                    Message
                    <textarea name="message" required maxLength={10000} />
                  </label>
                  <p className="micro">
                    Messages become part of this order’s permanent record.
                  </p>
                  <button
                    className="button"
                    disabled={busy || o.status === "cancelled"}
                  >
                    Add message <Arrow />
                  </button>
                </form>
              </>
            )}
            {tab === "agreements" && (
              <>
                <Notice>
                  Read the entire document before signing. Each signature
                  records your name, verified email, date, consent and document
                  fingerprint. New versions require new signatures.
                </Notice>
                {documents.length === 0 ? (
                  <div className="panel">
                    <p>
                      {o.item_snapshot.kind === "digital"
                        ? "Your purchase is governed by the saved customer terms and product licence under Scope."
                        : "Your project-specific agreements are being prepared. Confidential uploads remain closed until the NDA is signed by both parties."}
                    </p>
                  </div>
                ) : (
                  documents.map((d) => (
                    <div className="panel" key={d.id}>
                      <div className="eyebrow">
                        {d.kind} · VERSION {d.version} · {d.status}
                        {!latest.includes(d) ? " · PREVIOUS VERSION" : ""}
                      </div>
                      <h2>{d.title}</h2>
                      <pre className="document-text">{d.body}</pre>
                      <p className="fingerprint">SHA-256: {d.sha256}</p>
                      {signatures
                        .filter((s) => s.document_id === d.id)
                        .map((s) => (
                          <div className="signature" key={s.id}>
                            <strong>{s.signer_name}</strong> · {s.party}
                            <br />
                            {s.signer_email} · {date(s.signed_at)}
                            <p className="micro">{s.consent_text}</p>
                          </div>
                        ))}
                      {d.status === "issued" &&
                        latest.includes(d) &&
                        !signatures.some(
                          (s) =>
                            s.document_id === d.id &&
                            s.party === (data.isAdmin ? "company" : "client"),
                        ) && <SignForm doc={d} busy={busy} run={action} />}
                    </div>
                  ))
                )}
                <div className="panel">
                  <h2>Proposal and decision history</h2>
                  <p className="micro">
                    Comments, objections, decisions and document versions stay
                    dated and cannot be overwritten.
                  </p>
                  {data.negotiations.length ? (
                    <ol className="timeline compact">
                      {data.negotiations.map((n) => (
                        <li key={n.id}>
                          <time dateTime={n.created_at}>{date(n.created_at)}</time>
                          <h3>
                            {n.document_kind.toUpperCase()} · {humanStatus(n.event_type)} · {n.actor_party}
                          </h3>
                          {n.clause_key && <p><strong>Clause:</strong> {n.clause_key}</p>}
                          <p>{n.message}</p>
                          {(n.previous_text || n.proposed_text) && (
                            <details>
                              <summary>Compare recorded text</summary>
                              <TextDifference before={n.previous_text} after={n.proposed_text} />
                            </details>
                          )}
                          {n.decision && <p><strong>Decision:</strong> {n.decision}</p>}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="micro">No objections or decisions recorded yet.</p>
                  )}
                  <NegotiationForm orderId={o.id} documents={documents} busy={busy} run={action} />
                </div>
              </>
            )}
            {tab === "files" && (
              <>
                <div className="panel">
                  <h2>Project files</h2>
                  <p className="micro">
                    Files are private. New uploads remain quarantined until
                    reviewed. Approved deliverables require confirmed payment.
                  </p>
                  {o.item_snapshot.kind === "service" &&
                    o.item_snapshot.agreement_required !== false && (
                    <>
                      {signed("nda") ? (
                        <Upload
                          destination={{ order_id: o.id }}
                          onDone={refresh}
                        />
                      ) : (
                        <Notice>
                          Both parties must sign the current NDA before project
                          uploads open.
                        </Notice>
                      )}
                    </>
                  )}
                  <Files
                    files={[...data.files, ...data.downloads]}
                    admin={data.isAdmin}
                    run={action}
                  />
                </div>
              </>
            )}
            {tab === "scope" && (
              <div className="panel">
                <h2>The agreed work</h2>
                <p>
                  <strong>Client:</strong> {o.client_name}
                  {o.company && ` · ${o.company}`}
                </p>
                <p className="prose-text">
                  <strong>Brief</strong>
                  <br />
                  {o.brief}
                </p>
                <p className="prose-text">
                  <strong>Scope</strong>
                  <br />
                  {o.item_snapshot.scope}
                </p>
                <p className="prose-text">
                  <strong>Exclusions</strong>
                  <br />
                  {o.item_snapshot.exclusions}
                </p>
                <p>
                  <strong>Revision rounds:</strong>{" "}
                  {o.item_snapshot.revision_limit}
                </p>
                <p>
                  <strong>Delivery window:</strong>{" "}
                  {o.item_snapshot.delivery_days} business days after kickoff,
                  unless your signed agreement states otherwise.
                </p>
                {o.accepted_license && (
                  <details>
                    <summary>Saved product licence</summary>
                    <pre className="document-text">{o.accepted_license}</pre>
                  </details>
                )}
                <details>
                  <summary>Saved customer terms & refund policy</summary>
                  <pre className="document-text">{o.accepted_terms}</pre>
                </details>
              </div>
            )}
            {tab === "support" && (
              <div className="panel">
                <h2>Support, refund or dispute</h2>
                <p>
                  Open a dated ticket here or email {business.contact_email} with
                  {` ${o.reference}`}. The request, decision and outcome remain
                  with the order.
                </p>
                {data.supportCases.map((c) => (
                  <article className="support-case" key={c.id}>
                    <p className="eyebrow">{humanStatus(c.case_type)} · {humanStatus(c.status)} · {date(c.created_at)}</p>
                    <h3>{c.subject}</h3>
                    <p>{c.detail}</p>
                    {c.requested_remedy && <p><strong>Requested:</strong> {c.requested_remedy}</p>}
                    {c.decision && <p><strong>Decision:</strong> {c.decision}</p>}
                    {data.isAdmin && (
                      <form className="stack-form" onSubmit={(e) => {
                        e.preventDefault(); const f = new FormData(e.currentTarget);
                        void action(() => api("update-support-case", { id: c.id, status: f.get("status"), decision: f.get("decision") || "" }));
                      }}>
                        <label>Status<select name="status" defaultValue={c.status}><option>open</option><option>investigating</option><option>waiting_customer</option><option>approved</option><option>resolved</option><option>rejected</option><option>closed</option></select></label>
                        <label>Decision and outcome<textarea name="decision" defaultValue={c.decision} maxLength={20000} /></label>
                        <button className="small-button" disabled={busy}>Save ticket decision</button>
                      </form>
                    )}
                  </article>
                ))}
                <SupportForm orderId={o.id} busy={busy} run={action} />
              </div>
            )}
          </section>
          {data.isAdmin && (
            <AdminOrderTools data={data} run={action} busy={busy} />
          )}
        </div>
        <aside>
          <div className="panel">
            <p className="eyebrow">ORDER SUMMARY</p>
            <div className="big-price">{money(o.total_minor, o.currency)}</div>
            <span className="badge">
              Payment: {humanStatus(o.payment_status)}
            </span>
            <dl className="details-list">
              <dt>Status</dt>
              <dd>{humanStatus(o.status)}</dd>
              <dt>Due</dt>
              <dd>{o.due_at ? date(o.due_at) : "Confirmed at kickoff"}</dd>
            </dl>
            {o.outcome && <p className="prose-text">{o.outcome}</p>}
            {o.invoice_pdf && (
              <a
                className="text-link"
                target="_blank"
                rel="noreferrer"
                href={o.invoice_pdf}
              >
                Download paid invoice <Arrow />
              </a>
            )}
            {o.invoice_url && (
              <p>
                <a
                  className="text-link"
                  target="_blank"
                  rel="noreferrer"
                  href={o.invoice_url}
                >
                  View Stripe invoice <Arrow />
                </a>
              </p>
            )}
          </div>
          {o.item_snapshot.booking_required && o.payment_status === "paid" && (
            <AppointmentPanel data={data} busy={busy} run={action} />
          )}
          {o.status === "awaiting_payment" &&
            ["unpaid", "pending"].includes(o.payment_status) &&
            user?.id === o.client_id && (
              <div className="panel">
                <h2>Choose how to pay</h2>
                <p className="micro">
                  Choose one payment method. Once payment starts, contact
                  Capistor before switching so you aren’t charged twice.
                </p>
                {business.stripe_enabled && (
                  <>
                    <button
                      className="button full"
                      disabled={busy}
                      onClick={() => void pay("stripe")}
                    >
                      Continue to Stripe <Arrow />
                    </button>
                    <p className="micro">
                      Cards · Apple Pay · Google Pay · Link
                      <br />
                      Wallet availability depends on your device, location and
                      account eligibility.
                    </p>
                  </>
                )}
                {business.bank_enabled &&
                  o.item_snapshot.tax_mode !== "automatic" && (
                    <button
                      className="button secondary full"
                      disabled={busy}
                      onClick={() => void pay("bank")}
                    >
                      Bank transfer instructions
                    </button>
                  )}
                {business.btc_enabled &&
                  o.item_snapshot.tax_mode !== "automatic" && (
                    <button
                      className="button secondary full"
                      disabled={busy}
                      onClick={() => void pay("btcpay")}
                    >
                      Pay with Bitcoin
                    </button>
                  )}
                {!business.stripe_enabled &&
                  !business.bank_enabled &&
                  !business.btc_enabled && (
                    <Notice>
                      Payment options are being prepared. Please contact
                      Capistor.
                    </Notice>
                  )}
                {bank && (
                  <div>
                    <Notice>
                      Send exactly {money(o.total_minor, o.currency)} using
                      reference <strong>{o.reference}</strong>. Only cleared
                      funds confirm payment. Contact us before sending another
                      currency.
                    </Notice>
                    <dl className="details-list">
                      {Object.entries(bank).map(([k, v]) => (
                        <div key={k} style={{ gridColumn: "1/-1" }}>
                          <dt>{humanStatus(k)}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            )}
          <div className="panel">
            <h3>Need a hand?</h3>
            <p className="micro">Include {o.reference} when contacting us.</p>
            <a
              className="text-link"
              href={`mailto:${business.contact_email}?subject=${o.reference}`}
            >
              Contact Capistor <Arrow />
            </a>
            {business.fiverr_enabled && (
              <p className="micro">
                <a href={FIVERR_URL} target="_blank" rel="noreferrer">
                  Prefer Fiverr?
                </a>{" "}
                Agree on that route before paying. Do not pay twice.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
function NegotiationForm({
  orderId,
  documents,
  busy,
  run,
}: {
  orderId: string;
  documents: OrderDocument[];
  busy: boolean;
  run: (work: () => Promise<unknown>) => Promise<void>;
}) {
  return (
    <details>
      <summary>Add a comment, objection or decision</summary>
      <form
        className="stack-form"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const f = new FormData(form);
          const kind = String(f.get("kind"));
          const current = [...documents].reverse().find((d) => d.kind === kind);
          void run(async () => {
            await api("negotiation", {
              order_id: orderId,
              document_id: current?.id || null,
              document_kind: kind,
              event_type: f.get("event_type"),
              clause_key: f.get("clause_key") || "",
              message: f.get("message"),
              previous_text: "",
              proposed_text: f.get("proposed_text") || "",
              decision: f.get("decision") || "",
            });
            form.reset();
          });
        }}
      >
        <div className="form-grid">
          <label className="field">
            Document
            <select name="kind"><option value="contract">Contract</option><option value="nda">NDA</option></select>
          </label>
          <label className="field">
            Entry type
            <select name="event_type"><option value="commented">Comment</option><option value="objected">Objection</option><option value="accepted">Acceptance</option><option value="decision">Decision</option></select>
          </label>
        </div>
        <label>
          Clause or subject
          <input name="clause_key" maxLength={120} placeholder="e.g. 6. Revisions" />
        </label>
        <label>
          Comment or reason
          <textarea name="message" required maxLength={10000} />
        </label>
        <label>
          Proposed replacement text (optional)
          <textarea name="proposed_text" maxLength={40000} />
        </label>
        <label>
          Recorded decision (optional)
          <textarea name="decision" maxLength={10000} />
        </label>
        <button className="button secondary" disabled={busy}>Record entry</button>
      </form>
    </details>
  );
}
function TextDifference({ before, after }: { before: string; after: string }) {
  const oldLines = before.split("\n");
  const newLines = after.split("\n");
  let start = 0;
  while (start < oldLines.length && start < newLines.length && oldLines[start] === newLines[start]) start++;
  let oldEnd = oldLines.length - 1;
  let newEnd = newLines.length - 1;
  while (oldEnd >= start && newEnd >= start && oldLines[oldEnd] === newLines[newEnd]) {
    oldEnd--; newEnd--;
  }
  const contextStart = Math.max(0, start - 2);
  const contextOldEnd = Math.min(oldLines.length, oldEnd + 3);
  const contextNewEnd = Math.min(newLines.length, newEnd + 3);
  return (
    <div className="document-diff">
      <div><h4>Previous</h4><pre className="document-text diff-old">{oldLines.slice(contextStart, contextOldEnd).join("\n") || "No previous text"}</pre></div>
      <div><h4>Proposed</h4><pre className="document-text diff-new">{newLines.slice(contextStart, contextNewEnd).join("\n") || "No proposed text"}</pre></div>
    </div>
  );
}

function SupportForm({
  orderId,
  busy,
  run,
}: {
  orderId: string;
  busy: boolean;
  run: (work: () => Promise<unknown>) => Promise<void>;
}) {
  return (
    <details>
      <summary>Open a new ticket</summary>
      <form
        className="stack-form"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const f = new FormData(form);
          void run(async () => {
            await api("support-case", {
              order_id: orderId,
              case_type: f.get("case_type"),
              subject: f.get("subject"),
              detail: f.get("detail"),
              requested_remedy: f.get("remedy") || "",
            });
            form.reset();
          });
        }}
      >
        <label>
          Ticket type
          <select name="case_type">
            <option value="support">General support</option>
            <option value="engineering_flaw">Engineering flaw guarantee</option>
            <option value="return">Return or physical PCB problem</option>
            <option value="refund">Refund request</option>
            <option value="dispute">Dispute</option>
          </select>
        </label>
        <label>Subject<input name="subject" required maxLength={200} /></label>
        <label>What happened?<textarea name="detail" required maxLength={20000} /></label>
        <label>Preferred remedy<textarea name="remedy" maxLength={5000} placeholder="Correction, replacement or refund" /></label>
        <button className="button" disabled={busy}>Open ticket</button>
      </form>
    </details>
  );
}

function AppointmentPanel({
  data,
  busy,
  run,
}: {
  data: OrderDetail;
  busy: boolean;
  run: (work: () => Promise<unknown>) => Promise<void>;
}) {
  const [slots, setSlots] = useState<
    { id: string; starts_at: string; ends_at: string }[]
  >([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (data.appointment || loaded) return;
    setLoaded(true);
    api<{ id: string; starts_at: string; ends_at: string }[]>(
      "available-slots",
      undefined,
      { id: data.order.id },
    )
      .then(setSlots)
      .catch(() => setSlots([]));
  }, [data.appointment, data.order.id, loaded]);
  if (data.appointment)
    return (
      <div className="panel appointment-card">
        <p className="eyebrow">YOUR CONSULTATION</p>
        <h2>{date(data.appointment.starts_at)}</h2>
        <p>{Intl.DateTimeFormat().resolvedOptions().timeZone} · {humanStatus(data.appointment.status)}</p>
        {data.appointment.meeting_url ? (
          <a className="button full" href={data.appointment.meeting_url} target="_blank" rel="noreferrer">Join call <Arrow /></a>
        ) : (
          <Notice>The joining link will appear here and in your notification before the appointment.</Notice>
        )}
      </div>
    );
  return (
    <div className="panel appointment-card">
      <p className="eyebrow">BOOK YOUR CALL</p>
      <h2>Choose an available time.</h2>
      {slots.length ? (
        <div className="slot-list">
          {slots.map((slot) => (
            <button
              key={slot.id}
              className="small-button"
              disabled={busy}
              onClick={() =>
                void run(() =>
                  api("book-appointment", {
                    order_id: data.order.id,
                    slot_id: slot.id,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  }),
                )
              }
            >
              {date(slot.starts_at)}
            </button>
          ))}
        </div>
      ) : (
        <Notice>New appointment times are being added. You will be notified when a slot opens.</Notice>
      )}
    </div>
  );
}

function SignForm({
  doc,
  busy,
  run,
}: {
  doc: OrderDocument;
  busy: boolean;
  run: (work: () => Promise<unknown>) => Promise<void>;
}) {
  return (
    <form
      className="stack-form"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        void run(() =>
          api("sign", {
            document_id: doc.id,
            sha256: doc.sha256,
            name: f.get("name"),
            consent: f.get("consent") === "on",
          }),
        );
      }}
    >
      <label>
        Full legal name
        <input name="name" required maxLength={150} autoComplete="name" />
      </label>
      <label className="checkbox">
        <input type="checkbox" name="consent" required />
        <span>
          I have read this complete document and agree to sign it
          electronically. I am authorised to sign for the named party. My
          signature applies only to this version and its SHA-256 fingerprint.
        </span>
      </label>
      <button className="button" disabled={busy}>
        Sign this version
      </button>
    </form>
  );
}
export function Upload({
  destination,
  onDone,
}: {
  destination: { order_id?: string; item_id?: string };
  onDone: () => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  return (
    <form
      className="file-upload stack-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        const file = f.get("file") as File;
        setBusy(true);
        setError("");
        setMessage("");
        try {
          await uploadFile(file, destination, String(f.get("version")));
          setMessage("Uploaded. The file is awaiting security review.");
          form.reset();
          await onDone();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>
        Select a file
        <input
          type="file"
          name="file"
          required
          accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.csv,.zip,.step,.stp,.stl,.3mf,.dxf,.dwg,.kicad_pcb,.kicad_sch,.kicad_pro,.gbr,.gerber,.drl,.sch,.brd"
        />
      </label>
      <label>
        Version / label
        <input
          name="version"
          required
          maxLength={50}
          placeholder="e.g. Prototype v1.2"
        />
      </label>
      <p className="micro">
        Engineering files, images, PDF, text or ZIP · up to 25 MB. Do not
        include passwords or unrelated personal information.
      </p>
      <button className="button secondary" disabled={busy}>
        {busy ? "Uploading & verifying…" : "Upload private file"}
      </button>
      {error && <Notice error>{error}</Notice>}
      {message && <Notice>{message}</Notice>}
    </form>
  );
}
export function Files({
  files,
  admin,
  run,
}: {
  files: ProjectFile[];
  admin: boolean;
  run: (work: () => Promise<unknown>) => Promise<void>;
}) {
  const [review, setReview] = useState<string | null>(null);
  if (!files.length) return <p className="micro">No released files yet.</p>;
  return (
    <>
      {files.map((f) => (
        <div key={f.id}>
          <div className="file-row">
            <div>
              <strong>{f.filename}</strong>
              <p>
                Version {f.version_label} ·{" "}
                {(f.size_bytes / 1024 / 1024).toFixed(2)} MB ·{" "}
                {date(f.created_at)}
              </p>
              <span className="badge">{f.status}</span>
              <p className="fingerprint">SHA-256 {f.sha256}</p>
              {f.review_note && <p>{f.review_note}</p>}
            </div>
            <div className="file-actions">
              {(f.status === "approved" ||
                (admin && f.status === "quarantined")) && (
                <button
                  className="small-button"
                  onClick={() =>
                    void run(async () => {
                      const r = await api<{ url: string }>("download", {
                        file_id: f.id,
                        review: f.status === "quarantined",
                      });
                      window.location.assign(r.url);
                    })
                  }
                >
                  {f.status === "quarantined"
                    ? "Download for review"
                    : "Download"}
                </button>
              )}
              {admin && f.status !== "uploading" && (
                <button
                  className="small-button"
                  onClick={() => setReview(review === f.id ? null : f.id)}
                >
                  Review
                </button>
              )}
            </div>
          </div>
          {review === f.id && (
            <form
              className="stack-form panel"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                void run(async () => {
                  await api("review-file", {
                    file_id: f.id,
                    status: form.get("status"),
                    review_note: form.get("note"),
                    scanned: form.get("scanned") === "on",
                  });
                  setReview(null);
                });
              }}
            >
              <p>
                This app does not include an automatic antivirus scanner.
                Inspect quarantined files in an isolated environment and scan
                them before release.
              </p>
              <label>
                Decision
                <select name="status">
                  <option value="rejected">Reject / keep access blocked</option>
                  <option value="approved">Approve for release</option>
                </select>
              </label>
              <label>
                Review findings
                <textarea name="note" required maxLength={2000} />
              </label>
              <label className="checkbox">
                <input type="checkbox" name="scanned" required />
                <span>
                  I have completed a malware scan and reviewed this exact file
                  hash, including archive contents where applicable.
                </span>
              </label>
              <button className="button">Save review decision</button>
            </form>
          )}
        </div>
      ))}
    </>
  );
}
