import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Admin@123");
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = btoa(`${username}:${password}`);
      localStorage.setItem("adminAuth", token);
      nav("/admin");
    } catch {
      setErr("Failed to set admin credentials");
    }
  };

  return (
    <div>
      <h2 style={{marginBottom:12}}>Admin Login</h2>
      <form onSubmit={submit}>
        <div className="form-row">
          <label>Username</label>
          <input value={username} onChange={(e)=>setUsername(e.target.value)} style={{width:"100%",padding:8,borderRadius:6}} />
        </div>
        <div className="form-row">
          <label>Password</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} style={{width:"100%",padding:8,borderRadius:6}} />
        </div>
        <button type="submit">Login as Admin</button>
      </form>
      {err && <div className="error">{err}</div>}
    </div>
  );
}
