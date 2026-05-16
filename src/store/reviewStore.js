// src/store/useReviewStore.js
// ─────────────────────────────────────────────────────────────
// Reviews store — public submission + admin moderation.
//
// State:
//   reviews        → approved reviews shown on website
//   allReviews     → all reviews (admin panel — pending/approved/rejected)
//   pendingCount   → badge count for admin nav
//   loading        → API in-flight
//   submitLoading  → separate flag for form submission
//   error          → last error | null
//   submitSuccess  → true after successful review submission
//
// Actions (public):
//   fetchApprovedReviews()            → GET  /api/reviews
//   submitReview(payload)             → POST /api/reviews
//
// Actions (admin):
//   fetchAllReviews(status?)          → GET  /api/reviews/all
//   approveReview(id)                 → PATCH /api/reviews/:id  { status:"approved" }
//   rejectReview(id)                  → PATCH /api/reviews/:id  { status:"rejected" }
//   deleteReview(id)                  → DELETE /api/reviews/:id
// ─────────────────────────────────────────────────────────────
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "./api";
import { endpoints } from "../utils/endpoints";

const useReviewStore = create(
  devtools(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────
      reviews:       [],    // approved only (public website)
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
        set({ loading: true, error: null });
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
      // payload: { name, phone?, rating, text, itemOrdered? }
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
      // ?status=pending | approved | rejected | (all)
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
      // Internal helper — called by approveReview / rejectReview
      _updateReviewStatus: async (id, status) => {
        // Optimistic update in allReviews list
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
          // Revert on failure
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
    { name: "ReviewStore" }
  )
);

export default useReviewStore;