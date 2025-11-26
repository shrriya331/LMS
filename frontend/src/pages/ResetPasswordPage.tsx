import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { resetPassword } from "../api/authApi";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = searchParams.get("token");
    if (t) setToken(t);
  }, [searchParams]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (newPassword.length < 8) {
      setErr("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirm) {
      setErr("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, newPassword });
      setMsg("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErr(err.response?.data?.message || err.message || "Reset failed");
      } else if (err instanceof Error) {
        setErr(err.message);
      } else {
        setErr("Reset failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "460px",
        margin: "80px auto",
        padding: "30px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.85)",
        boxShadow: "0 4px 18px rgba(0,0,0,0.15)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "25px",
          fontSize: "1.9rem",
          fontWeight: 700,
          color: "#3a2b1a",
        }}
      >
        Reset Password
      </h2>

      <form
        onSubmit={submit}
        style={{ display: "grid", gap: "16px" }}
      >
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Token"
          required
          style={{
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #b8a77c",
            background: "#f8ecd4",
            fontSize: "1.1rem",
          }}
        />

        <input
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          type="password"
          placeholder="New password"
          required
          style={{
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #b8a77c",
            background: "#f8ecd4",
            fontSize: "1.1rem",
          }}
        />

        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          type="password"
          placeholder="Confirm password"
          required
          style={{
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #b8a77c",
            background: "#f8ecd4",
            fontSize: "1.1rem",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "14px 0",
            borderRadius: "10px",
            fontSize: "1.2rem",
            fontWeight: 600,
            cursor: "pointer",
            background: "linear-gradient(135deg,#743014,#84592B)",
            border: "none",
            color: "#fcefd7",
            boxShadow: "0 6px 15px rgba(0,0,0,0.25)",
          }}
        >
          {loading ? "Please wait..." : "Reset Password"}
        </button>
      </form>

      {msg && (
        <div
          style={{
            marginTop: "18px",
            color: "#0a7300",
            background: "#d7ffd7",
            padding: "12px",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          {msg}
        </div>
      )}

      {err && (
        <div
          style={{
            marginTop: "18px",
            color: "#b30000",
            background: "#ffd2d2",
            padding: "12px",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          {err}
        </div>
      )}
    </div>
  );
}
