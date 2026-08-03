
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
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



export default api;