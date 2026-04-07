import { Link } from "react-router-dom";

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

const formatTimeAgo = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
};

export default function ComplaintCard({ complaint, detailPath, onUpvote, upvotePath, isUpvoted = false, isUpvoting = false }) {
  const category = complaint?.category || "Other";
  const categoryIcon = CATEGORY_ICONS[category] || CATEGORY_ICONS.Other;
  const categoryLabel = `${category} Issue`;
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
  const timeAgo = formatTimeAgo(complaint?.createdAt);
  const resolvedDetailPath =
    typeof detailPath === "function" ? detailPath(complaint) : detailPath || `/citizen/complaints/${complaint?._id}`;
  const resolvedUpvotePath = upvotePath || resolvedDetailPath;
  const escalationThreshold = 50;
  const escalationPercentage = Math.min((upvotes / escalationThreshold) * 100, 100);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      {previewImageUrl ? (
        <img
          src={previewImageUrl}
          alt={`${category} complaint`}
          className="mb-4 h-40 w-full rounded-2xl object-cover"
          loading="lazy"
        />
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span aria-hidden="true">{categoryIcon}</span>
          <span>{categoryLabel}</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${urgencyClass}`}>
          <span aria-hidden="true">{urgencyIcon}</span>
          <span>{urgency}</span>
        </span>
      </div>

      <div className="mt-2 text-xs font-semibold text-slate-500">{`\u{1F4CD} Ward ${ward}`}</div>

      <p className="mt-3 overflow-hidden text-sm text-slate-700 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
        {complaint?.description || "No description provided."}
      </p>

      <div className="mt-4">
        <div className="h-2 rounded-full bg-slate-100">
          <div className="h-2 rounded-full bg-civic-blue" style={{ width: `${escalationPercentage}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-500">{`${upvotes} / ${escalationThreshold} upvotes for escalation`}</p>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>{`\u{1F44D} ${upvotes} upvotes`}</span>
          {timeAgo ? <span>{`\u{23F1} ${timeAgo}`}</span> : null}
        </div>
        <span className="text-[10px] uppercase tracking-wide text-slate-400">{complaint?.status || "pending"}</span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {resolvedDetailPath ? (
          <Link
            to={resolvedDetailPath}
            className="inline-flex flex-1 items-center justify-center rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            View
          </Link>
        ) : null}
        {onUpvote ? (
          <button
            type="button"
            onClick={() => onUpvote(complaint)}
            disabled={isUpvoted || isUpvoting}
            className={`inline-flex flex-1 items-center justify-center rounded-md px-3 py-2 text-xs font-semibold transition ${
              isUpvoted || isUpvoting
                ? "cursor-not-allowed bg-slate-200 text-slate-500"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {isUpvoted ? "Upvoted" : isUpvoting ? "Upvoting..." : "Upvote"}
          </button>
        ) : resolvedUpvotePath ? (
          <Link
            to={resolvedUpvotePath}
            className="inline-flex flex-1 items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            Upvote
          </Link>
        ) : null}
      </div>
    </article>
  );
}

