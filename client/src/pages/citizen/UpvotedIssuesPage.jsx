export default function UpvotedIssuesPage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-civic">
      <h1 className="text-xl font-bold text-civic-navy">Upvoted Issues</h1>
      <p className="mt-3 text-sm text-slate-600">
        This section can be populated by adding a backend endpoint for complaints where current user exists in `upvotedBy`.
      </p>
    </div>
  );
}
