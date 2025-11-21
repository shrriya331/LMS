// src/api/adminApi.ts
import client from "./axiosClient";

export const approveUser = (id: number) =>
  client.post(`/admin/approve/${id}`);

export const rejectUser = (id: number, reason?: string) =>
  client.post(`/admin/reject/${id}${reason ? `?reason=${encodeURIComponent(reason)}` : ""}`);

// Optional: list all users if you add endpoint
export const listUsers = () =>
  client.get("/admin/users");
