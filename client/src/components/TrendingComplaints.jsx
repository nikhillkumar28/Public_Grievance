import { useQuery } from "@tanstack/react-query";
import ComplaintCard from "./shared/ComplaintCard";
import { fetchTrendingComplaints } from "../api/publicApi";

export default function TrendingComplaints() {
  const { data: trendingData } = useQuery({
    queryKey: ["trending-complaints"],
    queryFn: fetchTrendingComplaints
  });

  return (
    <section id="trending" className="mx-auto max-w-7xl px-6 pb-12">
      <h2 className="mb-5 text-2xl font-bold text-civic-navy">{"\u{1F525} Trending Issues Near You"}</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(trendingData?.complaints || []).map((complaint) => (
          <ComplaintCard key={complaint._id} complaint={complaint} />
        ))}
      </div>
    </section>
  );
}
