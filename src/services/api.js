// src/store/api.js
// ─────────────────────────────────────────────────────────────
// Central Axios instance used by ALL stores.
// • Reads base URL from VITE_API_URL env var
// • Auto-attaches JWT token to every request
// • Normalises error messages into a single string
// ─────────────────────────────────────────────────────────────
import axios from "axios";

const resolveBaseURL = () => {
  const configured = import.meta.env.VITE_API_URL?.trim();

  if (!configured) return "/api";

  const normalized = configured.replace(/\/+$/, "");
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

const BASE_URL = resolveBaseURL();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach JWT if present ────────────────
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("vk_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
  
);

// ── Response interceptor: normalise errors ────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired → clear session so admin gets redirected to login
    if (error.response?.status === 401) {
      sessionStorage.removeItem("vk_token");
      sessionStorage.removeItem("vk_admin");
    }
    // Attach a readable message to the error object
    error.message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(error);
  }
);

export default api;