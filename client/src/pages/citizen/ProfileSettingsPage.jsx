import { useAuth } from "../../context/AuthContext";

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-civic">
      <h1 className="text-xl font-bold text-civic-navy">Profile Settings</h1>
      <div className="mt-4 space-y-2 text-sm text-slate-700">
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <p><strong>Ward:</strong> {user?.ward || "N/A"}</p>
      </div>
    </div>
  );
}
