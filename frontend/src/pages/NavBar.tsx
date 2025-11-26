// src/components/NavBar.tsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const onLogout = () => {
    localStorage.removeItem("basicAuth");
    nav("/");
    setOpen(false);
    alert("Logged out (dev)");
  };

  return (
    <nav
      style={{
        width: "100%",
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        gap: 25,
        background: "linear-gradient(90deg,#9A5B34,#E8D1A7,#442D1C)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        position: "sticky",
        top: 0,
        zIndex: 9999,
        borderBottom: "1px solid rgba(255,255,255,0.18)",
        boxSizing: "border-box",
      }}
    >
      {/* LEFT: Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 8,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#FFF3E8",
            border: "1px solid rgba(68,45,28,0.18)",
            boxShadow: "0 3px 8px rgba(0,0,0,0.12)",
            flexShrink: 0,
          }}
        >
          <img
            src="assets/logo.jpeg"
            alt="logo"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <span style={{ fontSize: 20 }} aria-hidden>
            📚
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: "#2A1F16",
              textShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            BookHive
          </div>
        </div>
      </div>

      {/* CENTER LINKS */}
      <div style={{ flex: 1, display: "flex", justifyContent: "right" }}>
        <ul
          style={{
            display: "flex",
            gap: 20,
            listStyle: "none",
            margin: 0,
            padding: 0,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { to: "/", label: "Home" },
            { to: "/about", label: "About" },
            { to: "/services", label: "Services" },
            { to: "/admin-login", label: "Admin" },
            { to: "/contact", label: "Contact" },
          ].map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                style={{
                  fontSize: 18,        // ⬅ INCREASED (was 16)
                  fontWeight: 700,
                  color: "#2A1F16",
                  textDecoration: "none",
                  padding: "6px 10px",
                  borderRadius: 8,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = "#743014")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = "#2A1F16")
                }
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT PROFILE ICON */}
      <div style={{ position: "relative" }} ref={dropdownRef}>
        <button
          onClick={() => setOpen((s) => !s)}
          aria-haspopup="true"
          aria-expanded={open}
          style={{
            width: 34,        // ⬅ INCREASED (was 24)
            height: 44,
            borderRadius: "50%",
            background: "#E8D1A7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            border: "1px solid rgba(68,45,28,0.25)",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <span style={{ fontSize: 26 }}>👤</span> {/* ⬅ INCREASED (was 20) */}
        </button>

        {/* DROPDOWN */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 56,
            width: 220,
            borderRadius: 12,
            background: "linear-gradient(180deg,#FFF7F0,#FFF1E6)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
            border: "1px solid rgba(68,45,28,0.12)",
            overflow: "hidden",
            transformOrigin: "top right",
            transform: open ? "scale(1)" : "scale(0.95)",
            opacity: open ? 1 : 0,
            transition: "all 160ms ease",
            pointerEvents: open ? "auto" : "none",
            zIndex: 1000,
          }}
        >
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            style={{
              display: "block",
              padding: "12px 16px",
              color: "#442D1C",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Login
          </Link>

          <Link
            to="/register"
            onClick={() => setOpen(false)}
            style={{
              display: "block",
              padding: "12px 16px",
              color: "#442D1C",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Register
          </Link>

          <div
            onClick={() => onLogout()}
            style={{
              display: "block",
              padding: "12px 16px",
              color: "#743014",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Logout
          </div>
        </div>
      </div>
    </nav>
  );
}
