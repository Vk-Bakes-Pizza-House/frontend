// src/store/useMenuStore.js
// ─────────────────────────────────────────────────────────────
// Menu items + category store.
// Images go directly to Cloudinary from browser.
// Backend receives plain JSON with `image: "<cdn-url>"`.
//
// Endpoints used:
//   items     → /menu/items   /menu/item   /menu/item/:id   /menu/item/:id/toggle
//   categories→ /menu         /menu        /menu/:id
// ─────────────────────────────────────────────────────────────
import { create }                        from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { toast }                         from "sonner";
import api                               from "../services/api";
import { endpoints }                     from "../utils/endpoints";

// ── Resolve FormData → plain JSON (drops File objects) ───────
const resolvePayload = async (payload) => {
  if (payload instanceof FormData) {
    const obj = {};
    payload.forEach((value, key) => {
      if (value instanceof File) return;   // files must be uploaded first
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

        // ── State ─────────────────────────────────────────────
        items:          [],
        categories:     [],      // [{ _id, category, emoji }]
        loading:        false,
        error:          null,
        activeCategory: "all",

        // ── Computed ──────────────────────────────────────────
        filteredItems: () => {
          const { items, activeCategory } = get();
          if (activeCategory === "all") return items;
          return items.filter((i) => i.category === activeCategory);
        },

        // ── Helpers ───────────────────────────────────────────
        clearError:  () => set({ error: null }),
        setCategory: (cat) => set({ activeCategory: cat }),
        

        // ══════════════════════════════════════════════════════
        // MENU ITEMS
        // ══════════════════════════════════════════════════════

        // ── GET /api/menu/items ───────────────────────────────
        fetchMenu: async ({ category = null, includeUnavailable = false } = {}) => {
          const hasCached = get().items.length > 0;
          if (!hasCached) set({ loading: true });
          set({ error: null });

          try {
            const params = {};
            if (category && category !== "all") params.category = category;
            if (includeUnavailable)             params.all       = "true";

            const { data } = await api.get(endpoints.menu.getAll, { params });
            set({ items: data.data, loading: false });
            return { success: true, data: data.data };
          } catch (err) {
            const message = err?.response?.data?.message || err.message;
            set({ error: message, loading: false });
            toast.error(`Failed to load menu: ${message}`);
            return { success: false, data: get().items, message };
          }
        },

        // ── POST /api/menu/item ───────────────────────────────
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

        // ── PUT /api/menu/item/:id ────────────────────────────
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

        // ── DELETE /api/menu/item/:id ─────────────────────────
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

        // ── PATCH /api/menu/item/:id/toggle ──────────────────
        // FIX 1: removed the broken `endpoints.toggleAvailability ||` fallback
        //        endpoints.menu.toggleAvailability(id) is always the correct call
        toggleAvailability: async (id) => {
          // Optimistic flip
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
            // Revert optimistic flip
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

        // ══════════════════════════════════════════════════════
        // CATEGORIES  (separate /menu endpoints)
        // ══════════════════════════════════════════════════════

        // ── GET /api/menu ─────────────────────────────────────
        // FIX 2: backend returns { data: [...] } — was storing the
        //        wrapper object instead of the array
        fetchCategories: async () => {
          set({ loading: true, error: null });
          try {
            const { data } = await api.get(endpoints.menu.getAllMenu);
            // data.data is the array; some backends return the array directly
            const cats = Array.isArray(data) ? data : (data.data ?? []);
            set({ categories: cats, loading: false });
            return { success: true, data: cats };
          } catch (err) {
            const message = err?.response?.data?.message || "Could not load categories";
            set({ error: message, loading: false });
            toast.error(message);
            return { success: false, message };
          }
        },

        // ── POST /api/menu ────────────────────────────────────
        // catData: { category: "pizza", emoji: "🍕" }
        addCategory: async (catData) => {
          set({ loading: true, error: null });
          const toastId = toast.loading("Adding category…");
          try {
            const { data } = await api.post(endpoints.menu.createMenu, catData);
            console.log(data,"fetch")
            const newCat = data.data ?? data;   // handle both response shapes

            set((s) => ({
              categories: [...s.categories, newCat].sort((a, b) =>
                (a.category || a.name || "").localeCompare(b.category || b.name || "")
              ),
              loading: false,
            }));
            toast.success("Category added!", { id: toastId });
            return { success: true, data: newCat };
          } catch (err) {
            const message = err?.response?.data?.message || "Failed to add category";
            set({ error: message, loading: false });
            toast.error(message, { id: toastId });
            return { success: false, message };
          }
        },

        // ── DELETE /api/menu/:id ──────────────────────────────
        deleteCategory: async (id) => {
          set({ loading: true, error: null });
          const toastId = toast.loading("Deleting category…");
          try {
            await api.delete(endpoints.menu.deleteMenu(id));

            set((s) => ({
              categories: s.categories.filter((cat) => cat._id !== id),
              loading:    false,
            }));
            toast.success("Category deleted!", { id: toastId });
            return { success: true };
          } catch (err) {
            const message = err?.response?.data?.message || "Could not delete category";
            set({ error: message, loading: false });
            toast.error(message, { id: toastId });
            return { success: false, message };
          }
        },
      }),

      {
        name:    "bakery-menu-storage",
        storage: createJSONStorage(() => localStorage),
        // FIX 3: only persist items — categories are cheap to refetch
        //        and should not go stale in localStorage
        partialize: (state) => ({ items: state.items }),
      }
    ),
    { name: "MenuStore" }
  )
);

export default useMenuStore;