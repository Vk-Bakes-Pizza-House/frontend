import { create } from "zustand";
import {
  devtools,
  persist,
  createJSONStorage,
} from "zustand/middleware";

import api from "./api";
import { endpoints } from "../utils/endpoints";


// ─────────────────────────────────────────────
// Cache Time
// 10 Minutes
// ─────────────────────────────────────────────

const CACHE_TIME =
  1000 * 60 * 10;


// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────

const useReviewStore = create(

  devtools(

    persist(

      (set, get) => ({

        // ── State ───────────────────────

        reviews: [],

        allReviews: [],

        pendingCount: 0,

        loading: false,

        submitLoading: false,

        error: null,

        submitSuccess: false,

        lastFetched: null,


        // ─────────────────────────────────
        // Helpers
        // ─────────────────────────────────

        clearError: () =>
          set({ error: null }),

        resetSubmitSuccess: () =>
          set({ submitSuccess: false }),


        // ─────────────────────────────────
        // Average Rating
        // ─────────────────────────────────

        averageRating: () => {

          const { reviews } = get();

          if (!reviews.length)
            return 0;

          return (
            reviews.reduce(
              (s, r) =>
                s + r.rating,
              0
            ) / reviews.length
          ).toFixed(1);

        },


        // ─────────────────────────────────
        // Fetch Approved Reviews
        // ─────────────────────────────────

        fetchApprovedReviews: async (
          forceRefresh = false
        ) => {

          const {
            reviews,
            lastFetched,
          } = get();

          const now = Date.now();

          // ── Check Cache ───────────────

          const isCacheValid =
            reviews.length > 0 &&
            lastFetched &&
            now - lastFetched <
              CACHE_TIME;

          // Return Cached Reviews
          if (
            isCacheValid &&
            !forceRefresh
          ) {

            console.log(
              "Using cached reviews"
            );

            return {
              success: true,
              cached: true,
            };
          }

          // ── Loading ──────────────────

          if (!reviews.length) {
            set({ loading: true });
          }

          set({ error: null });

          try {

            const { data } =
              await api.get(
                endpoints.reviews
                  .getApproved
              );

            set({

              reviews: data.data,

              loading: false,

              lastFetched:
                Date.now(),

            });

            return {
              success: true,
            };

          } catch (err) {

            set({

              error: err.message,

              loading: false,

            });

            // Keep Old Cached Data
            return {
              success: false,
            };
          }
        },


        // ─────────────────────────────────
        // Submit Review
        // ─────────────────────────────────

        submitReview: async (
          payload
        ) => {

          set({

            submitLoading: true,

            error: null,

            submitSuccess: false,

          });

          try {

            await api.post(
              endpoints.reviews.submit,
              payload
            );

            set({

              submitLoading: false,

              submitSuccess: true,

            });

            // Refresh Cache
            get().fetchApprovedReviews(
              true
            );

            return {
              success: true,
            };

          } catch (err) {

            set({

              error: err.message,

              submitLoading: false,

            });

            return {

              success: false,

              message: err.message,

            };
          }
        },


        // ─────────────────────────────────
        // Fetch All Reviews (Admin)
        // ─────────────────────────────────

        fetchAllReviews: async (
          status = "all"
        ) => {

          set({

            loading: true,

            error: null,

          });

          try {

            const params =
              status !== "all"
                ? { status }
                : {};

            const { data } =
              await api.get(
                endpoints.reviews.getAll,
                { params }
              );

            const pending =
              data.data.filter(
                (r) =>
                  r.status ===
                  "pending"
              ).length;

            set({

              allReviews:
                data.data,

              pendingCount:
                pending,

              loading: false,

            });

            return {
              success: true,
            };

          } catch (err) {

            set({

              error: err.message,

              loading: false,

            });

            return {
              success: false,
            };
          }
        },


        // ─────────────────────────────────
        // Update Review Status
        // ─────────────────────────────────

        _updateReviewStatus: async (
          id,
          status
        ) => {

          set((s) => ({

            allReviews:
              s.allReviews.map((r) =>
                r._id === id
                  ? {
                      ...r,
                      status,
                    }
                  : r
              ),

            pendingCount:
              s.allReviews.filter(
                (r) =>
                  r._id !== id &&
                  r.status ===
                    "pending"
              ).length,

          }));

          try {

            const { data } =
              await api.patch(
                endpoints.reviews.updateStatus(
                  id
                ),
                { status }
              );

            set((s) => ({

              allReviews:
                s.allReviews.map((r) =>
                  r._id === id
                    ? data.data
                    : r
                ),

            }));

            // Refresh Public Cache
            get().fetchApprovedReviews(
              true
            );

            return {
              success: true,
            };

          } catch (err) {

            await get().fetchAllReviews();

            set({
              error: err.message,
            });

            return {

              success: false,

              message:
                err.message,

            };
          }
        },


        approveReview: (id) =>
          get()._updateReviewStatus(
            id,
            "approved"
          ),

        rejectReview: (id) =>
          get()._updateReviewStatus(
            id,
            "rejected"
          ),


        // ─────────────────────────────────
        // Delete Review
        // ─────────────────────────────────

        deleteReview: async (
          id
        ) => {

          set({

            loading: true,

            error: null,

          });

          try {

            await api.delete(
              endpoints.reviews.delete(
                id
              )
            );

            set((s) => ({

              allReviews:
                s.allReviews.filter(
                  (r) =>
                    r._id !== id
                ),

              pendingCount:
                s.allReviews.filter(
                  (r) =>
                    r._id !== id &&
                    r.status ===
                      "pending"
                ).length,

              loading: false,

            }));

            // Refresh Public Cache
            get().fetchApprovedReviews(
              true
            );

            return {
              success: true,
            };

          } catch (err) {

            set({

              error: err.message,

              loading: false,

            });

            return {

              success: false,

              message:
                err.message,

            };
          }
        },


        // ─────────────────────────────────
        // Clear Cache
        // ─────────────────────────────────

        clearReviewCache: () => {

          set({

            reviews: [],

            lastFetched: null,

          });

        },

      }),

      {
        name:
          "bakery-reviews-storage",

        storage:
          createJSONStorage(
            () => localStorage
          ),

        partialize: (state) => ({

          reviews:
            state.reviews,

          lastFetched:
            state.lastFetched,

        }),
      }

    )

  )

);

export default useReviewStore;