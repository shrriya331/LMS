// src/components/RequireAdminAuth.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredBase64Token } from "../api/axiosClient";

/**
 * Simple, synchronous guard:
 * - Reads token during render (cheap)
 * - If missing, redirects immediately to /admin-login
 * - If present, renders children (no flicker, no effect)
 */
export default function RequireAdminAuth({ children }: { children: React.ReactNode }) {
  const token = getStoredBase64Token();

  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
}
