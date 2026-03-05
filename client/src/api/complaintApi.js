import api from "./client";

export const createComplaintApi = async (payload) => (await api.post("/complaints", payload)).data;
export const listMyComplaintsApi = async () => (await api.get("/complaints")).data;
export const getComplaintByIdApi = async (id) => (await api.get(`/complaints/${id}`)).data;
export const upvoteComplaintApi = async (id) => (await api.patch(`/complaints/${id}/upvote`)).data;
