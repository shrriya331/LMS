// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { setBasicAuthFromToken } from "./api/axiosClient";

// Restore Basic auth from localStorage (if present).
// setBasicAuthFromToken accepts either "Basic <token>" or raw base64 token.
const token = localStorage.getItem("basicAuth");
setBasicAuthFromToken(token);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
