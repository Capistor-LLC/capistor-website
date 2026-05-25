import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/useAuth";

export default function ProtectedAdmin({ children }: { children: ReactNode }) {
  const { session, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kindofwhite">
        <p className="text-sexyblue/50 font-fransisco">Checking session…</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-kindofwhite px-6 text-center">
        <p className="text-sexyblue/40 font-futura text-xs uppercase tracking-[0.2em] mb-3">
          Access denied
        </p>
        <h1 className="text-2xl font-futura font-bold text-black mb-2">
          Not authorized
        </h1>
        <p className="text-sexyblue/60 font-fransisco max-w-md mb-6">
          Your account doesn't have admin access. Sign in with the admin email
          to continue.
        </p>
        <button
          onClick={async () => {
            const { supabase } = await import("../../lib/supabase");
            await supabase.auth.signOut();
            window.location.href = "/admin/login";
          }}
          className="px-5 py-2 rounded-lg bg-sexyblue text-kindofwhite font-futura text-sm hover:bg-capistor-600 transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
