// src/store/useAuthStore.js
// ─────────────────────────────────────────────────────────────
// Admin authentication store.
//
// State:
//   admin      → logged-in admin object | null
//   token      → JWT string | null
//   loading    → API in-flight flag
//   error      → last error message | null
//
// Actions:
//   login(username, password)  → POST /api/admin/login
//   logout()                   → clears session
//   fetchMe()                  → GET  /api/admin/me  (re-hydrate on reload)
//   changePassword(cur, next)  → PUT  /api/admin/change-password
//   clearError()
// ─────────────────────────────────────────────────────────────
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "./api";
import { endpoints } from "../utils/endpoints";

const useAuthStore = create(
  devtools(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────
      admin:   JSON.parse(sessionStorage.getItem("vk_admin") || "null"),
      token:   sessionStorage.getItem("vk_token") || null,
      loading: false,
      error:   null,

      // ── Helpers ─────────────────────────────────────────────
      isLoggedIn: () => !!get().token,
      clearError: () => set({ error: null }),

      // ── POST /api/admin/login ────────────────────────────────
      login: async (username, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post(endpoints.auth.login, { username, password });
          console.log("Login successful:", data);
          // Persist in sessionStorage so page refresh keeps user logged in
          sessionStorage.setItem("vk_token", data.token);
          sessionStorage.setItem("vk_admin", JSON.stringify(data.admin));
          set({ admin: data.admin, token: data.token, loading: false });
          return { success: true };
        } catch (err) {
          set({ error: err.message, loading: false });
          return { success: false, message: err.message };
        }
      },

      // ── Logout ───────────────────────────────────────────────
      logout: () => {
        sessionStorage.removeItem("vk_token");
        sessionStorage.removeItem("vk_admin");
        set({ admin: null, token: null, error: null });
      },

      // ── GET /api/admin/me ────────────────────────────────────
      // Call this on app mount to re-validate the stored token
      fetchMe: async () => {
        if (!get().token) return;
        set({ loading: true });
        try {
          const { data } = await api.get(endpoints.auth.me);
          sessionStorage.setItem("vk_admin", JSON.stringify(data.admin));
          set({ admin: data.admin, loading: false });
        } catch {
          // Token invalid → force logout
          get().logout();
          set({ loading: false });
        }
      },

      // ── PUT /api/admin/change-password ───────────────────────
      changePassword: async (currentPassword, newPassword) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.put(endpoints.auth.changePassword, {
            currentPassword,
            newPassword,
          });
          set({ loading: false });
          return { success: true, message: data.message };
        } catch (err) {
          set({ error: err.message, loading: false });
          return { success: false, message: err.message };
        }
      },
    }),
    { name: "AuthStore" }
  )
);

export default useAuthStore;