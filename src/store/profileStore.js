// import { create } from "zustand";
// import { devtools } from "zustand/middleware";
// import { toast } from "sonner";
// import api from "./api";
// import { endpoints } from "../utils/endpoints";

// const useProfileStore = create(
//   devtools(
//     (set) => ({
//       profile: null,
//       loading: false,
//       error: null,

//       fetchProfile: async () => {
//         set({ loading: true, error: null });
//         try {
//           const { data } = await api.get(endpoints.auth.me);
//           set({ profile: data.admin, loading: false });
//           return data.admin;
//         } catch (err) {
//           console.error("Fetch profile failed:", err.message);
//           set({ error: err.message, loading: false });
//           toast.error(err.message);
//           return null;
//         }
//       },

//       updateProfile: async (updateData) => {
//         set({ loading: true, error: null });
//         try {
//           const { data } = await api.put(endpoints.auth.updateProfile, updateData);
//           set({ profile: data.admin, loading: false });
//           sessionStorage.setItem("vk_admin", JSON.stringify(data.admin));
//           toast.success(data.message || "Profile saved successfully");
//           return data.admin;
//         } catch (err) {
//           console.error("Update profile failed:", err.message);
//           set({ error: err.message, loading: false });
//           toast.error(err.message);
//           return null;
//         }
//       },

//       clearError: () => set({ error: null }),
//     }),
//     { name: "ProfileStore" }
//   )
// );

// export default useProfileStore;




import { create } from "zustand";
import axios from "axios";

// Setup dynamic client adapter defaults using pre-configured axios interceptor wrappers
const api = axios.create({ baseURL: "/api/admin", headers: { "Content-Type": "application/json" } });

export const useProfileStore = create((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/profile");
      set({ profile: res.data, loading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed loading data matrices", loading: false });
      return null;
    }
  },

  updateProfile: async (payload) => {
    try {
      const res = await api.put("/profile", payload);
      set({ profile: res.data.profile });
      return res.data.profile;
    } catch (err) {
      return null;
    }
  },

  changePassword: async (currentPassword, nextPassword) => {
    try {
      await api.put("/security/password", { currentPassword, nextPassword });
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Password execution failed");
    }
  },

  revokeSession: async (id) => {
    try {
      const res = await api.delete(`/security/sessions/${id}`);
      set((state) => ({ profile: { ...state.profile, sessions: res.data.sessions } }));
      return true;
    } catch (err) {
      return false;
    }
  },

  revokeAllSessions: async () => {
    try {
      const res = await api.delete("/security/sessions");
      set((state) => ({ profile: { ...state.profile, sessions: res.data.sessions } }));
      return true;
    } catch (err) {
      return false;
    }
  },

  updateNotifications: async (notificationPayload) => {
    try {
      const res = await api.put("/notifications", { notifications: notificationPayload });
      set((state) => ({ profile: { ...state.profile, notifications: res.data.notifications } }));
      return true;
    } catch (err) {
      return false;
    }
  },

  clearOrderHistory: async () => {
    try {
      await api.post("/danger/clear-history");
      return true;
    } catch (err) {
      return false;
    }
  },

  resetAllSettings: async () => {
    try {
      const res = await api.post("/danger/reset-defaults");
      set({ profile: res.data.admin });
      return true;
    } catch (err) {
      return false;
    }
  }
}));

export default useProfileStore;
