// src/pages/LoginPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/download.webp";

import client, {
  setBasicAuth,
  setBasicAuthFromToken,
  clearAuth,
} from "../api/axiosClient";
import axios from "axios";
import { login as loginApi } from "../api/authApi";

type Role = "librarian" | "student";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  // Restore saved token (if any) on load
  useEffect(() => {
    const stored = localStorage.getItem("basicAuth");
    if (stored) {
      setBasicAuthFromToken(stored);
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    try {
      // 1) call backend login endpoint to validate credentials
      const resp = await loginApi({ email, password });
      console.log("login resp:", resp.data);

      // 2) set Basic auth header (persisted by axios client)
      setBasicAuth(email, password);
      console.log("axios Authorization header:", client.defaults.headers.common["Authorization"]);

      // Login successful → redirect to home
      nav("/");
      return;

      // fallback
      setErr("Unknown role returned. Contact administrator.");
      // optionally clear header if you don't want to keep it
      // clearAuth();
    } catch (error: unknown) {
      // Ensure we clear any header set by mistake
      clearAuth();

      if (axios.isAxiosError(error)) {
        const serverMsg =
          (error.response && (error.response.data?.error || error.response.data?.message)) ||
          error.response?.statusText ||
          null;

        setErr((serverMsg as string) || "Invalid credentials or server error");
      } else if (error instanceof Error) {
        setErr(error.message);
      } else {
        setErr("Login failed");
      }
    }
  };

  return (
    <>
      {/* BACKGROUND */}
      <div style={{ position: "fixed", inset: 0, zIndex: -2, overflow: "hidden" }}>
        <img
          src={bgImage}
          alt="Background"
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(6px) brightness(0.75)", transform: "scale(1.02)" }}
        />
      </div>
      <div style={{ position: "fixed", inset: 0, zIndex: -1, background: "rgba(0,0,0,0.45)" }} />

      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", zIndex: 0 }}>
        <div style={{ width: "95%", maxWidth: "700px", padding: "45px 45px", borderRadius: "30px", background: "#E8D1A7CC", backdropFilter: "blur(15px)", border: "1px solid rgba(255,255,255,0.25)", boxShadow: "0 0 40px rgba(0,0,0,0.25)" }}>
          <h2 style={{ fontSize: "2.2rem", marginBottom: "25px", color: "#442D1C", fontWeight: "800", textShadow: "0 3px 8px rgba(0,0,0,0.4)" }}>Log In</h2>

          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <div>
              <label style={{ color: "#442D1C", fontSize: "1.3rem", fontWeight: "600", marginBottom: "8px", display: "block" }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid #9D9167", background: "#E8D1A7", fontSize: "1.3rem" }} />
            </div>

            <div>
              <label style={{ color: "#442D1C", fontSize: "1.3rem", fontWeight: "600", marginBottom: "8px", display: "block" }}>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as Role)} style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid #9D9167", background: "#E8D1A7", fontSize: "1.3rem" }}>
                <option value="student">Student</option>
                <option value="librarian">Librarian</option>
              </select>
            </div>

            <div>
              <label style={{ color: "#442D1C", fontSize: "1.3rem", fontWeight: "600", marginBottom: "8px", display: "block" }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid #9D9167", background: "#E8D1A7", fontSize: "1.3rem" }} />
            </div>

            <div style={{ textAlign: "right", marginTop: "-20px" }}>
              <button type="button" onClick={() => nav("/forgot-password")} style={{ background: "none", border: "none", color: "#442D1C", fontSize: "1.2rem", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}>Forgot Password?</button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", marginTop: "20px" }}>
              <button type="submit" style={{ flex: 1, padding: "12px 0", background: "linear-gradient(135deg,#743014,#84592B)", border: "none", borderRadius: "14px", fontSize: "1.6rem", fontWeight: "700", cursor: "pointer", color: "#E8D1A7", boxShadow: "0 10px 25px rgba(0,0,0,0.25)" }}>Log In</button>

              <button onClick={() => nav("/")} style={{ flex: 1, padding: "12px 0", background: "transparent", border: "1px solid #9D9167", borderRadius: "14px", fontSize: "1.6rem", color: "#442D1C", cursor: "pointer" }}>← Back to Home</button>
            </div>

            {err && (
              <div style={{ color: "#ffdddd", background: "rgba(200,0,0,0.3)", padding: "12px", borderRadius: "10px", fontSize: "1.4rem", textAlign: "center", border: "1px solid rgba(255,0,0,0.4)" }}>{err}</div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
