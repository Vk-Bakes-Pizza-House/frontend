// src/store/useMenuStore.js
// ─────────────────────────────────────────────────────────────
// Menu items store — used by both the public menu page
// and the admin Manage Menu panel.
//
// Image uploads go directly to Cloudinary from the browser.
// Backend receives a plain JSON body with `image: "<cdn-url>"`
//
// State:
//   items            → full list fetched from API
//   loading          → fetch / mutation in-flight
//   error            → last error message | null
//   activeCategory   → currently selected category filter
//
// Actions (public):
//   fetchMenu(opts?)           → GET    /api/menu
//
// Actions (admin — require JWT):
//   createItem(payload)        → POST   /api/menu
//   updateItem(id, payload)    → PUT    /api/menu/:id
//   deleteItem(id)             → DELETE /api/menu/:id
//   toggleAvailability(id)     → PATCH  /api/menu/:id/toggle
//   setCategory(cat)           → local filter only (no API call)
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import api from "./api";
import { endpoints } from "../utils/endpoints";


// ── Resolve any payload shape → plain JSON object ─────────────
// Handles three cases:
//   1. Plain object with an imageFile (File) key  ← most common from forms
//   2. FormData (converts to plain object, uploads file if present)
//   3. Plain object with no file (pass-through)
const resolvePayload = async (payload) => {
  if (payload instanceof FormData) {
    const obj = {};
    payload.forEach((value, key) => {
      if (value instanceof File) {
        // Raw File objects should be uploaded before calling create/update.
        return;
      }
      obj[key] = value;
    });
    return obj;
  }

  return payload;
};

// ─────────────────────────────────────────────────────────────

const useMenuStore = create(
  devtools(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────
      items:          [],
      loading:        false,
      error:          null,
      activeCategory: "all",

      // ── Computed (derived) ──────────────────────────────────
      filteredItems: () => {
        const { items, activeCategory } = get();
        if (activeCategory === "all") return items;
        return items.filter((i) => i.category === activeCategory);
      },

      // ── Helpers ─────────────────────────────────────────────
      clearError:  () => set({ error: null }),
      setCategory: (cat) => set({ activeCategory: cat }),

      // ── GET /api/menu ────────────────────────────────────────
      // ?all=true fetches including out-of-stock (admin use)
      fetchMenu: async ({ category = null, includeUnavailable = false } = {}) => {
        set({ loading: true, error: null });
        try {
          const params = {};
          if (category && category !== "all") params.category = category;
          if (includeUnavailable) params.all = "true";

          const { data } = await api.get(endpoints.menu.getAll, { params });
          set({ items: data.data, loading: false });
          return { success: true, data: data.data };
        } catch (err) {
          const message = err?.response?.data?.message || err.message;
          set({ error: message, loading: false });
          toast.error(`Failed to load menu: ${message}`);
          return { success: false, message };
        }
      },

      // ── POST /api/menu  (admin) ──────────────────────────────
      // payload: { name, category, price, description, deliverable, tag, imageFile? }
      // imageFile (File) → uploaded to Cloudinary first; backend receives CDN URL
      createItem: async (payload) => {
        set({ loading: true, error: null });
        const toastId = toast.loading("Creating menu item…");

        try {
          const requestData = await resolvePayload(payload);

          const { data } = await api.post(endpoints.menu.create, requestData);

          set((s) => ({ items: [...s.items, data.data], loading: false }));
          toast.success("Menu item created!", { id: toastId });
          return { success: true, data: data.data };
        } catch (err) {
          const message = err?.response?.data?.message || err.message;
          set({ error: message, loading: false });
          toast.error(`Create failed: ${message}`, { id: toastId });
          return { success: false, message };
        }
      },

      // ── PUT /api/menu/:id  (admin) ───────────────────────────
      // payload: same shape as createItem — imageFile optional
      updateItem: async (id, payload) => {
        set({ loading: true, error: null });
        const toastId = toast.loading("Updating menu item…");

        try {
          const requestData = await resolvePayload(payload);

          const { data } = await api.put(endpoints.menu.update(id), requestData);

          set((s) => ({
            items:   s.items.map((i) => (i._id === id ? data.data : i)),
            loading: false,
          }));
          toast.success("Menu item updated!", { id: toastId });
          return { success: true, data: data.data };
        } catch (err) {
          const message = err?.response?.data?.message || err.message;
          set({ error: message, loading: false });
          toast.error(`Update failed: ${message}`, { id: toastId });
          return { success: false, message };
        }
      },

      // ── DELETE /api/menu/:id  (admin) ────────────────────────
      deleteItem: async (id) => {
        set({ loading: true, error: null });
        const toastId = toast.loading("Deleting menu item…");

        try {
          await api.delete(endpoints.menu.delete(id));

          set((s) => ({
            items:   s.items.filter((i) => i._id !== id),
            loading: false,
          }));
          toast.success("Menu item deleted!", { id: toastId });
          return { success: true };
        } catch (err) {
          const message = err?.response?.data?.message || err.message;
          set({ error: message, loading: false });
          toast.error(`Delete failed: ${message}`, { id: toastId });
          return { success: false, message };
        }
      },

      // ── PATCH /api/menu/:id/toggle  (admin) ──────────────────
      toggleAvailability: async (id) => {
        // Optimistic update — flip locally first, revert on error
        set((s) => ({
          items: s.items.map((i) =>
            i._id === id ? { ...i, available: !i.available } : i
          ),
        }));

        try {
          const { data } = await api.patch(endpoints.menu.toggleAvailability(id));

          // Sync with server truth
          set((s) => ({
            items: s.items.map((i) => (i._id === id ? data.data : i)),
          }));

          const label = data.data?.available ? "Available" : "Unavailable";
          toast.success(`Item marked as ${label}`);
          return { success: true, available: data.data?.available };
        } catch (err) {
          // Revert optimistic update
          set((s) => ({
            items: s.items.map((i) =>
              i._id === id ? { ...i, available: !i.available } : i
            ),
            error: err.message,
          }));

          const message = err?.response?.data?.message || err.message;
          toast.error(`Toggle failed: ${message}`);
          return { success: false, message };
        }
      },
    }),
    { name: "MenuStore" }
  )
);

export default useMenuStore;