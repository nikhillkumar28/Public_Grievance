const normalizeStatus = (value = "") => value.toString().trim().toLowerCase().replace(/\s+/g, "_");

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
};

const getLatestStatusMap = (timeline) => {
  const map = new Map();
  timeline.forEach((entry) => {
    const status = normalizeStatus(entry?.status);
    if (!status) return;
    const time = entry?.updatedAt || entry?.date;
    if (!time) return;
    const current = map.get(status);
    if (!current || new Date(time) > new Date(current)) {
      map.set(status, time);
    }
  });
  return map;
};

export default function ComplaintTimeline({ timeline = [], createdAt, currentStatus }) {
  const normalizedTimeline = timeline.map((entry) => ({
    ...entry,
    normalizedStatus: normalizeStatus(entry?.status)
  }));

  const latestStatusMap = getLatestStatusMap(normalizedTimeline);
  const filedDate = createdAt || latestStatusMap.get("filed") || latestStatusMap.get("pending");
  const assignedDate = latestStatusMap.get("assigned") || latestStatusMap.get("pending");
  const inProgressDate = latestStatusMap.get("in_progress");
  const resolvedDate = latestStatusMap.get("resolved");

  const stages = [
    { key: "filed", label: "Filed", date: filedDate },
    { key: "assigned", label: "Assigned", date: assignedDate },
    { key: "in_progress", label: "In Progress", date: inProgressDate },
    { key: "resolved", label: "Resolved", date: resolvedDate }
  ];

  const normalizedCurrent = normalizeStatus(
    currentStatus || normalizedTimeline[normalizedTimeline.length - 1]?.normalizedStatus
  );

  const statusToStage = {
    pending: "assigned",
    assigned: "assigned",
    in_progress: "in_progress",
    resolved: "resolved",
    escalated: "in_progress"
  };

  const currentStageKey = statusToStage[normalizedCurrent] || "assigned";
  const currentStageIndex = stages.findIndex((stage) => stage.key === currentStageKey);

  return (
    <div className="flex border-l border-slate-200 pl-4 space-y-4 flex-col">
      {stages.map((stage, index) => {
        const isCompleted = currentStageIndex > -1 && index <= currentStageIndex;
        const isCurrent = index === currentStageIndex;

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
            {stage.date ? <p className="mt-1 text-xs text-slate-500">{formatDate(stage.date)}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
