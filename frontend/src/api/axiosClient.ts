import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:8081";
const STORAGE_KEY = "basicAuth";

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    Accept: "application/json",
  },
});

/** Set Basic Auth and persist token */
export function setBasicAuth(identifier: string, password: string) {
  if (identifier && password) {
    const token = btoa(`${identifier}:${password}`);
    client.defaults.headers.common["Authorization"] = `Basic ${token}`;
    localStorage.setItem(STORAGE_KEY, token);
  } else {
    delete client.defaults.headers.common["Authorization"];
    localStorage.removeItem(STORAGE_KEY);
  }
}

/** Clear auth */
export function clearAuth() {
  delete client.defaults.headers.common["Authorization"];
  localStorage.removeItem(STORAGE_KEY);
}

/** Load token from storage when app loads */
export function setBasicAuthFromToken(token: string | null) {
  if (!token) {
    clearAuth();
    return;
  }
  client.defaults.headers.common["Authorization"] = `Basic ${token}`;
}

export function getStoredBase64Token(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

// Auto-load saved token
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
  setBasicAuthFromToken(saved);
}

export default client;
