import React, { useState } from "react";
import InputField from "../components/InputField";
import { register } from "../api/authApi";
import type { RegistrationRequest } from "../types/dto";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type FieldErrors = Record<string, string>;

export default function RegisterPage() {
  const [form, setForm] = useState<RegistrationRequest>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "STUDENT",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [msg, setMsg] = useState<string | null>(null);
  const nav = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMsg(null);
    try {
      const res = await register(form);
      setMsg(`Registered. status: ${res.data.status}. ID: ${res.data.id}`);
      setTimeout(() => nav("/login"), 1000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (data && typeof data === "object" && data !== null) {
          const fieldMap: FieldErrors = {};
          const obj = data as Record<string, unknown>;
          for (const key of Object.keys(obj)) {
            const val = obj[key];
            if (typeof val === "string") fieldMap[key] = val;
            else if (Array.isArray(val) && typeof val[0] === "string") fieldMap[key] = val[0];
          }
          if (Object.keys(fieldMap).length > 0) {
            setErrors(fieldMap);
            return;
          }
        }
        setMsg(err.response?.data?.error || "Registration failed");
      } else if (err instanceof Error) setMsg(err.message);
      else setMsg("Registration failed");
    }
  };

  return (
    <div>
      <h2 style={{marginBottom:12}}>Register</h2>
      <form onSubmit={onSubmit}>
        <div className="form-row">
          <label>Name</label>
          <InputField name="name" value={form.name} onChange={onChange} />
          {errors.name && <div className="error">{errors.name}</div>}
        </div>

        <div className="form-row">
          <label>Email</label>
          <InputField name="email" type="email" value={form.email} onChange={onChange} />
          {errors.email && <div className="error">{errors.email}</div>}
        </div>

        <div className="form-row">
          <label>Phone</label>
          <InputField name="phone" value={form.phone ?? ""} onChange={onChange} />
          {errors.phone && <div className="error">{errors.phone}</div>}
        </div>

        <div className="form-row">
          <label>Password</label>
          <InputField name="password" type="password" value={form.password} onChange={onChange} />
          {errors.password && <div className="error">{errors.password}</div>}
        </div>

        <div className="form-row">
          <label>Role</label>
          <select name="role" value={form.role} onChange={onChange} style={{padding:8,borderRadius:6}}>
            <option value="STUDENT">STUDENT</option>
            <option value="LIBRARIAN">LIBRARIAN</option>
          </select>
        </div>

        <button type="submit">Register</button>
      </form>

      {msg && <div className="message">{msg}</div>}
    </div>
  );
}
