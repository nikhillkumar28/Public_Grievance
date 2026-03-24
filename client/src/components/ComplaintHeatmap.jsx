import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchRecentComplaints } from "../api/publicApi";

const DEFAULT_CENTER = [28.6139, 77.209];

const getDensityColor = (count) => {
  if (count >= 5) return "#dc2626";
  if (count >= 3) return "#eab308";
  return "#16a34a";
};

export default function ComplaintHeatmap() {
  const { data } = useQuery({
    queryKey: ["public-heatmap-complaints"],
    queryFn: fetchRecentComplaints
  });

  const heatPoints = useMemo(() => {
    const complaints = data?.complaints || [];
    const map = new Map();

    complaints.forEach((complaint) => {
      const lat = complaint?.latitude ?? complaint?.location?.lat;
      const lng = complaint?.longitude ?? complaint?.location?.lng;

      if (typeof lat !== "number" || typeof lng !== "number") return;

      const key = `${lat.toFixed(3)}:${lng.toFixed(3)}`;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        existing.totalUpvotes += complaint?.upvotes || 0;
      } else {
        map.set(key, {
          lat,
          lng,
          count: 1,
          totalUpvotes: complaint?.upvotes || 0
        });
      }
    });

    return Array.from(map.values());
  }, [data]);

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
      <h2 className="mb-5 text-2xl font-bold text-civic-navy">Complaint Heatmap</h2>
      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-civic">
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
                <Popup>
                  <p className="font-semibold">Complaints: {point.count}</p>
                  <p>Total upvotes: {point.totalUpvotes}</p>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
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
