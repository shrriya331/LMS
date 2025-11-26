// src/pages/AdminLoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setBasicAuth } from "../api/axiosClient";

const ADMIN_USER = "admin";
const ADMIN_PASS = "Admin@123";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!username.trim() || !password) {
      setErr("Please enter both username and password");
      return;
    }

    if (username.trim() !== ADMIN_USER || password !== ADMIN_PASS) {
      setErr("Invalid admin credentials");
      return;
    }

    setLoading(true);

    try {
      setBasicAuth(username.trim(), password);
      const token = btoa(`${username.trim()}:${password}`);
      localStorage.setItem("basicAuth", token);
      nav("/admin");
    } catch {
      setBasicAuth("", "");
      localStorage.removeItem("basicAuth");
      setErr("Failed to set admin credentials");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    username.trim().length > 0 && password.length > 0 && !loading;

  return (
    <>
      <style>{`
        .admin-bg { position: fixed; inset: 0; z-index: -2; overflow: hidden; }
        .admin-bg img { width:100%; height:100%; object-fit:cover; filter: blur(6px) brightness(0.75); transform: scale(1.02); }

        .admin-overlay { position: fixed; inset: 0; z-index: -1; background: rgba(0,0,0,0.45); }

        .admin-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
        }

        .admin-card {
          width: 90%;
          max-width: 900px;
          border-radius: 22px;
          overflow: hidden;
          display: flex;
          flex-wrap: nowrap;
          background: rgba(255,255,255,0.10);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 10px 26px rgba(0,0,0,0.45);
        }

        .admin-image { flex: 1 1 50%; min-width: 260px; }
        .admin-image img { width:100%; height:100%; object-fit:cover; filter: brightness(0.9); display:block; }

        .admin-panel {
          flex: 1 1 50%;
          min-width: 260px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          color: white;
        }

        .admin-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px;
          background: rgba(255,255,255,0.85);
          border: 1.5px solid rgba(255,255,255,0.55);
          font-size: 1rem;
          color: #000;
        }

        .admin-submit {
          margin-top: 8px;
          padding: 12px;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: 0.2s;
        }

        .admin-submit.enabled {
          background: linear-gradient(135deg,#f97316,#facc15);
          color: #111;
        }

        .admin-submit.disabled {
          background: rgba(255,255,255,0.25);
          color: #333;
          cursor: not-allowed;
        }

        .admin-error {
          padding: 10px;
          border-radius: 10px;
          background: rgba(220,38,38,0.22);
          border: 1px solid rgba(220,38,38,0.35);
          color: #ffbaba;
          font-size: 0.95rem;
          text-align: center;
        }

        .admin-back {
          background: rgba(255,255,255,0.16);
          border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,0.55);
          padding: 7px 16px;
          font-size: 1rem;
          font-weight: 600;
          color: white;
          cursor: pointer;
        }

        @media (max-width: 820px) {
          .admin-card { flex-wrap: wrap; }
          .admin-image { width: 100%; height: 220px; }
          .admin-panel { width: 100%; padding: 24px; }
        }
      `}</style>

      {/* BACKGROUND */}
      <div className="admin-bg">
        <img src="/assets/download.webp" alt="bg" />
      </div>

      {/* DARK OVERLAY */}
      <div className="admin-overlay" />

      <div className="admin-page">
        <div className="admin-card">
          {/* LEFT IMAGE */}
          <div className="admin-image">
            <img src="/assets/download.webp" alt="panel" />
          </div>

          {/* RIGHT LOGIN PANEL */}
          <div className="admin-panel">
            <h1 style={{ fontSize: "2.3rem", fontWeight: 800, marginBottom: 18 }}>
              <span
                style={{
                  background: "linear-gradient(135deg,#ffae42,#ffd98e)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Admin
              </span>{" "}
              Login
            </h1>

            <form
              onSubmit={submit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "22px",
                marginTop: "8px",
              }}
            >
              {/* USERNAME */}
              <div>
                <label
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  Username
                </label>
                <input
                  className="admin-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  className="admin-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                />
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                className={`admin-submit ${
                  canSubmit ? "enabled" : "disabled"
                }`}
                disabled={!canSubmit}
              >
                {loading ? "Checking..." : "🛡️ Login as Admin"}
              </button>

              {/* ERROR */}
              {err && <div className="admin-error">{err}</div>}
            </form>

            {/* BACK */}
            <div style={{ textAlign: "center", marginTop: 22 }}>
              <button className="admin-back" onClick={() => nav("/")}>
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
