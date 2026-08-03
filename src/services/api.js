
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ;

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
    // Create a custom error with readable message (error.message is read-only)
    const customError = new Error(
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again."
    );
    customError.response = error.response;
    customError.status = error.response?.status;
    return Promise.reject(customError);
  }
);

export default api;