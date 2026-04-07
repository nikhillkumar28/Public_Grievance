import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";
import { fetchAnalyticsStatus } from "../api/analyticsApi";
import { useAuth } from "../context/AuthContext";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const { logout } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics-status"],
    queryFn: fetchAnalyticsStatus
  });

  const metrics = [
    { label: "Total Complaints", value: data?.total ?? 0 },
    { label: "Pending", value: data?.pending ?? 0 },
    { label: "In Progress", value: data?.inProgress ?? 0 },
    { label: "Resolved", value: data?.resolved ?? 0 }
  ];

  const pieData = useMemo(
    () => ({
      labels: ["Pending", "In Progress", "Resolved"],
      datasets: [
        {
          data: [data?.pending ?? 0, data?.inProgress ?? 0, data?.resolved ?? 0],
          backgroundColor: ["#f59e0b", "#3b82f6", "#22c55e"],
          borderColor: ["#ffffff", "#ffffff", "#ffffff"],
          borderWidth: 2
        }
      ]
    }),
    [data]
  );

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-civic-navy">Analytics Dashboard</h1>
        <button
          type="button"
          onClick={logout}
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
        >
          Logout
        </button>
      </div>

      {isLoading ? <p className="mt-4 text-sm text-slate-600">Loading analytics...</p> : null}
      {isError ? <p className="mt-4 text-sm text-red-600">Failed to load analytics data.</p> : null}

      <section className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:scale-[1.02]"
          >
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-bold text-civic-navy">{metric.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-civic-navy">Complaint Distribution</h2>
        <div className="mx-auto mt-5 max-w-md">
          <Pie data={pieData} />
        </div>
      </section>
    </main>
  );
}

