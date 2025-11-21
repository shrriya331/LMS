// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css"; // make sure this line exists and path is correct

const root = document.getElementById("root")!;
createRoot(root).render(
  // remove StrictMode for simpler dev behavior
  <App />
);
