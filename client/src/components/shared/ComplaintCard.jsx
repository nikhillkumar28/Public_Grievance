import StatusBadge from "./StatusBadge";

const CATEGORY_ICONS = {
  Road: "\u{1F6E3}",
  Electricity: "\u{1F4A1}",
  Water: "\u{1F6B0}",
  Sanitation: "\u{1F5D1}",
  Environment: "\u{1F333}",
  Other: "\u{1F4CC}"
};

const URGENCY_STYLES = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700"
};

const URGENCY_ICONS = {
  High: "\u{1F534}",
  Medium: "\u{1F7E1}",
  Low: "\u{1F7E2}"
};

export default function ComplaintCard({ complaint }) {
  const category = complaint?.category || "Other";
  const categoryIcon = CATEGORY_ICONS[category] || CATEGORY_ICONS.Other;
  const urgency = complaint?.urgency || "Low";
  const urgencyClass = URGENCY_STYLES[urgency] || URGENCY_STYLES.Low;
  const urgencyIcon = URGENCY_ICONS[urgency] || URGENCY_ICONS.Low;
  const imageUrl = complaint?.imageUrl || "";
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const backendBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "");
  const previewImageUrl = imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `${backendBaseUrl}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`
    : "";
  const ward = complaint?.ward ?? complaint?.location?.ward ?? "N/A";
  const upvotes = complaint?.upvotes || 0;
  const escalationThreshold = 50;
  const escalationPercentage = Math.min((upvotes / escalationThreshold) * 100, 100);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 transition duration-300 hover:shadow-lg">
      {previewImageUrl ? (
        <img
          src={previewImageUrl}
          alt={`${category} complaint`}
          className="mb-3 h-40 w-full rounded-lg object-cover"
          loading="lazy"
        />
      ) : null}

      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <span aria-hidden="true">{categoryIcon}</span>
          <span>{category}</span>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${urgencyClass}`}>
          {`${urgency} Urgency ${urgencyIcon}`}
        </span>
      </div>

      <p className="mb-4 overflow-hidden text-sm text-slate-700 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
        {complaint?.description || "No description provided."}
      </p>

      <div className="mb-4">
        <div className="h-2 rounded-full bg-gray-200">
          <div className="h-2 rounded-full bg-blue-500" style={{ width: `${escalationPercentage}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-600">{`${upvotes} / ${escalationThreshold} upvotes for escalation`}</p>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
        <span>{`\u{1F4CD} Ward ${ward}`}</span>
        <StatusBadge value={complaint?.status} />
        <span>{upvotes} upvotes</span>
      </div>
    </article>
  );
}
