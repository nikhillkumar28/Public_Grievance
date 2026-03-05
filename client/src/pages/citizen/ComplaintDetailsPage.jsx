import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getComplaintByIdApi, upvoteComplaintApi } from "../../api/complaintApi";
import StatusBadge from "../../components/shared/StatusBadge";

export default function ComplaintDetailsPage() {
  const { id } = useParams();
  const { data, refetch } = useQuery({
    queryKey: ["complaint-detail", id],
    queryFn: () => getComplaintByIdApi(id)
  });

  const complaint = data?.complaint;

  const handleUpvote = async () => {
    await upvoteComplaintApi(id);
    refetch();
  };

  if (!complaint) return <div className="rounded-xl border border-slate-200 bg-white p-6">Loading...</div>;

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-civic">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-civic-navy">Complaint Details</h1>
          <p className="mt-2 text-slate-700">{complaint.description}</p>
        </div>
        <div className="space-y-2">
          <StatusBadge value={complaint.status} />
          <StatusBadge value={complaint.urgency} type="urgency" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-md bg-slate-50 p-3 text-sm"><strong>Category:</strong> {complaint.category}</div>
        <div className="rounded-md bg-slate-50 p-3 text-sm"><strong>Upvotes:</strong> {complaint.upvotes}</div>
        <div className="rounded-md bg-slate-50 p-3 text-sm"><strong>Location:</strong> {complaint.location?.ward || complaint.location?.address || "N/A"}</div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-civic-navy">Timeline</h2>
        <div className="space-y-2">
          {(complaint.timeline || []).map((item, idx) => (
            <div key={`${item.updatedAt}-${idx}`} className="rounded-md border border-slate-100 px-3 py-2 text-sm">
              <span className="font-semibold">{item.status}</span> on {new Date(item.updatedAt).toLocaleString()}
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleUpvote} className="rounded-md bg-civic-blue px-4 py-2 text-sm font-semibold text-white">
        Upvote
      </button>
    </div>
  );
}
