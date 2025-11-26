// src/api/adminApi.ts
import client from "./axiosClient";

/**
 * GET all pending users for admin approval
 */
export const listUsers = () => client.get("/api/admin/users");

/**
 * Approve a user by ID
 */
export const approveUser = (id: number) =>
  client.post(`/api/admin/approve/${encodeURIComponent(id)}`);

/**
 * Reject a user by ID
 */
export const rejectUser = (id: number, reason?: string) => {
  const url =
    `/api/admin/reject/${encodeURIComponent(id)}` +
    (reason ? `?reason=${encodeURIComponent(reason)}` : "");
  return client.post(url);
};
