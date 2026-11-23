import { useEffect, useState, ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useCatalog } from "./context";
import "./commerce.css";
import Analytics from "./Analytics";
export function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
export default function Shell({ children }: { children: ReactNode }) {
  const { business } = useCatalog();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <div className="commerce">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link to="/" className="wordmark" aria-label="Capistor home">
          <svg
            viewBox="0 0 28 28"
            width="28"
            height="28"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 9h8v10H4M24 9h-8v10h8M14 2v5m0 14v5"
              stroke="currentColor"
              strokeWidth="2.5"
            />
          </svg>
          capistor
        </Link>
        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
        </button>
        <nav
          id="navigation"
          className={open ? "nav open" : "nav"}
          aria-label="Main navigation"
        >
          <NavLink to="/services">Services</NavLink>
          <NavLink to="/shop">Digital shop</NavLink>
          <NavLink to="/work">Selected work</NavLink>
          <NavLink to="/journal">Journal</NavLink>
          <NavLink to="/about">About</NavLink>
          <Link to="/portal" className="nav-portal">
            Client portal <Arrow />
          </Link>
        </nav>
      </header>
      <main id="main">{children}</main>
      <Analytics />
      <footer className="site-footer">
        <div className="footer-top">
          <div>
            <p className="eyebrow">LET’S MAKE SOMETHING USEFUL</p>
            <Link to="/services" className="footer-invite">
              Start with a clear next step. <Arrow />
            </Link>
          </div>
          <a href={`mailto:${business.contact_email}`}>
            {business.contact_email}
          </a>
        </div>
        <div className="footer-bottom">
          <span>
            {business.legal_name}
            <br />
            {business.address}
          </span>
          <div>
            <Link to="/legal/terms">Terms</Link>
            <Link to="/legal/privacy">Privacy</Link>
            <Link to="/legal/refunds">Refunds</Link>
            <Link to="/about">Company details</Link>
            <Link to="/staff">Staff portal</Link>
            {import.meta.env.VITE_GA_MEASUREMENT_ID &&
              import.meta.env.VITE_GA_MANUAL_ONLY === "true" && (
                <button
                  onClick={() =>
                    window.dispatchEvent(new Event("analytics:preferences"))
                  }
                >
                  Analytics preferences
                </button>
              )}
          </div>
          <span>© {new Date().getFullYear()} Capistor</span>
        </div>
      </footer>
    </div>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`notice ${error ? "error" : ""}`}
      role={error ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
export function PageIntro({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-intro">
      <p className="eyebrow">{label}</p>
      <h1>{title}</h1>
      {children && <div className="intro-text">{children}</div>}
    </header>
  );
}
export function ButtonLink({
  to,
  children,
  secondary = false,
}: {
  to: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link className={`button ${secondary ? "secondary" : ""}`} to={to}>
      {children}
      <Arrow />
    </Link>
  );
}
