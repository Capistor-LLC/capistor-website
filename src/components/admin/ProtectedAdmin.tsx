import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/useAuth";

export default function ProtectedAdmin({ children }: { children: ReactNode }) {
  const { session, isAdmin, isStaff, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kindofwhite">
        <p className="text-sexyblue/50 font-fransisco">Checking session…</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace state={{ staff: isStaff }} />;
  }

  return <>{children}</>;
}
