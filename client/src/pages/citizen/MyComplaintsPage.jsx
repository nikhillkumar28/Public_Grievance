import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listMyComplaintsApi } from "../../api/complaintApi";
import StatusBadge from "../../components/shared/StatusBadge";

export default function MyComplaintsPage() {
  const { data } = useQuery({ queryKey: ["my-complaints"], queryFn: listMyComplaintsApi });
  const complaints = data?.complaints || [];

  const [filters, setFilters] = useState({ status: "", category: "", sort: "newest" });

  const filtered = useMemo(() => {
    let list = [...complaints];
    if (filters.status) list = list.filter((item) => item.status === filters.status);
    if (filters.category) list = list.filter((item) => item.category === filters.category);
    if (filters.sort === "newest") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (filters.sort === "escalated") list.sort((a, b) => (a.status === "escalated" ? -1 : 1));
    if (filters.sort === "high_urgency") list.sort((a, b) => (a.urgency === "High" ? -1 : 1));
    return list;
  }, [complaints, filters]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-civic">
      <h1 className="text-xl font-bold text-civic-navy">My Complaints</h1>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <select className="rounded-md border border-slate-300 px-3 py-2" onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="escalated">Escalated</option>
        </select>
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          placeholder="Category"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        />
        <select className="rounded-md border border-slate-300 px-3 py-2" onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
          <option value="newest">Newest</option>
          <option value="escalated">Escalated</option>
          <option value="high_urgency">High urgency</option>
        </select>
      </div>

      <div className="mt-5 space-y-3">
        {filtered.map((complaint) => (
          <div key={complaint._id} className="flex items-center justify-between rounded-md border border-slate-100 p-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">{complaint.description.slice(0, 100)}...</p>
              <p className="text-xs text-slate-500">{complaint.category}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge value={complaint.urgency} type="urgency" />
              <StatusBadge value={complaint.status} />
              <Link to={`/citizen/complaints/${complaint._id}`} className="text-sm text-civic-blue">
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
