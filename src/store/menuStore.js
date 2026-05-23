// src/store/useMenuStore.js
// ─────────────────────────────────────────────────────────────
// Menu items store — used by both the public menu page
// and the admin Manage Menu panel.
//
// Image uploads go directly to Cloudinary from the browser.
// Backend receives a plain JSON body with `image: "<cdn-url>"`
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import api from "./api";
import { endpoints } from "../utils/endpoints";

// ── Resolve any payload shape → plain JSON object ─────────────
const resolvePayload = async (payload) => {
  if (payload instanceof FormData) {
    const obj = {};
    payload.forEach((value, key) => {
      if (value instanceof File) return;
      obj[key] = value;
    });
    return obj;
  }
  return payload;
};

// ─────────────────────────────────────────────────────────────

const useMenuStore = create(
  devtools(
    persist(
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
        fetchMenu: async ({ category = null, includeUnavailable = false } = {}) => {
          const hasCachedItems = get().items.length > 0;
          
          // Only trigger loading state if we have absolutely nothing cached
          if (!hasCachedItems) set({ loading: true });
          set({ error: null });

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
            
            // Return what we have locally if the fetch fails
            return { success: !hasCachedItems, data: get().items, message };
          }
        },

        // ── POST /api/menu  (admin) ──────────────────────────────
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
          set((s) => ({
            items: s.items.map((i) =>
              i._id === id ? { ...i, available: !i.available } : i
            ),
          }));

          try {
            const { data } = await api.patch(endpoints.toggleAvailability || endpoints.menu.toggleAvailability(id));

            set((s) => ({
              items: s.items.map((i) => (i._id === id ? data.data : i)),
            }));

            const label = data.data?.available ? "Available" : "Unavailable";
            toast.success(`Item marked as ${label}`);
            return { success: true, available: data.data?.available };
          } catch (err) {
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
      {
        name: "bakery-menu-storage",
        storage: createJSONStorage(() => localStorage),
        // Filter transient ui properties out of local storage cache
        partialize: (state) => ({ items: state.items }),
      }
    )
  )
);

export default useMenuStore;