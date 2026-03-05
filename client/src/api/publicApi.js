import api from "./client";

export const fetchPublicOverview = async () => (await api.get("/complaints/public/overview")).data;
export const fetchTrendingComplaints = async () => (await api.get("/complaints/trending")).data;
export const fetchRecentComplaints = async () => (await api.get("/complaints/public/recent")).data;
export const fetchActiveAdvisories = async () => (await api.get("/advisories/active")).data;
