const TIMELINE_STAGES = [
  { key: "filed", label: "Complaint Filed", aliases: ["filed", "pending"] },
  { key: "assigned", label: "Assigned to Department", aliases: ["assigned"] },
  { key: "investigation", label: "Investigation Started", aliases: ["investigation", "investigating"] },
  { key: "work_in_progress", label: "Work In Progress", aliases: ["work_in_progress", "in_progress"] },
  { key: "resolved", label: "Resolved", aliases: ["resolved"] }
];

const normalizeStatus = (value = "") => value.toString().trim().toLowerCase().replace(/\s+/g, "_");

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

export default function ComplaintTimeline({ timeline = [] }) {
  const normalizedTimeline = timeline.map((entry) => ({
    ...entry,
    normalizedStatus: normalizeStatus(entry?.status)
  }));

  const currentEntry = normalizedTimeline[normalizedTimeline.length - 1];
  const currentStatus = currentEntry?.normalizedStatus || "";

  const currentStageIndex = TIMELINE_STAGES.findIndex((stage) =>
    stage.aliases.some((alias) => alias === currentStatus)
  );

  return (
    <div className="flex border-l border-slate-200 pl-4 space-y-4 flex-col">
      {TIMELINE_STAGES.map((stage, index) => {
        const isCompleted = currentStageIndex > -1 && index <= currentStageIndex;
        const isCurrent = index === currentStageIndex;
        const matchingEntry = normalizedTimeline.find((entry) =>
          stage.aliases.includes(entry.normalizedStatus)
        );

        return (
          <div key={stage.key} className="relative">
            <span
              className={`absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border ${
                isCurrent
                  ? "border-blue-600 bg-blue-600"
                  : isCompleted
                    ? "border-blue-500 bg-blue-500"
                    : "border-slate-300 bg-white"
              }`}
            />
            <p className={`text-sm ${isCurrent ? "font-semibold text-slate-900" : "text-slate-600"}`}>{stage.label}</p>
            {matchingEntry?.date ? <p className="mt-1 text-xs text-slate-500">{formatDate(matchingEntry.date)}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
