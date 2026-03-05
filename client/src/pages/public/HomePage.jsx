import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchActiveAdvisories, fetchPublicOverview, fetchRecentComplaints } from "../../api/publicApi";
import ComplaintCard from "../../components/shared/ComplaintCard";
import TrendingComplaints from "../../components/TrendingComplaints";

const chartColors = ["#b42318", "#d97706", "#1f7a4c", "#7f1d1d"];

export default function HomePage() {
  const { data: overviewData } = useQuery({ queryKey: ["public-overview"], queryFn: fetchPublicOverview });
  const { data: recentData } = useQuery({ queryKey: ["public-recent"], queryFn: fetchRecentComplaints });
  const { data: advisoriesData } = useQuery({ queryKey: ["public-advisories"], queryFn: fetchActiveAdvisories });

  const cards = [
    { label: "Total Complaints", value: overviewData?.totalComplaints || 0 },
    { label: "Pending", value: overviewData?.pending || 0 },
    { label: "In Progress", value: overviewData?.in_progress || 0 },
    { label: "Resolved", value: overviewData?.resolved || 0 }
  ];

  const distribution = [
    { name: "Pending", value: overviewData?.pending || 0 },
    { name: "In Progress", value: overviewData?.in_progress || 0 },
    { name: "Resolved", value: overviewData?.resolved || 0 },
    { name: "Escalated", value: overviewData?.escalated || 0 }
  ];

  return (
    <main>
      <section className="hero-bg">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-2 md:py-20">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight text-civic-navy">
              Empowering Citizens Through Smart Grievance Resolution
            </h1>
            <p className="mt-4 max-w-xl text-slate-600">
              AI-powered civic issue reporting with transparency, accountability, and real-time visibility.
            </p>
            <div className="mt-8 flex gap-3">
              <a href="#trending" className="rounded-md bg-civic-blue px-4 py-3 text-sm font-semibold text-white">
                View Complaints
              </a>
              <Link to="/login" className="rounded-md border border-civic-blue px-4 py-3 text-sm font-semibold text-civic-blue">
                File Complaint
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white/80 p-6 shadow-civic">
            <div className="h-full rounded-xl bg-gradient-to-br from-blue-50 to-emerald-50 p-6 text-sm text-slate-700">
              <p className="text-lg font-semibold text-civic-navy">City Civic Intelligence Panel</p>
              <p className="mt-2">Report local issues, monitor progress, and improve neighborhoods through collaborative participation.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="mb-5 text-2xl font-bold text-civic-navy">Status Overview</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {cards.map((item) => (
            <div key={item.label} className="status-card">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-civic-navy">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-civic">
          <p className="mb-3 text-sm font-semibold text-civic-navy">Complaint Status Distribution</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value">
                  {distribution.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <TrendingComplaints />

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <h2 className="mb-5 text-2xl font-bold text-civic-navy">Recent Complaints</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(recentData?.complaints || []).map((complaint) => (
            <ComplaintCard key={complaint._id} complaint={complaint} detailPath="/login" />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <h2 className="mb-5 text-2xl font-bold text-civic-navy">Public Advisories</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(advisoriesData?.advisories || []).map((advisory) => (
            <article key={advisory._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-civic">
              <h3 className="font-bold text-civic-navy">{advisory.title}</h3>
              <p className="mt-2 text-xs font-semibold text-civic-blue">{advisory.department}</p>
              <p className="mt-2 text-sm text-slate-600">{advisory.description}</p>
              <p className="mt-3 text-xs text-slate-500">
                {new Date(advisory.startDate).toLocaleDateString()} - {new Date(advisory.endDate).toLocaleDateString()}
              </p>
              <button className="mt-4 rounded-md border border-slate-300 px-3 py-2 text-sm">Read More</button>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-civic-navy py-14 text-white">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-3xl font-bold">Have an issue in your area?</h2>
          <p className="mt-2 text-blue-100">File a complaint and track every status update transparently.</p>
          <Link to="/login" className="mt-6 inline-block rounded-md bg-white px-5 py-3 text-sm font-semibold text-civic-navy">
            File Complaint
          </Link>
        </div>
      </section>
    </main>
  );
}
