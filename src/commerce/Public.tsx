import { useEffect, useRef, useState, FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Seo from "../components/ui/Seo";
import { useAuth } from "../lib/useAuth";
import { useCatalog } from "./context";
import { money, ShopItem } from "./types";
import { FIVERR_URL } from "./catalog";
import { api, trackJourney } from "./api";
import { Arrow, ButtonLink, Notice, PageIntro } from "./Shell";

function ServiceRows() {
  const { items, available } = useCatalog();
  return (
    <div className="service-rows">
      {items
        .filter((i) => i.kind === "service")
        .map((item, n) => (
          <Link
            className="service-row"
            key={item.id}
            to={`/services/${item.slug}`}
          >
            <span className="row-number">0{n + 1}</span>
            <div>
              <p className="eyebrow">{item.category.replace(/^\d+ \/ /, "")}</p>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
            </div>
            <div className="row-price">
              <small>
                {item.requires_quote
                  ? "Starting from"
                  : available
                    ? "Fixed scope"
                    : "Guide price"}
              </small>
              <strong>{money(item.price_minor, item.currency)}</strong>
              <small>
                {item.requires_quote
                  ? "Final quote before commitment"
                  : `${item.delivery_days} business days after kickoff`}
              </small>
            </div>
            <Arrow />
          </Link>
        ))}
    </div>
  );
}
export function Home() {
  return (
    <>
      <Seo
        title="PCB design, hardware reviews & consultation"
        url="/"
        description="Make your next hardware decision with confidence. PCB design, engineering consultations and clear, scoped reviews from Capistor in Dubai."
        image="/bgimages/BgCircuit.jpg"
      />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" />
            INDEPENDENT ENGINEERING · DUBAI, UAE
          </p>
          <h1>
            Your idea.
            <br />A clear path
            <br />
            to <em>hardware.</em>
          </h1>
          <p className="hero-description">
            PCB design, honest technical advice, and the files you need to move
            forward. Start small. Know what you’re getting.
          </p>
          <div className="actions">
            <ButtonLink to="/services">Find your next step</ButtonLink>
            <ButtonLink to="/work" secondary>
              Explore the work
            </ButtonLink>
          </div>
          <p className="micro">
            A defined scope. A clear price. A person you can talk to.
          </p>
        </div>
        <div className="hero-visual">
          <img
            src="/bgimages/BgCircuit.jpg"
            alt="Close-up of a densely populated circuit board, showing fine traces and components"
            width={3840}
            height={2160}
            loading="eager"
          />
          <div className="visual-top">
            <span>THE DETAILS MAKE THE DIFFERENCE</span>
            <span>PCB / 01</span>
          </div>
          <div className="visual-bottom">
            <span className="crosshair">+</span>
            <div>
              From the first question
              <br />
              <strong>to a better-designed board.</strong>
            </div>
            <span className="visual-coordinate">
              DESIGN
              <br />
              REVIEW
              <br />
              DEVELOP
            </span>
          </div>
        </div>
      </section>
      <section className="principles" aria-label="How we work">
        <p>
          <span>01</span> Scope before commitment
        </p>
        <p>
          <span>02</span> Direct engineer communication
        </p>
        <p>
          <span>03</span> Clear deliverables & records
        </p>
        <p>
          <span>04</span> Engineering integrity guarantee
        </p>
      </section>
      <section className="guarantee-strip">
        <div>
          <p className="eyebrow">ENGINEERING INTEGRITY GUARANTEE</p>
          <h2>We take responsibility for the work.</h2>
        </div>
        <p>
          A verified engineering flaw introduced by Capistor is corrected,
          remade or replaced without charge. If it cannot be corrected, the
          affected design fee is refunded in full. Physical PCBs supplied by
          Capistor pass the quality-control steps recorded for the order before
          dispatch.
        </p>
        <Link className="text-link" to="/legal/refunds">Read the guarantee <Arrow /></Link>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">WORK WITH CAPISTOR</p>
            <h2>Start where you are.</h2>
          </div>
          <p>
            You don’t need a finished specification.
            <br />
            You do need a clear next step.
          </p>
        </div>
        <ServiceRows />
        <p className="section-note">
          Prices are in the displayed currency. Any applicable tax is shown
          before you order. Custom work is quoted after scope review.
        </p>
      </section>
      <section className="process-section section">
        <div>
          <p className="eyebrow">NO GUESSWORK</p>
          <h2>
            You should always know
            <br />
            what happens next.
          </h2>
          <p className="body-copy">
            A good engineering project needs more than a payment button. It
            needs shared expectations and a useful record of the work.
          </p>
          <ButtonLink to="/services" secondary>
            See how ordering works
          </ButtonLink>
        </div>
        <ol className="process-list">
          <li>
            <span>01</span>
            <div>
              <h3>Tell me what you’re building</h3>
              <p>Choose a service and share a non-confidential brief.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Agree on the work</h3>
              <p>
                Review the scope, price, dates and agreements before payment.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Follow the progress</h3>
              <p>
                Keep signed documents, files and dated updates in your order
                workspace.
              </p>
            </div>
          </li>
          <li>
            <span>04</span>
            <div>
              <h3>Leave with something useful</h3>
              <p>
                Receive the agreed deliverables and export your project record.
              </p>
            </div>
          </li>
        </ol>
      </section>
      <section className="section founder-strip">
        <img
          src="/cv_assets/my_picture.png"
          alt="Shoaib Mustafa, the engineer behind Capistor"
          loading="lazy"
        />
        <div>
          <p className="eyebrow">A PERSON BEHIND THE CIRCUITS</p>
          <h2>Hi, I’m Shoaib.</h2>
          <p>
            I’m the engineer behind Capistor. I work with people turning ideas
            into electronic products—and people who need a careful second look
            at a design.
          </p>
          <div className="text-links">
            <Link to="/about">
              Meet your engineer <Arrow />
            </Link>
            <a href={FIVERR_URL} target="_blank" rel="noreferrer">
              Read my Fiverr reviews <Arrow />
            </a>
          </div>
        </div>
      </section>
      <section className="shop-teaser">
        <div>
          <p className="eyebrow">THE DIGITAL WORKBENCH</p>
          <h2>
            Useful files.
            <br />
            Yours to build with.
          </h2>
          <p>
            PCB designs, CAD files and printable objects. Each release will
            spell out exactly what’s included, which tools you need and how you
            may use it.
          </p>
          <ButtonLink to="/shop">Explore the digital shop</ButtonLink>
        </div>
        <div className="blueprint" aria-hidden="true">
          <div className="blueprint-board">
            <i />
            <i />
            <i />
            <i />
            <span>
              DESIGN
              <br />
              BUILD
              <br />
              REPEAT.
            </span>
          </div>
          <small>DESIGN FILES / CLEAR LICENCES / VERSIONED RELEASES</small>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FROM THE WORKBENCH</p>
            <h2>A little clarity goes a long way.</h2>
          </div>
          <Link className="text-link" to="/journal">
            Read the journal <Arrow />
          </Link>
        </div>
        <div className="article-preview">
          <Link to="/journal/better-hardware-project-brief">
            <span className="eyebrow">PLANNING · 4 MIN READ</span>
            <h3>
              Before you design a PCB,
              <br />
              write a better brief.
            </h3>
            <Arrow />
          </Link>
          <Link to="/journal/pcb-review-before-manufacturing">
            <span className="eyebrow">PCB DESIGN · 4 MIN READ</span>
            <h3>
              What a pre-order PCB
              <br />
              review can actually tell you.
            </h3>
            <Arrow />
          </Link>
        </div>
      </section>
    </>
  );
}
export function Services() {
  return (
    <div className="page-wrap">
      <Seo title="PCB design & engineering services" url="/services" />
      <PageIntro
        label="ENGINEERING SERVICES"
        title="A useful next step. A defined scope."
      >
        <p>
          Start with a consultation, get your design reviewed, or commission a
          custom board. Every service has clear inclusions and limits.
        </p>
      </PageIntro>
      <ServiceRows />
      <section className="two-col section">
        <div>
          <h2>Before the clock starts.</h2>
          <p>
            Delivery windows start after scope is agreed, required files are
            received, both parties sign, and payment is confirmed. Requested
            changes and missing information can affect the schedule; updates
            belong in your project record.
          </p>
        </div>
        <div>
          <h3>Have something different in mind?</h3>
          <p>
            CAD, enclosure work, firmware or a larger development project can be
            scoped separately. Explain the outcome you need and we’ll establish
            what fits.
          </p>
          <a className="text-link" href="mailto:inquiry@capistor.com">
            Discuss a custom project <Arrow />
          </a>
        </div>
      </section>
      <section className="faq">
        <h2>A few things to know.</h2>
        {[
          [
            "Can I share confidential files?",
            "Start with a non-confidential brief. Project uploads open only after the current NDA is signed by both parties. Do not put secrets in the initial brief.",
          ],
          [
            "Is a design review a certification?",
            "No. A review identifies issues within the agreed scope. It is not a safety certification, compliance assessment, physical test or guarantee of production readiness.",
          ],
          [
            "What if I prefer Fiverr?",
            "You can discuss a separately scoped order on Fiverr. Its payment process, terms and fees apply there. Please do not pay twice for the same work.",
          ],
          [
            "Can I buy a downloadable design?",
            "Published releases in the digital shop include a file list, version and usage licence. Access is released after payment confirmation.",
          ],
        ].map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
export function Shop() {
  const { items } = useCatalog();
  const products = items.filter((i) => i.kind === "digital");
  return (
    <div className="page-wrap">
      <Seo
        title="Digital PCB designs, CAD files & 3D print files"
        url="/shop"
      />
      <PageIntro
        label="THE DIGITAL WORKBENCH"
        title="Good files. Clear possibilities."
      >
        <p>
          Downloadable designs with a clear file list, version, compatibility
          notes and licence. Know what you can build before you buy.
        </p>
      </PageIntro>
      {products.length ? (
        <div className="product-grid">
          {products.map((i) => (
            <Link
              to={`/shop/${i.slug}`}
              className="product-tile"
              key={i.id}
              onClick={() => void trackJourney("product_click", i.id, { source: "shop_grid" })}
            >
              {i.image_url ? (
                <img src={i.image_url} alt={i.title} />
              ) : (
                <div className="file-cover" aria-hidden="true">
                  {i.category}
                  <span>↗</span>
                </div>
              )}
              <p className="eyebrow">
                {i.category} · V{i.version}
              </p>
              <h2>{i.title}</h2>
              <p>{i.summary}</p>
              <strong>{money(i.price_minor, i.currency)}</strong>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-shop">
          <div className="empty-glyph" aria-hidden="true">
            [ + ]
          </div>
          <p className="eyebrow">FIRST RELEASES IN PREPARATION</p>
          <h2>The workbench is taking shape.</h2>
          <p>
            No downloadable products are on sale yet. Looking for a particular
            PCB, design file or printable part? Tell me what would be useful.
          </p>
          <a
            className="button"
            href="mailto:inquiry@capistor.com?subject=Digital%20product%20request"
          >
            Suggest a useful design <Arrow />
          </a>
        </div>
      )}
    </div>
  );
}
export function ItemPage() {
  const { slug } = useParams();
  const { items, available, business, loading } = useCatalog();
  const item = items.find((i) => i.slug === slug);
  useEffect(() => {
    if (item) void trackJourney("product_view", item.id, { kind: item.kind });
  }, [item]);
  if (!item)
    return (
      <div className="page-wrap">
        <PageIntro
          label="CATALOGUE"
          title={loading ? "Loading…" : "Item not found"}
        />
        <ButtonLink to="/services">See available services</ButtonLink>
      </div>
    );
  return (
    <div className="page-wrap">
      <Seo
        title={item.title}
        description={item.summary}
        url={`/${item.kind === "service" ? "services" : "shop"}/${item.slug}`}
      />
      <Link
        className="back-link"
        to={item.kind === "service" ? "/services" : "/shop"}
      >
        ← {item.kind === "service" ? "All services" : "Digital shop"}
      </Link>
      <div className="item-layout">
        <article>
          <p className="eyebrow">{item.category}</p>
          <h1>{item.title}</h1>
          <p className="large-copy">{item.summary}</p>
          {item.image_url && (
            <img className="item-image" src={item.image_url} alt={item.title} />
          )}
          <div className="prose-text">{item.description}</div>
          <section>
            <h2>What’s included</h2>
            <p className="prose-text">{item.scope}</p>
          </section>
          <section>
            <h2>What’s outside the scope</h2>
            <p className="prose-text">{item.exclusions}</p>
          </section>
          {item.kind === "digital" ? (
            <section>
              <h2>Usage licence · version {item.version}</h2>
              <p className="prose-text">{item.license_text}</p>
            </section>
          ) : item.booking_required ? (
            <section>
              <h2>Book without back-and-forth</h2>
              <p>
                Create the order, pay securely, then choose an available call
                time in your workspace. The appointment, joining link and
                reminders stay with the order record.
              </p>
            </section>
          ) : (
            <section>
              <h2>How your project starts</h2>
              <p>
                Share a non-confidential brief. We’ll review the fit and prepare
                your project-specific NDA and agreement. You can review and sign
                them in your workspace before paying. Confidential uploads open
                after both NDA signatures.
              </p>
            </section>
          )}
        </article>
        <aside className="order-card">
          <p className="eyebrow">
            {item.requires_quote
              ? "STARTING FROM"
              : available
                ? "YOUR SERVICE"
                : "GUIDE PRICE"}
          </p>
          <div className="big-price">
            {money(item.price_minor, item.currency)}
          </div>
          <p className="price-note">
            {item.tax_mode === "automatic"
              ? "Includes applicable tax, calculated at checkout."
              : item.tax_bps
                ? `Plus ${item.tax_bps / 100}% tax · total ${money(item.price_minor + Math.round((item.price_minor * item.tax_bps) / 10000), item.currency)}`
                : "The total shown is payable; no additional tax is added."}
          </p>
          <dl>
            <dt>Delivery</dt>
            <dd>
              {item.kind === "digital"
                ? "After confirmed payment"
                : item.requires_quote
                  ? "Agreed in your proposal"
                  : `${item.delivery_days} business days after kickoff`}
            </dd>
            <dt>{item.kind === "digital" ? "Release" : "Revisions"}</dt>
            <dd>
              {item.kind === "digital"
                ? `Version ${item.version}`
                : `${item.revision_limit} included round(s)`}
            </dd>
          </dl>
          <div className="order-trust">
            <strong>100% engineering-flaw guarantee</strong>
            <span>Secure payment verification</span>
            <span>Versioned files and order history</span>
            {item.kind === "digital" && <span>Files release only after confirmed payment</span>}
          </div>
          {available &&
          business.legal_approved &&
          (item.checkout_enabled || item.requires_quote) ? (
            <OrderForm item={item} />
          ) : (
            <>
              <Notice>
                Online ordering is being prepared. Ask for a proposal to confirm
                price, scope and availability.
              </Notice>
              <a
                className="button full"
                href={`mailto:${business.contact_email}?subject=${encodeURIComponent(item.title)}`}
              >
                Request a proposal <Arrow />
              </a>
            </>
          )}
          {business.fiverr_enabled && (
            <a
              className="alternative"
              href={FIVERR_URL}
              target="_blank"
              rel="noreferrer"
            >
              Prefer Fiverr? Discuss an order there <Arrow />
            </a>
          )}
          <p className="micro">
            Questions before committing?{" "}
            <a href={`mailto:${business.contact_email}`}>Contact Shoaib.</a>
          </p>
        </aside>
      </div>
    </div>
  );
}
function OrderForm({ item }: { item: ShopItem }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [requestKey] = useState(() => crypto.randomUUID());
  const completed = useRef(false);
  useEffect(() => {
    if (user) void trackJourney("checkout_start", item.id, { kind: item.kind });
    return () => {
      if (user && !completed.current)
        void trackJourney("checkout_abandoned", item.id, {
          stage: "order_details",
        });
    };
  }, [item.id, item.kind, user]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      void trackJourney("checkout_details", item.id, { kind: item.kind });
      const r = await api<{ id: string }>("create-order", {
        item_id: item.id,
        request_key: requestKey,
        client_name: f.get("name"),
        company: f.get("company") || "",
        billing_address: f.get("address"),
        brief: f.get("brief"),
        phone_e164: f.get("phone"),
        marketing_phone_consent: f.get("marketing_phone") === "on",
        accept_terms: f.get("terms") === "on",
        accept_license:
          item.kind === "digital" ? f.get("license") === "on" : false,
      });
      completed.current = true;
      navigate(`/portal/orders/${r.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <p>Checking your account…</p>;
  if (!user)
    return (
      <ButtonLink
        to={`/login?next=${encodeURIComponent(`/${item.kind === "service" ? "services" : "shop"}/${item.slug}`)}`}
      >
        Sign in to start
      </ButtonLink>
    );
  return (
    <form onSubmit={submit} className="stack-form">
      <label>
        Your full name
        <input name="name" required maxLength={150} autoComplete="name" />
      </label>
      <label>
        Company (optional)
        <input name="company" maxLength={200} autoComplete="organization" />
      </label>
      <label>
        Billing address
        <textarea
          name="address"
          required
          maxLength={2000}
          autoComplete="street-address"
        />
      </label>
      <label>
        Active phone number
        <input
          type="tel"
          name="phone"
          required
          pattern="\+[1-9][0-9]{7,14}"
          placeholder="+971501234567"
          autoComplete="tel"
        />
        <span className="micro">
          Use international format. We use this for appointments, delivery and
          urgent order updates.
        </span>
      </label>
      <label>
        {item.kind === "digital"
          ? "Intended use"
          : "Non-confidential project brief"}
        <textarea name="brief" required maxLength={10000} />
      </label>
      <label className="checkbox">
        <input type="checkbox" name="terms" required />
        <span>
          I accept the{" "}
          <Link to="/legal/terms" target="_blank">
            terms
          </Link>{" "}
          and{" "}
          <Link to="/legal/refunds" target="_blank">
            refund policy
          </Link>
          . I’ve read the{" "}
          <Link to="/legal/privacy" target="_blank">
            privacy policy
          </Link>
          .
        </span>
      </label>
      {item.kind === "digital" && (
        <label className="checkbox">
          <input name="license" type="checkbox" required />
          <span>I accept the usage licence shown on this page.</span>
        </label>
      )}
      <label className="checkbox">
        <input name="marketing_phone" type="checkbox" />
        <span>
          Optional: I agree to occasional Capistor offers by phone or message.
          I can withdraw this at any time. This is not required to order.
        </span>
      </label>
      {error && <Notice error>{error}</Notice>}
      <button disabled={busy} className="button full">
        {busy
          ? "Creating your workspace…"
          : item.kind === "digital"
            ? "Review order & pay"
            : item.booking_required
              ? "Continue to checkout"
              : "Create project request"}{" "}
        <Arrow />
      </button>
      <p className="micro">
        {item.kind === "digital"
          ? "You will see payment options before paying."
          : item.booking_required
            ? "After payment, choose an available call time in your workspace."
            : "No payment yet. Review your agreements first."}
      </p>
    </form>
  );
}
export function About() {
  const { business } = useCatalog();
  return (
    <div className="page-wrap">
      <Seo title="Meet Shoaib Mustafa & Capistor" url="/about" />
      <PageIntro
        label="THE ENGINEER BEHIND CAPISTOR"
        title="Real work starts with a real conversation."
      />
      <div className="about-layout">
        <img
          src={business.portrait_url || "/cv_assets/my_picture.png"}
          alt="Shoaib Mustafa"
        />
        <article>
          <h2>I’m Shoaib Mustafa.</h2>
          <p>
            I work on PCB design, embedded electronics and the practical
            decisions involved in developing a product. Capistor is my business,
            based in the United Arab Emirates.
          </p>
          <p>
            You can start with a specific technical question. I’ll help clarify
            the requirements, identify what needs investigating, and agree on a
            useful piece of work.
          </p>
          <div className="text-links">
            <Link to="/cv">
              Experience & background <Arrow />
            </Link>
            <a href={FIVERR_URL} target="_blank" rel="noreferrer">
              See my Fiverr profile & reviews <Arrow />
            </a>
          </div>
          <p className="micro">
            Fiverr reviews describe work completed through my Fiverr profile.
            Read the original reviews and project context on Fiverr.
          </p>
          <hr />
          <h3>Company details</h3>
          <dl className="details-list">
            <dt>Legal name</dt>
            <dd>{business.legal_name}</dd>
            <dt>Location</dt>
            <dd>{business.address}</dd>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${business.contact_email}`}>
                {business.contact_email}
              </a>
            </dd>
            {business.registration_number && (
              <>
                <dt>Registration</dt>
                <dd>{business.registration_number}</dd>
              </>
            )}
          </dl>
          {business.verification_url && (
            <a
              className="text-link"
              href={business.verification_url}
              target="_blank"
              rel="noreferrer"
            >
              Verify the business registration <Arrow />
            </a>
          )}
          {business.license_url && business.license_redacted_confirmed && (
            <a
              className="text-link"
              href={business.license_url}
              target="_blank"
              rel="noreferrer"
            >
              View the redacted business licence <Arrow />
            </a>
          )}
          <p>
            Request company documents before committing to a project. Sensitive
            personal information is withheld from public copies.
          </p>
        </article>
      </div>
      <section className="section two-col">
        <div>
          <h2>
            Choose a payment route
            <br />
            you’re comfortable with.
          </h2>
        </div>
        <div>
          <p>
            Eligible wallets and cards are processed on Stripe’s checkout. Bank
            transfer is available when enabled for your order. Prefer an
            established marketplace? Discuss a separately scoped order through
            Fiverr, where Fiverr’s terms and fees apply.
          </p>
          <p>
            Capistor does not hold escrow. Never pay twice for one order;
            confirm the payment route before sending funds.
          </p>
        </div>
      </section>
    </div>
  );
}
export function Legal() {
  const { kind } = useParams();
  const { business } = useCatalog();
  useEffect(() => {
    if (kind) void trackJourney("policy_view", undefined, { kind });
  }, [kind]);
  const value =
    kind === "privacy"
      ? business.privacy
      : kind === "refunds"
        ? business.refund_policy
        : business.terms;
  const title =
    kind === "privacy"
      ? "Privacy policy"
      : kind === "refunds"
        ? "Refund policy"
        : "Customer terms";
  return (
    <div className="page-wrap narrow">
      <Seo title={title} url={`/legal/${kind}`} />
      <PageIntro label="CUSTOMER INFORMATION" title={title} />
      {business.legal_approved && value ? (
        <PolicyText value={value} />
      ) : (
        <Notice>
          These policies are being finalised. Online ordering stays closed until
          they are published. For a project proposal and applicable terms,
          contact{" "}
          <a href={`mailto:${business.contact_email}`}>
            {business.contact_email}
          </a>
          .
        </Notice>
      )}
    </div>
  );
}
function PolicyText({ value }: { value: string }) {
  return (
    <article className="policy-document">
      {value.split(/\n\n+/).map((block, index) => {
        const text = block.trim();
        if (!text) return null;
        if (index === 0) return <h2 key={index}>{text}</h2>;
        if (/^Effective date:/i.test(text))
          return <p className="policy-date" key={index}>{text}</p>;
        if (/^(\d+\.\s+)?[A-Z][A-Z0-9, &/’'-]+$/.test(text) && text.length < 120)
          return <h3 key={index}>{text}</h3>;
        const lines = text.split("\n");
        if (lines.every((line) => line.trim().startsWith("•")))
          return <ul key={index}>{lines.map((line) => <li key={line}>{line.replace(/^\s*•\s*/, "")}</li>)}</ul>;
        return <p key={index}>{text}</p>;
      })}
    </article>
  );
}
export function Work() {
  return (
    <div className="page-wrap">
      <Seo title="Selected PCB & electronics work" url="/work" />
      <PageIntro
        label="SELECTED WORK"
        title="From a design file to a physical board."
      >
        <p>
          A look at the electronics work shown in Capistor’s portfolio. Explore
          the engineering background or discuss the requirements for your own
          project.
        </p>
      </PageIntro>
      <div className="work-grid">
        {[
          [
            "/redesign/pager.jpeg",
            "A compact electronics assembly",
            "Circuit layout and component integration.",
          ],
          [
            "/redesign/heater-produced.jpeg",
            "A manufactured control board",
            "From PCB design to a physical assembly.",
          ],
          [
            "/redesign/macro-render.webp",
            "The detail in a board design",
            "Component placement, routing and mechanical constraints.",
          ],
        ].map(([src, title, desc]) => (
          <figure key={src}>
            <img src={src} alt={title} loading="lazy" />
            <figcaption>
              <h2>{title}</h2>
              <p>{desc}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <section className="section two-col">
        <h2>
          Every project has
          <br />
          different constraints.
        </h2>
        <div>
          <p>
            Images show examples of past work; they do not imply that every
            design is certified or ready for your application. We’ll agree on
            the appropriate review and testing scope for your project.
          </p>
          <ButtonLink to="/services">Find the right service</ButtonLink>
        </div>
      </section>
    </div>
  );
}
