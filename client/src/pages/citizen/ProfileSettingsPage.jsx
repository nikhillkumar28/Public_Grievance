import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateMeApi } from "../../api/authApi";
import { useToast } from "../../context/ToastContext";

export default function ProfileSettingsPage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ ward: "", address: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      ward: user?.ward || "",
      address: user?.address || ""
    });
  }, [user?.ward, user?.address]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ward: form.ward,
        address: form.address
      };
      const data = await updateMeApi(payload);
      updateUser(data.user);
      showToast("Profile updated successfully.", { type: "success" });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile.", { type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-civic">
      <h1 className="text-xl font-bold text-civic-navy">Profile Settings</h1>
      <div className="mt-4 space-y-2 text-sm text-slate-700">
        <p>
          <strong>Name:</strong> {user?.name}
        </p>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Role:</strong> {user?.role}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Address</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="Your address / landmark"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Ward (optional)</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="Ward"
            value={form.ward}
            onChange={(e) => setForm({ ...form, ward: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-civic-blue px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}

