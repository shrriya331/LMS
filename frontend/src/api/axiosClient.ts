// src/api/axiosClient.ts
import axios from "axios";

const API_BASE = "http://localhost:8081/api";

const client = axios.create({
  baseURL: API_BASE,
  withCredentials: false
});

// Attach admin Basic Auth if stored (admin flow)
client.interceptors.request.use((config) => {
  const adminAuth = localStorage.getItem("adminAuth");
  if (adminAuth) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Basic ${adminAuth}`;
  }
  return config;
});

export default client;
