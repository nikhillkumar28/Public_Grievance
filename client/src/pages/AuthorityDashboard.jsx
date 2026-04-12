import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listMyComplaintsApi, updateComplaintStatusApi } from "../api/complaintApi";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/shared/StatusBadge";
import { useToast } from "../context/ToastContext";

export default function AuthorityDashboard() {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("All");
  const [wardFilter, setWardFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Upvotes");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["authority-complaints"],
    queryFn: listMyComplaintsApi
  });

  const complaints = data?.complaints || [];
  const HIGH_UPVOTE_THRESHOLD = 20;
  const OLD_COMPLAINT_DAYS = 5;
  const now = Date.now();

  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === "pending").length;
    const inProgress = complaints.filter((c) => c.status === "in_progress").length;
    const resolved = complaints.filter((c) => c.status === "resolved").length;
    const highPriority = complaints.filter((c) => c.urgency === "High").length;
    return [
      { label: "Total Assigned Complaints", value: total },
      { label: "Pending", value: pending },
      { label: "In Progress", value: inProgress },
      { label: "Resolved", value: resolved },
      { label: "High Priority", value: highPriority }
    ];
  }, [complaints]);

  const highPriorityComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const urgencyHigh = complaint?.urgency === "High";
      const upvotesHigh = (complaint?.upvotes || 0) >= HIGH_UPVOTE_THRESHOLD;
      const ageDays = complaint?.createdAt ? (now - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60 * 24) : 0;
      const oldComplaint = ageDays >= OLD_COMPLAINT_DAYS;
      return urgencyHigh || upvotesHigh || oldComplaint;
    });
  }, [complaints, now]);

  const insights = useMemo(() => {
    const categoryCounts = new Map();
    const wardCounts = new Map();
    let totalResolutionMs = 0;
    let resolvedCount = 0;

    complaints.forEach((complaint) => {
      const category = complaint?.category || "Uncategorized";
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);

      const ward = complaint?.ward ?? complaint?.location?.ward ?? "N/A";
      wardCounts.set(ward, (wardCounts.get(ward) || 0) + 1);

      if (complaint?.status === "resolved") {
        const createdAt = complaint?.createdAt ? new Date(complaint.createdAt).getTime() : null;
        const resolvedTimeline = (complaint?.timeline || []).filter((item) => item.status === "resolved");
        const resolvedAt = resolvedTimeline.length
          ? new Date(resolvedTimeline[resolvedTimeline.length - 1].updatedAt).getTime()
          : complaint?.updatedAt
            ? new Date(complaint.updatedAt).getTime()
            : null;
        if (createdAt && resolvedAt) {
          totalResolutionMs += Math.max(0, resolvedAt - createdAt);
          resolvedCount += 1;
        }
      }
    });

    const getTopKey = (map) => {
      let topKey = null;
      let topValue = -1;
      map.forEach((value, key) => {
        if (value > topValue) {
          topValue = value;
          topKey = key;
        }
      });
      return topKey || "N/A";
    };

    const avgResolutionDays = resolvedCount
      ? Math.round((totalResolutionMs / resolvedCount / (1000 * 60 * 60 * 24)) * 10) / 10
      : 0;

    return {
      mostCommonIssue: getTopKey(categoryCounts),
      topWard: getTopKey(wardCounts),
      avgResolutionDays
    };
  }, [complaints]);

  const notifications = useMemo(() => {
    const nowMs = Date.now();
    const newAssignedCount = complaints.filter((complaint) => {
      if (complaint?.status !== "pending") return false;
      const createdAt = complaint?.createdAt ? new Date(complaint.createdAt).getTime() : 0;
      const ageDays = (nowMs - createdAt) / (1000 * 60 * 60 * 24);
      return ageDays <= 2;
    }).length;

    const escalatedCount = complaints.filter((complaint) => complaint?.status === "escalated").length;
    const highPriorityCount = highPriorityComplaints.length;
    const resolvedCount = complaints.filter((complaint) => complaint?.status === "resolved").length;
    const inProgressCount = complaints.filter((complaint) => complaint?.status === "in_progress").length;

    return [
      { label: "New complaint assigned", count: newAssignedCount },
      { label: "Issue escalated", count: escalatedCount },
      { label: "Status updated", count: Math.max(0, resolvedCount + inProgressCount) }
    ];
  }, [complaints, highPriorityComplaints]);

  const wardOptions = useMemo(() => {
    const wards = complaints
      .map((c) => c?.ward ?? c?.location?.ward)
      .filter(Boolean)
      .map((ward) => ward.toString());
    return ["All", ...Array.from(new Set(wards))];
  }, [complaints]);

  const categoryOptions = useMemo(() => {
    const categories = complaints.map((c) => c?.category || "Uncategorized");
    return ["All", ...Array.from(new Set(categories))];
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const statusMatch = statusFilter === "All" || complaint?.status === statusFilter;
      const wardValue = (complaint?.ward ?? complaint?.location?.ward ?? "N/A").toString();
      const wardMatch = wardFilter === "All" || wardValue === wardFilter;
      const categoryValue = complaint?.category || "Uncategorized";
      const categoryMatch = categoryFilter === "All" || categoryValue === categoryFilter;
      const search = searchTerm.trim().toLowerCase();
      const searchMatch =
        !search ||
        complaint?._id?.toLowerCase().includes(search) ||
        complaint?.description?.toLowerCase().includes(search) ||
        wardValue.toLowerCase().includes(search) ||
        categoryValue.toLowerCase().includes(search);
      return statusMatch && wardMatch && categoryMatch && searchMatch;
    });
  }, [categoryFilter, complaints, searchTerm, statusFilter, wardFilter]);

  const sortedComplaints = useMemo(() => {
    const list = [...filteredComplaints];
    if (sortBy === "Upvotes") {
      list.sort((a, b) => (b?.upvotes || 0) - (a?.upvotes || 0));
    } else if (sortBy === "Oldest") {
      list.sort((a, b) => new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0));
    } else if (sortBy === "Urgency") {
      const weight = { High: 3, Medium: 2, Low: 1 };
      list.sort((a, b) => (weight[b?.urgency] || 0) - (weight[a?.urgency] || 0));
    }
    return list;
  }, [filteredComplaints, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedComplaints.length / PAGE_SIZE));
  const pagedComplaints = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedComplaints.slice(start, start + PAGE_SIZE);
  }, [currentPage, sortedComplaints]);

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const getAgeDays = (value) => {
    if (!value) return 0;
    return Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleStatusUpdate = async (complaintId, status) => {
    try {
      await updateComplaintStatusApi(complaintId, status);
      showToast("\u2705 Status updated", { type: "success" });
      await queryClient.invalidateQueries({ queryKey: ["authority-complaints"] });
    } catch (error) {
      showToast(error?.response?.data?.message || "Failed to update status.", { type: "error" });
    }
  };

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-civic-navy">Authority Dashboard</h1>
        <div className="flex items-center gap-3">
          <details className="relative">
            <summary className="list-none cursor-pointer rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300">
              {"\u{1F514}"}
            </summary>
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <p className="font-semibold text-slate-800">Notifications</p>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                <li>- New complaint assigned</li>
                <li>- Issue escalated</li>
                <li>- Status updated</li>
              </ul>
            </div>
          </details>
          <div className="relative">
            <details className="group">
              <summary className="list-none cursor-pointer rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300">
                {"\u{1F464}"}
              </summary>
              <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-slate-200 bg-white p-2 text-sm shadow-civic">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full rounded-md px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                >
                  Logout
                </button>
              </div>
            </details>
          </div>
        </div>
      </div>

      {isLoading ? <p className="mt-4 text-sm text-slate-600">Loading assigned complaints...</p> : null}
      {isError ? <p className="mt-4 text-sm text-red-600">Failed to load assigned complaints.</p> : null}

      <section className="mt-6 grid grid-cols-5 gap-6">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-2xl bg-white p-5 shadow-sm transition-all duration-200 hover:scale-[1.02]">
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p>
              <span className="text-lg text-slate-400">
                {stat.label === "Total Assigned Complaints"
                  ? "\u{1F4CB}"
                  : stat.label === "Pending"
                    ? "\u{23F3}"
                    : stat.label === "In Progress"
                      ? "\u{1F527}"
                      : stat.label === "Resolved"
                        ? "\u{2705}"
                        : "\u{1F525}"}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-800">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-civic-navy">{"\u{1F525}"} High Priority Issues</h2>
            <p className="text-xs text-slate-500">
              High urgency, high upvotes (≥ {HIGH_UPVOTE_THRESHOLD}), or older than {OLD_COMPLAINT_DAYS} days
            </p>
          </div>

        {highPriorityComplaints.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No high priority issues at the moment.</p>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-6">
            {highPriorityComplaints.map((complaint) => {
              const ward = complaint?.ward ?? complaint?.location?.ward ?? "N/A";
              const ageDays = getAgeDays(complaint?.createdAt);
              return (
                <article
                  key={complaint._id}
                  className="rounded-xl border-l-4 border-red-500 bg-white p-4 shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {(complaint?.category || "Issue")} - {`Ward ${ward}`}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {(complaint?.description || "Untitled issue").slice(0, 80)}
                      </p>
                    </div>
                    <StatusBadge value={complaint?.urgency || "Low"} type="urgency" />
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                    <span>{`\u{1F44D} ${complaint?.upvotes || 0}`}</span>
                    <span>{`\u{23F1} ${ageDays} days`}</span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(complaint._id, "in_progress")}
                      disabled={complaint?.status === "in_progress" || complaint?.status === "resolved"}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Start Work
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(complaint._id, "resolved")}
                      disabled={complaint?.status === "resolved"}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Resolve
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-civic-navy">{"\u{1F4CB}"} Complaint Management</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {["All", "pending", "in_progress", "resolved"].map((value) => {
              const labelMap = {
                All: "All",
                pending: "Pending",
                in_progress: "In Progress",
                resolved: "Resolved"
              };
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleFilterChange(setStatusFilter)(value === "All" ? "All" : value)}
                  className={`rounded-full px-3 py-1.5 transition ${
                    statusFilter === (value === "All" ? "All" : value)
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {labelMap[value]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">{"\u{1F50D}"} Search</span>
            <input
              value={searchTerm}
              onChange={(e) => handleFilterChange(setSearchTerm)(e.target.value)}
              placeholder="ID, ward, category..."
              className="w-44 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
            >
              <option value="All">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Ward</span>
            <select
              value={wardFilter}
              onChange={(e) => handleFilterChange(setWardFilter)(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
            >
              {wardOptions.map((ward) => (
                <option key={ward} value={ward}>
                  {ward}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Category</span>
            <select
              value={categoryFilter}
              onChange={(e) => handleFilterChange(setCategoryFilter)(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => handleFilterChange(setSortBy)(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
            >
              {["Upvotes", "Oldest", "Urgency"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="grid grid-cols-7 gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
            <span>ID</span>
            <span>Category</span>
            <span>Ward</span>
            <span>Status</span>
            <span>Upvotes</span>
            <span>Age</span>
            <span>Action</span>
          </div>
          <div className="divide-y divide-slate-100">
            {sortedComplaints.length === 0 ? (
              <div className="px-4 py-4 text-sm text-slate-600">No complaints match the selected filters.</div>
            ) : (
              pagedComplaints.map((complaint) => {
                const ward = complaint?.ward ?? complaint?.location?.ward ?? "N/A";
                return (
                  <div key={complaint._id} className="grid grid-cols-7 items-center gap-2 px-4 py-3 text-xs hover:bg-gray-50">
                    <span className="font-semibold text-slate-900">{complaint._id?.slice(-6)}</span>
                    <span className="text-slate-700">{complaint?.category || "Uncategorized"}</span>
                    <span className="text-slate-700">{ward}</span>
                    <StatusBadge value={complaint?.status} />
                    <span className="text-slate-700">{complaint?.upvotes || 0}</span>
                    <span className="text-slate-700">{getAgeDays(complaint?.createdAt)}d</span>
                    <button
                      type="button"
                      className="rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-blue-700"
                    >
                      View
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {sortedComplaints.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <span>
              Showing {(currentPage - 1) * PAGE_SIZE + 1}-
              {Math.min(currentPage * PAGE_SIZE, sortedComplaints.length)} of {sortedComplaints.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                Prev
              </button>
              <span className="text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center gap-2">
            <span className="text-lg">{"\u{1F4CA}"}</span>
            <h2 className="text-lg font-semibold text-slate-800">Insights</h2>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>- Most common issue: {insights.mostCommonIssue}</li>
            <li>- Peak ward: {insights.topWard}</li>
            <li>- Avg resolution: {insights.avgResolutionDays} days</li>
          </ul>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center gap-2">
            <span className="text-lg">{"\u{1F514}"}</span>
            <h2 className="text-lg font-semibold text-slate-800">Notifications</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {notifications.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
                <p className="font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.count} alert{item.count === 1 ? "" : "s"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}



