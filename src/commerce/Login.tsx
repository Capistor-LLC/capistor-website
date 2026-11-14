import { useEffect, useState, FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase, hasSupabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import { Notice, PageIntro } from "./Shell";
import { api } from "./api";
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
  const [mode, setMode] = useState<
    "signin" | "signup" | "reset" | "magic"
  >("signin");
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
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password") || "");
    const redirectTo = `${window.location.origin}/login?next=${encodeURIComponent(next)}`;
    let result: { error: Error | null };
    if (mode === "signin")
      result = await supabase.auth.signInWithPassword({ email, password });
    else if (mode === "signup")
      result = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });
    else if (mode === "reset")
      result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
    else
      result = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
    setBusy(false);
    if (result.error) setError(result.error.message);
    else setSent(true);
  }
  async function oauth(provider: "google" | "apple") {
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/login?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
  }
  async function activateOwner() {
    setBusy(true);
    setError("");
    try {
      await api("bootstrap-owner", {});
      window.location.reload();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
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
          Agreements, progress, private files and payment records. Use Google,
          Apple, or your email and password.
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
            ) : user.email?.toLowerCase() === "krish.shoaib55@gmail.com" &&
              !isStaff ? (
              <>
                <p>
                  This is the designated owner account. Activate it once, then
                  protect the workspace with an authenticator.
                </p>
                <button
                  className="button"
                  disabled={busy}
                  onClick={() => void activateOwner()}
                >
                  Activate owner workspace
                </button>
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
            {mode === "signin"
              ? "Signed in. Your workspace is opening."
              : mode === "signup"
                ? "Check your inbox to verify the new account, then return here to sign in."
                : mode === "reset"
                  ? "Check your inbox for the password reset link."
                  : "Check your inbox for a secure sign-in link and open it in this browser."}
            <button className="small-button" onClick={() => setSent(false)}>
              Back to sign in
            </button>
          </Notice>
        ) : (
          <>
            <div className="oauth-grid">
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => void oauth("google")}
              >
                Continue with Google
              </button>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => void oauth("apple")}
              >
                Continue with Apple
              </button>
            </div>
            <div className="login-divider"><span>or use email</span></div>
            <form onSubmit={login} className="stack-form">
              <label>
                Email address
                <input type="email" name="email" required autoComplete="email" />
              </label>
              {(mode === "signin" || mode === "signup") && (
                <label>
                  Password
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={10}
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                  />
                </label>
              )}
              <button className="button" disabled={busy}>
                {busy
                  ? "Please wait…"
                  : mode === "signup"
                    ? "Create secure account"
                    : mode === "reset"
                      ? "Send password reset"
                      : mode === "magic"
                        ? "Email a one-time link"
                        : "Sign in"}
              </button>
            </form>
            <div className="login-options">
              <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
                {mode === "signup" ? "Already have an account?" : "Create an account"}
              </button>
              <button onClick={() => setMode(mode === "reset" ? "signin" : "reset")}>
                {mode === "reset" ? "Back to password sign-in" : "Forgot password?"}
              </button>
              <button onClick={() => setMode(mode === "magic" ? "signin" : "magic")}>
                {mode === "magic" ? "Use a password instead" : "Use a one-time email link"}
              </button>
            </div>
            <p className="micro">
              Social sign-in buttons become active after their provider is
              connected in the secure authentication settings.
            </p>
          </>
        )}
        {error && <Notice error>{error}</Notice>}
      </div>
    </div>
  );
}
