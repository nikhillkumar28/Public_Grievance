import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function PublicNavbar() {
  const { user, logout } = useAuth();

  const dashboardPath =
    user?.role === "citizen"
      ? "/citizen/dashboard"
      : user?.role === "authority"
        ? "/authority/dashboard"
        : user?.role === "admin"
          ? "/admin/dashboard"
          : "/";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2 text-civic-navy">
          <div className="h-8 w-8 rounded bg-civic-blue" />
          <span className="font-bold">Grievance Connect</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-semibold text-slate-700">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          {user ? (
            <>
              <Link to={dashboardPath}>Dashboard</Link>
              <button type="button" onClick={logout} className="rounded-md border border-slate-200 px-3 py-2">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="rounded-md bg-civic-blue px-3 py-2 text-white">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
