import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createComplaintApi, upvoteComplaintApi } from "../../api/complaintApi";
import { useToast } from "../../context/ToastContext";

const SMART_SUGGESTIONS = [
  { id: null, title: "Pothole near school", votes: 23 },
  { id: null, title: "Road damage ward 5", votes: 12 }
];

export default function FileComplaintPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    description: "",
    address: "",
    ward: "",
    image: null
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [smartSuggestions, setSmartSuggestions] = useState(SMART_SUGGESTIONS);
  const [upvotedSuggestionIds, setUpvotedSuggestionIds] = useState(() => new Set());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("description", form.description);
      formData.append("address", form.address);
      formData.append("ward", form.ward);
      if (form.image) {
        formData.append("image", form.image);
      }
      const data = await createComplaintApi(formData);
      setResult(data);
      setForm({ description: "", address: "", ward: "", image: null });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to file complaint");
    }
  };

  const showSmartSuggestions = useMemo(() => form.description.trim().length >= 12, [form.description]);

  const handleSuggestionUpvote = async (suggestion) => {
    if (upvotedSuggestionIds.has(suggestion.title)) return;

    if (!suggestion.id) {
      setUpvotedSuggestionIds((prev) => new Set(prev).add(suggestion.title));
      setSmartSuggestions((prev) =>
        prev.map((item) => (item.title === suggestion.title ? { ...item, votes: item.votes + 1 } : item))
      );
      showToast("Saved your interest. ML-powered matching will connect this soon.", { type: "info" });
      return;
    }

    try {
      await upvoteComplaintApi(suggestion.id);
      setUpvotedSuggestionIds((prev) => new Set(prev).add(suggestion.title));
      setSmartSuggestions((prev) =>
        prev.map((item) => (item.title === suggestion.title ? { ...item, votes: item.votes + 1 } : item))
      );
      showToast("Upvote recorded. Thanks for supporting this issue.", { type: "success" });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to upvote suggestion.", { type: "error" });
    }
  };

  const handleDuplicateUpvote = async () => {
    const id = result?.similarComplaintId;
    if (!id || upvotedSuggestionIds.has(id)) return;
    try {
      await upvoteComplaintApi(id);
      setUpvotedSuggestionIds((prev) => new Set(prev).add(id));
      showToast("Upvote recorded. Thanks for supporting this issue.", { type: "success" });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to upvote complaint.", { type: "error" });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-civic">
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
          placeholder="Address / Landmark"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          required
        />
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          placeholder="Ward"
          value={form.ward}
          onChange={(e) => setForm({ ...form, ward: e.target.value })}
          required
        />

        {showSmartSuggestions && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Smart UX</p>
                <p className="mt-1 text-base font-semibold text-amber-900">Similar Complaint Suggestion</p>
              </div>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Preview</span>
            </div>
            <p className="mt-2 text-sm">Similar issues found:</p>
            <ul className="mt-3 space-y-2">
              {smartSuggestions.map((suggestion) => (
                <li key={suggestion.title} className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{suggestion.title}</p>
                    <p className="text-xs text-slate-500">{suggestion.votes} votes</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSuggestionUpvote(suggestion)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                      upvotedSuggestionIds.has(suggestion.title)
                        ? "cursor-not-allowed bg-slate-200 text-slate-500"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                    disabled={upvotedSuggestionIds.has(suggestion.title)}
                  >
                    {upvotedSuggestionIds.has(suggestion.title) ? "Upvoted" : "Upvote instead"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

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
        <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Similar complaint exists.</p>
          <p className="mt-1">Upvote instead?</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDuplicateUpvote}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                upvotedSuggestionIds.has(result.similarComplaintId)
                  ? "cursor-not-allowed bg-slate-200 text-slate-500"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
              disabled={upvotedSuggestionIds.has(result.similarComplaintId)}
            >
              {upvotedSuggestionIds.has(result.similarComplaintId) ? "Upvoted" : "Upvote"}
            </button>
            <Link
              to={`/citizen/complaints/${result.similarComplaintId}`}
              className="rounded-md border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-900"
            >
              View complaint
            </Link>
          </div>
        </div>
      )}

      {result?.complaint && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm">
          <p>ML detected category: <strong>{result.complaint.category}</strong></p>
          <p>Urgency level: <strong>{result.complaint.urgency}</strong></p>
        </div>
      )}
    </div>
  );
}

