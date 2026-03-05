import { useState } from "react";
import { createComplaintApi } from "../../api/complaintApi";

export default function FileComplaintPage() {
  const [form, setForm] = useState({
    description: "",
    ward: "",
    image: null
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("description", form.description);
      formData.append("ward", form.ward);
      if (form.image) {
        formData.append("image", form.image);
      }
      const data = await createComplaintApi(formData);
      setResult(data);
      setForm({ description: "", ward: "", image: null });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to file complaint");
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-civic">
      <h1 className="text-xl font-bold text-civic-navy">File Complaint</h1>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <textarea
          className="min-h-32 w-full rounded-md border border-slate-300 px-3 py-2"
          placeholder="Describe the issue"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          placeholder="Ward"
          value={form.ward}
          onChange={(e) => setForm({ ...form, ward: e.target.value })}
          required
        />
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          type="file"
          accept="image/*"
          onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
        />
        <button className="rounded-md bg-civic-blue px-4 py-2 font-semibold text-white">Submit</button>
      </form>

      {error && <p className="mt-4 text-sm text-civic-red">{error}</p>}

      {result?.duplicateFound && (
        <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Similar complaint exists. Upvote instead? ID: {result.similarComplaintId}
        </div>
      )}

      {result?.complaint && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm">
          <p>ML detected category: <strong>{result.complaint.category}</strong></p>
          <p>Urgency level: <strong>{result.complaint.urgency}</strong></p>
          <p>Confidence score: <strong>{result.complaint.confidence}</strong></p>
        </div>
      )}
    </div>
  );
}
