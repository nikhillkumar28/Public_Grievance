const statusClassMap = {
  pending: "bg-red-100 text-civic-red",
  in_progress: "bg-amber-100 text-civic-amber",
  resolved: "bg-emerald-100 text-civic-green",
  escalated: "bg-rose-100 text-civic-red"
};

const urgencyClassMap = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-amber-100 text-civic-amber",
  High: "bg-red-100 text-civic-red"
};

export default function StatusBadge({ value, type = "status" }) {
  const map = type === "urgency" ? urgencyClassMap : statusClassMap;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${map[value] || "bg-slate-100 text-slate-700"}`}>
      {(value || "").replace("_", " ")}
    </span>
  );
}
