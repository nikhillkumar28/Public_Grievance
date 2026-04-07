const statusClassMap = {
  pending: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  escalated: "bg-red-100 text-red-700"
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
