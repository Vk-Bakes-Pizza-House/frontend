import { create } from "zustand";
import {
  devtools,
  persist,
  createJSONStorage,
} from "zustand/middleware";

import { toast } from "sonner";
import api  from "../services/api";
import { endpoints } from "../utils/endpoints";


// ─────────────────────────────────────────────
// Cache Duration
// 10 Minutes
// ─────────────────────────────────────────────

const CACHE_DURATION =
  1000 * 60 * 10;


// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────

const useStoreStore = create(

  devtools(

    persist(

      (set, get) => ({

        // ── State ─────────────────────────

        store: null,

        loading: false,

        error: null,

        lastFetched: null,


        // ─────────────────────────────────
        // Fetch Store
        // ─────────────────────────────────

        fetchStore: async (
          forceRefresh = false
        ) => {

          const {
            store,
            lastFetched,
          } = get();

          const now = Date.now();

          // ── Cache Check ────────────────

          const isCacheValid =
            store &&
            lastFetched &&
            now - lastFetched <
            CACHE_DURATION;

          // Return Cached Data
          if (
            isCacheValid &&
            !forceRefresh
          ) {

            console.log(
              "Using cached store data"
            );

            return store;
          }

          // ── Loading ───────────────────

          const isInitialFetch =
            !store;

          if (isInitialFetch) {
            set({ loading: true });
          }

          set({ error: null });

          try {

            const { data } =
              await api.get(endpoints.store.get);

            set({

              store: data.data,

              loading: false,

              lastFetched: Date.now(),

            });

            return data.data;

          } catch (err) {

            console.error(
              "Fetch store failed:",
              err.message
            );

            set({

              error: err.message,

              loading: false,

            });

            // Return Old Cache
            return store;
          }
        },


        // ─────────────────────────────────
        // Update Store
        // ─────────────────────────────────

        updateStore: async (
          updateData
        ) => {

          set({
            loading: true,
            error: null,
          });

          try {

            const { data } =
              await api.put(endpoints.store.update,
                updateData
              );

            set({

              store: data.data,

              loading: false,

              lastFetched:
                Date.now(),

            });

            toast.success(
              data.message ||
              "Store updated successfully"
            );

            return data.data;

          } catch (err) {

            set({

              error: err.message,

              loading: false,

            });

            toast.error(
              err.message
            );

            return null;
          }
        },


        // ─────────────────────────────────
        // Toggle Store Status
        // ─────────────────────────────────

        toggleStatus: async () => {

          set({
            loading: true,
            error: null,
          });

          try {

            const { data } =
              await api.patch(endpoints.store.toggle
              );

            set({

              store: data.data,

              loading: false,

              lastFetched:
                Date.now(),

            });

            toast.success(
              data.message ||
              "Store status updated"
            );

            return data.data;

          } catch (err) {

            set({

              error: err.message,

              loading: false,

            });

            toast.error(
              err.message
            );

            return null;
          }
        },


        // ─────────────────────────────────
        // Clear Cache
        // ─────────────────────────────────

        clearStoreCache: () => {

          set({

            store: null,

            lastFetched: null,

          });

        },

      }),

      {
        name: "vk-store-cache",

        storage: createJSONStorage(
          () => localStorage
        ),

        partialize: (state) => ({

          store: state.store,

          lastFetched:
            state.lastFetched,

        }),
      }

    )

  )

);

export default useStoreStore;
// export { useStoreStore };