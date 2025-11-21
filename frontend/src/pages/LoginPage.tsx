import React, { useState } from "react";
import InputField from "../components/InputField";
import { login } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      const res = await login({ email, password });
      localStorage.setItem("user", JSON.stringify(res.data));
      nav("/");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setErr(err.response?.data?.error || "Login failed");
      else if (err instanceof Error) setErr(err.message);
      else setErr("Login failed");
    }
  };

  return (
    <div>
      <h2 style={{marginBottom:12}}>Login</h2>
      <form onSubmit={onSubmit}>
        <div className="form-row">
          <label>Email</label>
          <InputField name="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <div className="form-row">
          <label>Password</label>
          <InputField name="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        <button type="submit">Login</button>
      </form>
      {err && <div className="error">{err}</div>}
    </div>
  );
}
