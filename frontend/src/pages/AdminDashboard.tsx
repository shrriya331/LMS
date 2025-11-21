// src/pages/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import { approveUser, listUsers, rejectUser } from "../api/adminApi";
import type { UserSummary } from "../types/dto";
import axios from "axios";

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setError(null);
    try {
      const res = await listUsers();
      setUsers(res.data || []);
    } catch (err: unknown) {
      // Narrow the unknown error safely
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Could not load users");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Could not load users");
      }
    }
  };

  useEffect(() => {
  Promise.resolve().then(() => loadUsers());
}, []);


  const onApprove = async (id: number) => {
    setError(null);
    try {
      await approveUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Approve failed");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Approve failed");
      }
    }
  };

  const onReject = async (id: number) => {
    setError(null);
    try {
      await rejectUser(id, "Rejected from admin UI");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Reject failed");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Reject failed");
      }
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <h2>Admin Dashboard</h2>
      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: 8 }}>ID</th>
            <th style={{ textAlign: "left", padding: 8 }}>Email</th>
            <th style={{ textAlign: "left", padding: 8 }}>Name</th>
            <th style={{ textAlign: "left", padding: 8 }}>Status</th>
            <th style={{ padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: 12, textAlign: "center" }}>
                No users found
              </td>
            </tr>
          )}
          {users.map((u) => (
            <tr key={u.id}>
              <td style={{ padding: 8 }}>{u.id}</td>
              <td style={{ padding: 8 }}>{u.email}</td>
              <td style={{ padding: 8 }}>{u.name}</td>
              <td style={{ padding: 8 }}>{u.status}</td>
              <td style={{ padding: 8 }}>
                <button onClick={() => onApprove(u.id)} style={{ marginRight: 8 }}>
                  Approve
                </button>
                <button onClick={() => onReject(u.id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
