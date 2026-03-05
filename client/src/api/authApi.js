import api from "./client";

export const loginApi = async (payload) => (await api.post("/auth/login", payload)).data;
export const registerApi = async (payload) => (await api.post("/auth/register", payload)).data;
