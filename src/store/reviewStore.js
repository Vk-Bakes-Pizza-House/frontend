// src/store/useReviewStore.js
// ─────────────────────────────────────────────────────────────
// Reviews store — public submission + admin moderation.
// ─────────────────────────────────────────────────────────────
import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import api from "./api";
import { endpoints } from "../utils/endpoints";

const useReviewStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ── State ───────────────────────────────────────────────
        reviews:       [],    // approved only (public website) - CACHED
        allReviews:    [],    // all statuses (admin panel)
        pendingCount:  0,
        loading:       false,
        submitLoading: false,
        error:         null,
        submitSuccess: false,

        // ── Helpers ─────────────────────────────────────────────
        clearError:         () => set({ error: null }),
        resetSubmitSuccess: () => set({ submitSuccess: false }),

        // Derived
        averageRating: () => {
          const { reviews } = get();
          if (!reviews.length) return 0;
          return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
        },

        // ── GET /api/reviews  (public) ───────────────────────────
        fetchApprovedReviews: async () => {
          const hasCachedReviews = get().reviews.length > 0;
          
          // Only flag loading if the user has no cached reviews on screen yet
          if (!hasCachedReviews) set({ loading: true });
          set({ error: null });
          
          try {
            const { data } = await api.get(endpoints.reviews.getApproved);
            set({ reviews: data.data, loading: false });
            return { success: true };
          } catch (err) {
            set({ error: err.message, loading: false });
            return { success: false };
          }
        },

        // ── POST /api/reviews  (public) ──────────────────────────
        submitReview: async (payload) => {
          set({ submitLoading: true, error: null, submitSuccess: false });
          try {
            await api.post(endpoints.reviews.submit, payload);
            set({ submitLoading: false, submitSuccess: true });
            return { success: true };
          } catch (err) {
            set({ error: err.message, submitLoading: false });
            return { success: false, message: err.message };
          }
        },

        // ── GET /api/reviews/all  (admin) ────────────────────────
        fetchAllReviews: async (status = "all") => {
          set({ loading: true, error: null });
          try {
            const params = status !== "all" ? { status } : {};
            const { data } = await api.get(endpoints.reviews.getAll, { params });

            const pending = data.data.filter((r) => r.status === "pending").length;
            set({ allReviews: data.data, pendingCount: pending, loading: false });
            return { success: true };
          } catch (err) {
            set({ error: err.message, loading: false });
            return { success: false };
          }
        },

        // ── PATCH /api/reviews/:id  (admin) ──────────────────────
        _updateReviewStatus: async (id, status) => {
          set((s) => ({
            allReviews: s.allReviews.map((r) =>
              r._id === id ? { ...r, status } : r
            ),
            pendingCount: s.allReviews.filter(
              (r) => r._id !== id && r.status === "pending"
            ).length,
          }));
          try {
            const { data } = await api.patch(endpoints.reviews.updateStatus(id), { status });
            set((s) => ({
              allReviews: s.allReviews.map((r) => (r._id === id ? data.data : r)),
            }));
            return { success: true };
          } catch (err) {
            await get().fetchAllReviews();
            set({ error: err.message });
            return { success: false, message: err.message };
          }
        },

        approveReview: (id) => get()._updateReviewStatus(id, "approved"),
        rejectReview:  (id) => get()._updateReviewStatus(id, "rejected"),

        // ── DELETE /api/reviews/:id  (admin) ─────────────────────
        deleteReview: async (id) => {
          set({ loading: true, error: null });
          try {
            await api.delete(endpoints.reviews.delete(id));
            set((s) => ({
              allReviews:   s.allReviews.filter((r) => r._id !== id),
              pendingCount: s.allReviews.filter(
                (r) => r._id !== id && r.status === "pending"
              ).length,
              loading: false,
            }));
            return { success: true };
          } catch (err) {
            set({ error: err.message, loading: false });
            return { success: false, message: err.message };
          }
        },
      }),
      {
        name: "bakery-reviews-storage",
        storage: createJSONStorage(() => localStorage),
        // Whitelist only public data to avoid stale administrative or operational sync state
        partialize: (state) => ({ reviews: state.reviews }),
      }
    )
  )
);

export default useReviewStore;