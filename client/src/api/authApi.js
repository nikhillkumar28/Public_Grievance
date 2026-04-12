import api from "./client";

export const loginApi = async (payload) => (await api.post("/auth/login", payload)).data;
export const registerApi = async (payload) => (await api.post("/auth/register", payload)).data;

export const getMeApi = async () => (await api.get("/users/me")).data;
export const updateMeApi = async (payload) => (await api.patch("/users/me", payload)).data;
