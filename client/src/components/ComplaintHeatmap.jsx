import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchRecentComplaints } from "../api/publicApi";

const DEFAULT_CENTER = [28.6139, 77.209];
const FILTERS = ["All", "Road", "Water", "Electricity"];

const getDensityColor = (count) => {
  if (count >= 5) return "#dc2626";
  if (count >= 3) return "#eab308";
  return "#16a34a";
};

const getTopEntry = (map, fallback) => {
  let topKey = fallback;
  let topValue = -1;
  map.forEach((value, key) => {
    if (value > topValue) {
      topValue = value;
      topKey = key;
    }
  });
  return topKey;
};

const formatWard = (ward) => {
  if (!ward || ward === "N/A") return "N/A";
  if (typeof ward === "string" && ward.toLowerCase().includes("ward")) return ward;
  return `Ward ${ward}`;
};

export default function ComplaintHeatmap() {
  const [activeFilter, setActiveFilter] = useState("All");
  const { data } = useQuery({
    queryKey: ["public-heatmap-complaints"],
    queryFn: fetchRecentComplaints
  });

  const filteredComplaints = useMemo(() => {
    const complaints = data?.complaints || [];
    if (activeFilter === "All") return complaints;
    return complaints.filter((complaint) => (complaint?.category || "Other") === activeFilter);
  }, [activeFilter, data]);

  const heatPoints = useMemo(() => {
    const map = new Map();

    filteredComplaints.forEach((complaint) => {
      const lat = complaint?.latitude ?? complaint?.location?.lat;
      const lng = complaint?.longitude ?? complaint?.location?.lng;

      if (typeof lat !== "number" || typeof lng !== "number") return;

      const key = `${lat.toFixed(3)}:${lng.toFixed(3)}`;
      const ward = complaint?.ward ?? complaint?.location?.ward ?? "N/A";
      const issue = complaint?.category || "Other";
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        existing.totalUpvotes += complaint?.upvotes || 0;
        existing.wardCounts.set(ward, (existing.wardCounts.get(ward) || 0) + 1);
        existing.categoryCounts.set(issue, (existing.categoryCounts.get(issue) || 0) + 1);
      } else {
        map.set(key, {
          lat,
          lng,
          count: 1,
          totalUpvotes: complaint?.upvotes || 0,
          wardCounts: new Map([[ward, 1]]),
          categoryCounts: new Map([[issue, 1]])
        });
      }
    });

    return Array.from(map.values()).map((point) => ({
      ...point,
      topWard: getTopEntry(point.wardCounts, "N/A"),
      topIssue: getTopEntry(point.categoryCounts, "Other")
    }));
  }, [filteredComplaints]);

  const mapCenter = useMemo(() => {
    if (!heatPoints.length) return DEFAULT_CENTER;
    const total = heatPoints.reduce(
      (acc, point) => {
        acc.lat += point.lat;
        acc.lng += point.lng;
        return acc;
      },
      { lat: 0, lng: 0 }
    );
    return [total.lat / heatPoints.length, total.lng / heatPoints.length];
  }, [heatPoints]);

  return (
    <section className="mx-auto max-w-7xl px-6 pb-12">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-civic-navy">Complaint Heatmap</h2>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-3 py-1.5 transition ${
                activeFilter === filter
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-civic">
        <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={false} className="h-[420px] w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {heatPoints.map((point, index) => {
            const color = getDensityColor(point.count);
            return (
              <CircleMarker
                key={`${point.lat}-${point.lng}-${index}`}
                center={[point.lat, point.lng]}
                radius={Math.min(10 + point.count * 2, 24)}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.55
                }}
              >
                <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                  <div className="space-y-1 text-xs text-slate-900">
                    <p className="text-sm font-semibold">{formatWard(point.topWard)}</p>
                    <p>Complaints: {point.count}</p>
                    <p>Top Issue: {point.topIssue}</p>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-6 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
          Red = many complaints
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          Yellow = moderate
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-green-600" />
          Green = few
        </span>
      </div>
    </section>
  );
}

