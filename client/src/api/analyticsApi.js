import api from "./client";

export const fetchAnalyticsStatus = async () => (await api.get("/analytics/status")).data;
