import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import ComplaintCard from "./shared/ComplaintCard";
import { fetchTrendingComplaints } from "../api/publicApi";
import { upvoteComplaintApi } from "../api/complaintApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useUpvotes } from "../context/UpvoteContext";

export default function TrendingComplaints() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { upvotedIds, upvotingIds, markUpvoted, unmarkUpvoted, setUpvoting } = useUpvotes();
  const queryClient = useQueryClient();
  const { data: trendingData } = useQuery({
    queryKey: ["trending-complaints"],
    queryFn: fetchTrendingComplaints
  });

  const updateUpvoteInCache = (cacheData, complaintId, delta) => {
    if (!cacheData?.complaints) return cacheData;
    return {
      ...cacheData,
      complaints: cacheData.complaints.map((item) =>
        item._id === complaintId ? { ...item, upvotes: (item.upvotes || 0) + delta } : item
      )
    };
  };

  const handleUpvote = async (complaint) => {
    const complaintId = complaint?._id;
    if (!complaintId || upvotingIds.has(complaintId) || upvotedIds.has(complaintId)) return;

    setUpvoting(complaintId, true);
    markUpvoted(complaintId);

    const queryKeys = [["trending-complaints"], ["public-recent"]];
    const previous = queryKeys.map((key) => [key, queryClient.getQueryData(key)]);
    queryKeys.forEach((key) => {
      queryClient.setQueryData(key, (data) => updateUpvoteInCache(data, complaintId, 1));
    });

    try {
      await upvoteComplaintApi(complaintId);
      showToast("Upvote recorded. Thanks for supporting this issue.", { type: "success" });
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || "Failed to upvote complaint.";
      previous.forEach(([key, data]) => queryClient.setQueryData(key, data));

      if (status === 400 && message.toLowerCase().includes("already upvoted")) {
        markUpvoted(complaintId);
        showToast("You have already upvoted this complaint.", { type: "info" });
      } else {
        unmarkUpvoted(complaintId);
        showToast(message, { type: "error" });
      }
    } finally {
      setUpvoting(complaintId, false);
    }
  };

  const cardDetailPath = useMemo(
    () => (complaint) => (user?.role === "citizen" ? `/citizen/complaints/${complaint?._id}` : "/login"),
    [user?.role]
  );

  return (
    <section id="trending" className="mx-auto max-w-7xl px-6 pb-12">
      <h2 className="mb-5 text-2xl font-bold text-civic-navy">{"\u{1F525} Trending Issues Near You"}</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(trendingData?.complaints || []).map((complaint) => (
          <ComplaintCard
            key={complaint._id}
            complaint={complaint}
            detailPath={cardDetailPath}
            onUpvote={user?.role === "citizen" ? handleUpvote : undefined}
            isUpvoted={upvotedIds.has(complaint._id)}
            isUpvoting={upvotingIds.has(complaint._id)}
          />
        ))}
      </div>
    </section>
  );
}
