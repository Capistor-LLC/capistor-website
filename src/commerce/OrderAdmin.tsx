import type { OrderDetail } from "./types";
import { api } from "./api";
type Props = {
  data: OrderDetail;
  run: (work: () => Promise<unknown>) => Promise<void>;
  busy: boolean;
};
export function AdminOrderTools({ data, run, busy }: Props) {
  const o = data.order;
  return (
    <section className="panel admin-form">
      <p className="eyebrow">ADMINISTRATOR CONTROLS</p>
      <h2>Manage this project</h2>
      <details>
        <summary>Publish progress, findings & next steps</summary>
        <form
          className="stack-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void run(() =>
              api("update-order", {
                order_id: o.id,
                title: f.get("title"),
                detail: f.get("detail"),
                findings: f.get("findings"),
                outcome: f.get("outcome"),
                status: f.get("status"),
                due_at: f.get("due")
                  ? new Date(String(f.get("due"))).toISOString()
                  : null,
              }),
            );
          }}
        >
          <label>
            Update title
            <input name="title" required maxLength={200} />
          </label>
          <label>
            Progress
            <textarea name="detail" maxLength={20000} />
          </label>
          <label>
            Findings
            <textarea name="findings" maxLength={20000} />
          </label>
          <label>
            Outcome / next step
            <textarea name="outcome" maxLength={20000} />
          </label>
          <label>
            Status
            <select name="status" defaultValue={o.status}>
              {[
                "received",
                "scoping",
                "awaiting_agreement",
                "awaiting_payment",
                "in_progress",
                "client_review",
                "completed",
                "cancelled",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Committed due date & time
            <input
              type="datetime-local"
              name="due"
              defaultValue={
                o.due_at
                  ? new Date(
                      new Date(o.due_at).getTime() -
                        new Date(o.due_at).getTimezoneOffset() * 60000,
                    )
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
            />
          </label>
          <button disabled={busy} className="button">
            Publish update
          </button>
        </form>
      </details>
      <hr />
      <details>
        <summary>Set the client’s quote</summary>
        <p className="micro">
          Only before a contract is signed or payment starts. Repricing
          supersedes unsigned contracts. Issue a new contract showing the
          revised price and scope afterwards.
        </p>
        <form
          className="stack-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void run(() =>
              api("quote", {
                order_id: o.id,
                price_minor: Math.round(Number(f.get("price")) * 100),
                tax_bps: Math.round(Number(f.get("tax")) * 100),
                scope: f.get("scope"),
                exclusions: f.get("exclusions"),
                delivery_days: Number(f.get("days")),
                revision_limit: Number(f.get("revisions")),
              }),
            );
          }}
        >
          <label>
            Price ({o.currency})
            <input
              name="price"
              type="number"
              step="0.01"
              min="1"
              defaultValue={o.item_snapshot.price_minor / 100}
              required
            />
          </label>
          <label>
            Manual tax rate (%)
            <input
              name="tax"
              type="number"
              step="0.01"
              min="0"
              max="25"
              defaultValue={o.item_snapshot.tax_bps / 100}
            />
          </label>
          <label>
            Exact scope
            <textarea
              name="scope"
              defaultValue={o.item_snapshot.scope}
              required
            />
          </label>
          <label>
            Exclusions
            <textarea
              name="exclusions"
              defaultValue={o.item_snapshot.exclusions}
              required
            />
          </label>
          <label>
            Business days after kickoff
            <input
              name="days"
              type="number"
              min="1"
              max="365"
              defaultValue={o.item_snapshot.delivery_days}
              required
            />
          </label>
          <label>
            Included revision rounds
            <input
              name="revisions"
              type="number"
              min="0"
              max="20"
              defaultValue={o.item_snapshot.revision_limit}
              required
            />
          </label>
          <button className="button" disabled={busy}>
            Save final quote
          </button>
        </form>
      </details>
      <hr />
      <details>
        <summary>Prepare & issue project agreements</summary>
        <p className="micro">
          Review all project-specific clauses. Issued versions cannot be edited.
          Creating another version preserves history and requires new
          signatures. Agreements lock when payment starts.
        </p>
        {["nda", "contract"].map((kind) => {
          const d = [...data.documents].reverse().find((d) => d.kind === kind);
          return (
            <form
              className="stack-form"
              key={`${kind}-${d?.id}`}
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void run(() =>
                  api("save-document", {
                    order_id: o.id,
                    kind,
                    title: f.get("title"),
                    body: f.get("body"),
                    issue: f.get("issue") === "on",
                  }),
                );
              }}
            >
              <h3>{kind.toUpperCase()}</h3>
              <label>
                Document title
                <input
                  name="title"
                  defaultValue={d?.title || kind.toUpperCase()}
                  required
                />
              </label>
              <label>
                Full document text
                <textarea
                  className="large"
                  name="body"
                  defaultValue={d?.body || ""}
                  required
                  maxLength={40000}
                />
              </label>
              <label className="checkbox">
                <input name="issue" type="checkbox" />
                <span>
                  I have reviewed all clauses, scope and price; issue this
                  version for signature.
                </span>
              </label>
              <button className="button" disabled={busy}>
                Save new {kind.toUpperCase()} version
              </button>
            </form>
          );
        })}
      </details>
      <hr />
      <details>
        <summary>Reconcile a bank transfer</summary>
        <p className="micro">
          Confirm cleared funds in the business bank account. A screenshot or
          client receipt is not proof of settlement. Do not use this for Stripe
          or Bitcoin.
        </p>
        <form
          className="stack-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void run(() =>
              api("confirm-bank", {
                order_id: o.id,
                amount_minor: Math.round(Number(f.get("amount")) * 100),
                currency: f.get("currency"),
                bank_reference: f.get("reference"),
                funds_received: f.get("received") === "on",
              }),
            );
          }}
        >
          <label>
            Amount actually received
            <input type="number" step="0.01" name="amount" required min="1" />
          </label>
          <label>
            Currency
            <input
              name="currency"
              required
              pattern="[A-Z]{3}"
              placeholder={o.currency}
            />
          </label>
          <label>
            Bank transaction reference
            <input name="reference" required maxLength={200} />
          </label>
          <label className="checkbox">
            <input name="received" type="checkbox" required />
            <span>
              I verified these cleared funds in the company bank account, with
              the correct order reference.
            </span>
          </label>
          <button className="button" disabled={busy}>
            Confirm bank settlement
          </button>
        </form>
      </details>
    </section>
  );
}
