import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import api from "./api";

const useStoreStore = create(
  devtools(
    persist(
      (set, get) => ({
        store: null,
        loading: false,
        error: null,

        // ── Fetch store info (public) ────────────────────────────
        fetchStore: async () => {
          // If we already have data in the store (from cache), 
          // we don't set loading to true to avoid jarring UI flickers.
          const isInitialFetch = !get().store;
          if (isInitialFetch) set({ loading: true });
          
          set({ error: null });

          try {
            const { data } = await api.get("/store");
            set({ store: data.data, loading: false });
            return data.data;
          } catch (err) {
            set({ error: err.message, loading: false });
            console.error("Failed to fetch store:", err.message);
            return get().store; // Return cached data even on error
          }
        },

        // ── Update store info (admin only) ────────────────────────
        updateStore: async (updateData) => {
          set({ loading: true, error: null });
          try {
            const { data } = await api.put("/store/update", updateData);
            set({ store: data.data, loading: false });
            toast.success(data.message || "Store updated successfully");
            return data.data;
          } catch (err) {
            set({ error: err.message, loading: false });
            toast.error(err.message);
            return null;
          }
        },

        // ── Toggle store status (admin only) ─────────────────────
        toggleStatus: async () => {
          set({ loading: true, error: null });
          try {
            const { data } = await api.patch("/store/toggle-status");
            set({ store: data.data, loading: false });
            toast.success(data.message || "Store status updated");
            return data.data;
          } catch (err) {
            set({ error: err.message, loading: false });
            toast.error(err.message);
            return null;
          }
        },
    })
))

)
 export default useStoreStore