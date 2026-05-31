import { create } from "zustand";
import api from "./api";
import { endpoints } from "../utils/endpoints";


export const useProfileStore = create((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(endpoints.auth.me);
      const profile = res.data?.admin || res.data;
      set({ profile, loading: false });
      return profile;
    } catch (err) {
      const message = err.response?.data?.message || "Failed loading profile";
      set({ error: message, loading: false });
      return null;
    }
  },

  updateProfile: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put(endpoints.auth.updateProfile, payload);
      const profile = res.data?.admin || res.data?.profile || res.data;
      set({ profile, loading: false });
      return profile;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed updating profile", loading: false });
      return null;
    }
  },

  changePassword: async (currentPassword, nextPassword) => {
    try {
      await api.put(endpoints.auth.changePassword, { currentPassword, nextPassword });
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Password update failed");
    }
  },

  revokeSession: async (id) => {
    try {
      const res = await api.delete(endpoints.auth.session(id));
      set((state) => ({ profile: { ...state.profile, sessions: res.data.sessions } }));
      return true;
    } catch (err) {
      return false;
    }
  },

  revokeAllSessions: async () => {
    try {
      const res = await api.delete(endpoints.auth.sessions);
      set((state) => ({ profile: { ...state.profile, sessions: res.data.sessions } }));
      return true;
    } catch (err) {
      return false;
    }
  },

  updateNotifications: async (notificationPayload) => {
    try {
      const res = await api.put(endpoints.auth.notifications, { notifications: notificationPayload });
      set((state) => ({ profile: { ...state.profile, notifications: res.data.notifications } }));
      return true;
    } catch (err) {
      return false;
    }
  },

  clearOrderHistory: async () => {
    try {
      await api.post("/admin/danger/clear-history");
      return true;
    } catch (err) {
      return false;
    }
  },

  resetAllSettings: async () => {
    try {
      const res = await api.post("/admin/danger/reset-defaults");
      set({ profile: res.data.admin });
      return true;
    } catch (err) {
      return false;
    }
  }
}));

export default useProfileStore;
