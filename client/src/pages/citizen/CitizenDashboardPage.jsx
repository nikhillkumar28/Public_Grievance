import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listMyComplaintsApi } from "../../api/complaintApi";
import StatusBadge from "../../components/shared/StatusBadge";

export default function CitizenDashboardPage() {
  const { data } = useQuery({ queryKey: ["my-complaints"], queryFn: listMyComplaintsApi });
  const complaints = data?.complaints || [];

  const stats = useMemo(() => {
    const pending = complaints.filter((c) => c.status === "pending").length;
    const resolved = complaints.filter((c) => c.status === "resolved").length;
    const upvotesGiven = complaints.reduce((sum, c) => sum + (c.upvotes || 0), 0);
    return [
      { label: "My Complaints", value: complaints.length },
      { label: "Pending", value: pending },
      { label: "Resolved", value: resolved },
      { label: "Upvotes Given", value: upvotesGiven }
    ];
  }, [complaints]);

  const warningComplaint = complaints.find(
    (c) => c.status === "pending" && Date.now() - new Date(c.createdAt).getTime() > 5 * 24 * 60 * 60 * 1000
  );

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="status-card">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="text-2xl font-bold text-civic-navy">{item.value}</p>
          </div>
        ))}
      </section>

      {warningComplaint && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Your complaint will escalate in 2 days if not addressed.
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-civic">
        <h2 className="mb-4 text-lg font-bold text-civic-navy">My Recent Complaints</h2>
        <div className="space-y-3">
          {complaints.slice(0, 5).map((complaint) => (
            <div key={complaint._id} className="flex items-center justify-between rounded-md border border-slate-100 p-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{complaint.description.slice(0, 80)}...</p>
                <p className="text-xs text-slate-500">{complaint.category}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge value={complaint.status} />
                <Link to={`/citizen/complaints/${complaint._id}`} className="text-sm text-civic-blue">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
