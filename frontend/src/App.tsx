// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/" >Home</Link>
        <Link to="/register" >Register</Link>
        <Link to="/login" >Login</Link>
        <Link to="/admin-login" >Admin</Link>
      </nav>

      <div className="app-container">
        <Routes>
          <Route path="/" element={<div className="card"><h2>Welcome to LMS frontend</h2></div>} />
          <Route path="/register" element={<div className="card"><RegisterPage /></div>} />
          <Route path="/login" element={<div className="card"><LoginPage /></div>} />
          <Route path="/admin-login" element={<div className="card"><AdminLoginPage /></div>} />
          <Route path="/admin" element={<div className="card"><AdminDashboard /></div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
