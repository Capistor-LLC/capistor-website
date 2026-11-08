import { useEffect, useState, FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase, hasSupabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import { Notice, PageIntro } from "./Shell";
export function safeNext(value: string | null) {
  return value &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !/[\\\r\n]/.test(value)
    ? value
    : "/portal";
}
export default function Login() {
  const { user, isStaff, isAdmin, loading, signOut } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = safeNext(params.get("next"));
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [factor, setFactor] = useState<{
    id: string;
    qr?: string;
    secret?: string;
  } | null>(null);
  useEffect(() => {
    if (!loading && user && (!next.startsWith("/admin") || isAdmin))
      navigate(next, { replace: true });
  }, [loading, user, isAdmin, next, navigate]);
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const email = String(new FormData(e.currentTarget).get("email"));
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login?next=${encodeURIComponent(next)}`,
      },
    });
    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
  }
  async function prepareMfa() {
    setError("");
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const existing = data.totp.find((f) => f.status === "verified");
      if (existing) setFactor({ id: existing.id });
      else {
        for (const stale of data.all.filter(
          (f) => f.factor_type === "totp" && f.status === "unverified",
        ))
          await supabase.auth.mfa.unenroll({ factorId: stale.id });
        const { data: enrolled, error } = await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: "Capistor admin",
        });
        if (error) throw error;
        setFactor({
          id: enrolled.id,
          qr: enrolled.totp.qr_code,
          secret: enrolled.totp.secret,
        });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function verify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!factor) return;
    setBusy(true);
    setError("");
    const code = String(new FormData(e.currentTarget).get("code"));
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: factor.id,
      code,
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    } else window.location.assign(next);
  }
  return (
    <div className="page-wrap narrow">
      <Helmet>
        <title>Client sign-in — Capistor</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <PageIntro
        label="YOUR CAPISTOR WORKSPACE"
        title="One place for your project."
      >
        <p>
          Agreements, progress, private files and payment records. Sign in with
          a secure email link.
        </p>
      </PageIntro>
      <div className="login-card">
        {!hasSupabase ? (
          <Notice>
            Client sign-in is being prepared. Email{" "}
            <a href="mailto:inquiry@capistor.com">inquiry@capistor.com</a> to
            start a project.
          </Notice>
        ) : loading ? (
          <p>Checking your account…</p>
        ) : user ? (
          <>
            <h2>
              {isStaff ? "Protect your admin account" : "You’re signed in"}
            </h2>
            {isStaff && !isAdmin ? (
              <>
                <p>
                  Administrator access requires an authenticator code. Your
                  client account stays separate from administrative permissions.
                </p>
                {!factor ? (
                  <button
                    className="button"
                    disabled={busy}
                    onClick={prepareMfa}
                  >
                    Set up or verify two-factor access
                  </button>
                ) : (
                  <form className="stack-form" onSubmit={verify}>
                    {factor.qr && (
                      <>
                        <p>Scan this QR code in your authenticator app.</p>
                        <img
                          src={factor.qr}
                          alt="Authenticator enrollment QR code"
                        />
                        <details>
                          <summary>Use a setup key instead</summary>
                          <code className="fingerprint">{factor.secret}</code>
                        </details>
                      </>
                    )}
                    <label>
                      Six-digit authenticator code
                      <input
                        name="code"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        required
                        autoComplete="one-time-code"
                      />
                    </label>
                    <button className="button" disabled={busy}>
                      Verify & continue
                    </button>
                  </form>
                )}
              </>
            ) : (
              <p>
                This account does not have administrator access.{" "}
                <Link to="/portal">Open your client portal.</Link>
              </p>
            )}
            <button className="small-button" onClick={() => void signOut()}>
              Sign out
            </button>
          </>
        ) : sent ? (
          <Notice>
            Check your inbox for a secure sign-in link. Open it in this browser.
            If it doesn’t arrive, check spam or try again in a minute.
            <button className="small-button" onClick={() => setSent(false)}>
              Try again
            </button>
          </Notice>
        ) : (
          <form onSubmit={login} className="stack-form">
            <label>
              Email address
              <input type="email" name="email" required autoComplete="email" />
            </label>
            <button className="button" disabled={busy}>
              {busy ? "Sending link…" : "Email me a sign-in link"}{" "}
              <span>↗</span>
            </button>
            <p className="micro">
              No password to remember. Use the same email for all your project
              records.
            </p>
          </form>
        )}
        {error && <Notice error>{error}</Notice>}
      </div>
    </div>
  );
}
