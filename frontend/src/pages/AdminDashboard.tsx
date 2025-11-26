// src/pages/AdminDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { approveUser, listUsers, rejectUser } from "../api/adminApi";
import type { UserSummary } from "../types/dto";
import axios from "axios";

type UnknownRecord = Record<string, unknown>;

function extractMessageFromUnknown(data: unknown): string | null {
  if (!data) return null;
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    const obj = data as UnknownRecord;
    if (typeof obj.error === "string") return obj.error;
    if (typeof obj.message === "string") return obj.message;
    try {
      return JSON.stringify(obj);
    } catch {
      return null;
    }
  }
  return null;
}

function monthLabel(i: number) {
  return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i];
}

function getCreatedAtRaw(u: Partial<UserSummary>): string | null {
  const rec = u as unknown as UnknownRecord;
  if (rec.createdAt && typeof rec.createdAt === "string") return rec.createdAt;
  if (rec.created_at && typeof rec.created_at === "string") return rec.created_at;
  if (rec.created && typeof rec.created === "string") return rec.created;
  return null;
}
function getPhone(u: Partial<UserSummary>): string | null {
  const rec = u as unknown as UnknownRecord;
  const phone = rec.phone ?? rec.mobile ?? rec.contact ?? null;
  return phone ? String(phone) : null;
}
function getStatus(u: Partial<UserSummary>): string {
  const rec = u as unknown as UnknownRecord;
  const s = rec.status ?? "";
  return String(s);
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const navigate = useNavigate();

  const loadUsers = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await listUsers();
      setUsers(Array.isArray(res.data) ? (res.data as UserSummary[]) : []);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = extractMessageFromUnknown(err.response?.data) ?? err.message ?? "Could not load users";
        setError(msg);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Could not load users");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();

    // auto-refresh (optional) — keeps UI synced if backend changes
    const id = setInterval(() => {
      void loadUsers();
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const onApprove = async (id: number) => {
    setError(null);
    setActionLoading(id);
    try {
      await approveUser(id);
      // reload canonical state from server
      await loadUsers();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = extractMessageFromUnknown(err.response?.data) ?? err.message ?? "Approve failed";
        setError(msg);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Approve failed");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const onReject = async (id: number) => {
    const ok = window.confirm("Are you sure you want to reject this user?");
    if (!ok) return;

    setError(null);
    setActionLoading(id);
    try {
      await rejectUser(id, "Rejected from admin UI");
      await loadUsers();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = extractMessageFromUnknown(err.response?.data) ?? err.message ?? "Reject failed";
        setError(msg);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Reject failed");
      }
    } finally {
      setActionLoading(null);
    }
  };

  // derived stats & charts
  const { total, pending, approved, rejected, monthlyCounts } = useMemo(() => {
    const totals = { total: 0, pending: 0, approved: 0, rejected: 0 };
    const months = new Array<number>(12).fill(0);

    users.forEach((u) => {
      totals.total++;
      const status = getStatus(u).toLowerCase();
      if (status.includes("pending")) totals.pending++;
      else if (status.includes("approve")) totals.approved++;
      else if (status.includes("reject")) totals.rejected++;

      const created = getCreatedAtRaw(u);
      if (created) {
        const d = new Date(created);
        if (!Number.isNaN(d.getTime())) months[d.getMonth()]++;
      }
    });

    return { total: totals.total, pending: totals.pending, approved: totals.approved, rejected: totals.rejected, monthlyCounts: months };
  }, [users]);

  const pieSegments = useMemo(() => [
    { label: "Pending", value: pending, color: "#D97706" },
    { label: "Approved", value: approved, color: "#10B981" },
    { label: "Rejected", value: rejected, color: "#EF4444" },
  ], [pending, approved, rejected]);

  const lineData = useMemo(() => {
    const w = 480, h = 150, pad = 20;
    const data = monthlyCounts.slice();
    const max = Math.max(1, ...data);
    const stepX = (w - pad * 2) / Math.max(1, data.length - 1);
    const points = data.map((v, i) => {
      const x = pad + i * stepX;
      const y = pad + (h - pad * 2) * (1 - v / max);
      return `${x},${y}`;
    }).join(" ");
    return { w, h, pad, poly: points, max, data };
  }, [monthlyCounts]);

  const pendingList = useMemo(() => users
    .filter((u) => getStatus(u).toLowerCase().includes("pending"))
    .slice()
    .sort((a, b) => {
      const da = new Date(getCreatedAtRaw(a) ?? 0).getTime();
      const db = new Date(getCreatedAtRaw(b) ?? 0).getTime();
      return da - db;
    })
  , [users]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, Arial, sans-serif", background: "#f3f4f6" }}>
      {/* Sidebar (compact, no logo/title duplication) */}
      <aside style={{
        width: 220,
        background: "linear-gradient(180deg,#B07A47,#E8D1A7)",
        color: "#2b1a12",
        padding: "22px 12px",
        boxSizing: "border-box",
      }}>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 24 }}>
          {[
            { label: "Dashboard", path: "/admin" },
            { label: "Books", path: "/admin/books" },
            { label: "Users", path: "/admin/users" },
            { label: "Requests", path: "/admin/requests" },
            { label: "Reports", path: "/admin/reports" },
          ].map((it) => (
            <button
              key={it.path}
              onClick={() => navigate(it.path)}
              style={{
                textAlign: "left",
                padding: "12px 14px",
                background: "transparent",
                border: "none",
                color: "#2b1a12",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              {it.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: 22, boxSizing: "border-box" }}>
        {/* top header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827" }}>Dashboard</h1>
            <div style={{ color: "#6b7280", marginTop: 6, fontSize: 13 }}>Overview</div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 15, color: "#374151" }}>Total Users: <strong>{total}</strong></div>
            <div style={{ fontSize: 15, color: "#374151" }}>Pending: <strong>{pending}</strong></div>
            <div style={{ fontSize: 15, color: "#374151" }}>Rejected: <strong>{rejected}</strong></div>
            <button onClick={() => void loadUsers()} style={{ padding: "8px 14px", borderRadius: 8, background: "#111827", color: "white", border: "none", cursor: "pointer", fontWeight: 700 }}>Refresh</button>
          </div>
        </div>

        {/* stat cards */}
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>
          <div style={{ background: "white", padding: 18, borderRadius: 12, boxShadow: "0 6px 18px rgba(2,6,23,0.06)" }}>
            <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 700 }}>Total Users</div>
            <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{total}</div>
          </div>

          <div style={{ background: "white", padding: 18, borderRadius: 12, boxShadow: "0 6px 18px rgba(2,6,23,0.06)" }}>
            <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 700 }}>Pending Requests</div>
            <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900, color: "#D97706" }}>{pending}</div>
          </div>

          <div style={{ background: "white", padding: 18, borderRadius: 12, boxShadow: "0 6px 18px rgba(2,6,23,0.06)" }}>
            <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 700 }}>Rejected Requests</div>
            <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900, color: "#EF4444" }}>{rejected}</div>
          </div>
        </div>

        {/* charts */}
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: "white", padding: 14, borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 800 }}>Request Status</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>Distribution</div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center" }}>
              <svg width={200} height={130} viewBox="0 0 220 150" aria-hidden>
                <g transform="translate(110,75)">
                  {(() => {
                    const radius = 52;
                    const circumference = 2 * Math.PI * radius;
                    let offset = 0;
                    const segs = pieSegments;
                    const sum = Math.max(1, segs.reduce((s, x) => s + x.value, 0));
                    return segs.map((s) => {
                      const stroke = (s.value / sum) * circumference;
                      const dashArray = `${stroke} ${circumference - stroke}`;
                      const el = (
                        <circle
                          key={s.label}
                          r={radius}
                          fill="transparent"
                          stroke={s.color}
                          strokeWidth={28}
                          strokeDasharray={dashArray}
                          strokeDashoffset={-offset}
                          transform="rotate(-90)"
                        />
                      );
                      offset += stroke;
                      return el;
                    });
                  })()}
                </g>
              </svg>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pieSegments.map((p) => (
                  <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 12, height: 12, background: p.color, borderRadius: 4 }} />
                    <div style={{ fontWeight: 700, minWidth: 80 }}>{p.label}</div>
                    <div style={{ color: "#6b7280" }}>{p.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: "white", padding: 14, borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 800 }}>Monthly Registrations</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>Last 12 months</div>
            </div>

            <svg width={lineData.w} height={lineData.h} style={{ marginTop: 12 }}>
              {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => (
                <line key={String(idx)} x1={lineData.pad} x2={lineData.w - lineData.pad} y1={lineData.pad + (lineData.h - lineData.pad * 2) * t} y2={lineData.pad + (lineData.h - lineData.pad * 2) * t} stroke="#eef2ff" strokeWidth={1} />
              ))}

              <polyline fill="none" stroke="#60a5fa" strokeWidth={2.5} points={lineData.poly} />
              <polygon fill="rgba(96,165,250,0.12)" points={`${lineData.poly} ${lineData.w - lineData.pad},${lineData.h - lineData.pad} ${lineData.pad},${lineData.h - lineData.pad}`} />

              {lineData.data.map((_, i) => {
                const x = lineData.pad + i * ((lineData.w - lineData.pad * 2) / (lineData.data.length - 1));
                const y = lineData.h - lineData.pad + 14;
                return <text key={i} x={x} y={y} textAnchor="middle" fontSize={10} fill="#6b7280">{monthLabel(i)}</text>;
              })}

              <text x={lineData.w - 6} y={lineData.pad + 10} textAnchor="end" fontSize={11} fill="#6b7280">{lineData.max}</text>
            </svg>
          </div>
        </div>

        {/* pending table */}
        <div style={{ marginTop: 16, background: "white", borderRadius: 12, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px" }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Pending Requests</div>
            <div style={{ color: "#6b7280" }}>{pendingList.length} awaiting action</div>
          </div>

          <div style={{ overflowX: "auto", marginTop: 8 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  <th style={{ padding: 10, textAlign: "left", fontWeight: 700 }}>ID</th>
                  <th style={{ padding: 10, textAlign: "left", fontWeight: 700 }}>Name</th>
                  <th style={{ padding: 10, textAlign: "left", fontWeight: 700 }}>Email</th>
                  <th style={{ padding: 10, textAlign: "left", fontWeight: 700 }}>Phone</th>
                  <th style={{ padding: 10, textAlign: "left", fontWeight: 700 }}>Requested</th>
                  <th style={{ padding: 10, textAlign: "center", fontWeight: 700 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} style={{ padding: 18, textAlign: "center" }}>Loading...</td></tr>
                )}

                {!loading && pendingList.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 18, textAlign: "center" }}>No pending requests</td></tr>
                )}

                {!loading && pendingList.map((u) => (
                  <tr key={u.id} style={{ borderTop: "1px solid #eef2f7" }}>
                    <td style={{ padding: 10 }}>{u.id}</td>
                    <td style={{ padding: 10 }}>{u.name}</td>
                    <td style={{ padding: 10 }}>{u.email}</td>
                    <td style={{ padding: 10 }}>{getPhone(u) ?? "-"}</td>
                    <td style={{ padding: 10 }}>{new Date(getCreatedAtRaw(u) ?? Date.now()).toLocaleString()}</td>
                    <td style={{ padding: 10, textAlign: "center", whiteSpace: "nowrap" }}>
                      <button onClick={() => void onApprove(u.id)} disabled={actionLoading === u.id} style={{ marginRight: 8, padding: "8px 12px", borderRadius: 8, border: "none", background: "#10B981", color: "white", fontWeight: 700, cursor: actionLoading === u.id ? "wait" : "pointer" }}>
                        {actionLoading === u.id ? "…" : "Approve"}
                      </button>
                      <button onClick={() => void onReject(u.id)} disabled={actionLoading === u.id} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", background: "#fff", color: "#EF4444", fontWeight: 700, cursor: actionLoading === u.id ? "wait" : "pointer" }}>
                        {actionLoading === u.id ? "…" : "Reject"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {error && <div style={{ marginTop: 12, color: "#b91c1c", fontWeight: 700 }}>{error}</div>}
      </main>
    </div>
  );
}
