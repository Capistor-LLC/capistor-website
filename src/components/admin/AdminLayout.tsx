import { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/useAuth";

const navItems = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/subscribers", label: "Subscribers" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-kindofwhite flex flex-col">
      <header className="border-b border-capistor-200/70 bg-kindofwhite">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/admin"
              className="text-black font-futura font-bold tracking-tight"
            >
              Capistor
              <span className="text-sexyblue/40 font-normal ml-2">/ admin</span>
            </Link>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md font-futura text-sm transition-colors ${
                      isActive
                        ? "bg-sexyblue text-kindofwhite"
                        : "text-sexyblue/60 hover:text-sexyblue hover:bg-sexyblue/5"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sexyblue/50 hover:text-sexyblue font-futura text-sm transition-colors"
            >
              View site →
            </Link>
            <div className="hidden sm:block w-px h-5 bg-capistor-300/40" />
            <span className="hidden sm:inline text-sexyblue/50 font-fransisco text-sm">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-md border border-capistor-300/40 text-sexyblue/70 hover:text-sexyblue hover:border-sexyblue/40 font-futura text-sm transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
