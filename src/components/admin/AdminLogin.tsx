import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase, ADMIN_EMAIL } from "../../lib/supabase";
import { useAuth } from "../../lib/useAuth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { session, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session && isAdmin) navigate("/admin", { replace: true });
  }, [session, isAdmin, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const normalized = email.trim().toLowerCase();
    if (normalized !== ADMIN_EMAIL.toLowerCase()) {
      setStatus("error");
      setErrorMsg("This email isn't authorized to access admin.");
      return;
    }

    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }
    setStatus("sent");
  };

  return (
    <div className="min-h-screen bg-kindofwhite flex items-center justify-center px-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-sexyblue/30 font-futura text-xs uppercase tracking-[0.25em] mb-3">
          Capistor — Admin
        </p>
        <h1 className="text-3xl sm:text-4xl font-futura font-bold text-black mb-2">
          Sign in
        </h1>
        <p className="text-sexyblue/55 font-fransisco mb-8">
          We'll email a one-time magic link.
        </p>

        {status === "sent" ? (
          <div className="p-6 rounded-2xl bg-sexyblue/5 border border-sexyblue/10">
            <p className="text-sexyblue font-futura font-semibold mb-1">
              Check your inbox
            </p>
            <p className="text-sexyblue/65 font-fransisco text-sm">
              We sent a magic link to <b>{email}</b>. Click it to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-black font-futura font-semibold text-sm mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-capistor-300/40 bg-kindofwhite text-black font-fransisco focus:outline-none focus:ring-2 focus:ring-sexyblue"
              />
            </div>

            {errorMsg && (
              <p className="text-red-600 font-fransisco text-sm">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full px-6 py-3 rounded-lg bg-sexyblue text-kindofwhite font-futura font-bold text-sm hover:bg-capistor-600 transition-colors disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}

        <p className="mt-8 text-sexyblue/35 font-fransisco text-xs">
          Only the whitelisted admin email can sign in.
        </p>
      </motion.div>
    </div>
  );
}
