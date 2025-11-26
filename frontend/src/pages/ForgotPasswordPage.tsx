import React, { useState } from "react";
import axios from "axios";
import { forgotPassword } from "../api/authApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const resp = await forgotPassword({ email });
      setMsg(resp.data?.message || "If the email exists, a reset link was sent.");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErr(err.response?.data?.message || err.message || "Failed to send reset email");
      } else if (err instanceof Error) {
        setErr(err.message);
      } else {
        setErr("Failed to send reset email");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .fp-input {
          width: 100%;
          padding: 10px 14px;
          font-size: 1rem;
          border-radius: 8px;
          border: 1px solid #ccc;
          transition: 0.2s;
          outline: none;
        }
        .fp-input:focus {
          border-color: #8b5e34;
          box-shadow: 0 0 4px rgba(139, 94, 52, 0.4);
        }

        .fp-btn {
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          background: #c49b6c;
          color: white;
          transition: 0.2s;
        }
        .fp-btn:hover {
          background: #a87f4d;
        }
        .fp-btn:disabled {
          background: #d7c2aa;
          cursor: not-allowed;
        }
      `}</style>

      <div style={{ maxWidth: 480, margin: "40px auto", padding: 20, textAlign: "center" }}>
        <h2>Forgot password</h2>

        <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 20 }}>
          <input
            type="email"
            placeholder="your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="fp-input"
          />

          <button type="submit" disabled={loading} className="fp-btn">
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {msg && <div style={{ color: "green", marginTop: 12 }}>{msg}</div>}
        {err && <div style={{ color: "red", marginTop: 12 }}>{err}</div>}
      </div>
    </>
  );
}
