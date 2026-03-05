import { useAuth } from "../../context/AuthContext";

export default function CitizenTopbar() {
  const { user, logout } = useAuth();
  return (
    <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-civic">
      <div>
        <p className="text-sm text-slate-500">Welcome</p>
        <p className="font-semibold text-civic-navy">{user?.name || "Citizen"}</p>
      </div>
      <button onClick={logout} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
        Logout
      </button>
    </div>
  );
}
