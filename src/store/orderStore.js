// src/store/useOrderStore.js
// ─────────────────────────────────────────────────────────────
// Admin order management store.
//
// State:
//   orders       → array of order objects
//   stats        → dashboard stat counts & revenue
//   pagination   → { page, pages, total, limit }
//   filters      → { status, q }
//   loading      → API in-flight
//   error        → last error message | null
//
// Actions (all admin/protected):
//   fetchOrders(filters?)       → GET  /api/orders
//   fetchStats()                → GET  /api/orders/stats
//   fetchOrderById(id)          → GET  /api/orders/:id
//   updateStatus(id, status)    → PATCH /api/orders/:id/status
//   deleteOrder(id)             → DELETE /api/orders/:id
//   setFilter(key, value)       → local filter update + re-fetch
// ─────────────────────────────────────────────────────────────
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "./api";
import { endpoints } from "../utils/endpoints";

const useOrderStore = create(
  devtools(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────
      orders:     [],
      stats:      null,
      pagination: { page: 1, pages: 1, total: 0, limit: 30 },
      filters:    { status: "all", q: "" },
      loading:    false,
      error:      null,

      // ── Helpers ─────────────────────────────────────────────
      clearError: () => set({ error: null }),

      setFilter: (key, value) => {
        set((s) => ({ filters: { ...s.filters, [key]: value } }));
        // Auto-refetch whenever filter changes
        get().fetchOrders();
      },

      // ── GET /api/orders ──────────────────────────────────────
      fetchOrders: async (overrides = {}) => {
        set({ loading: true, error: null });
        const { filters, pagination } = get();
        const params = {
          page:  overrides.page  || pagination.page,
          limit: pagination.limit,
          status: filters.status !== "all" ? filters.status : undefined,
          q:      filters.q     || undefined,
          ...overrides,
        };

        try {
          const { data } = await api.get(endpoints.orders.getAll, { params });
          set({
            orders:     data.data,
            pagination: {
              page:  data.page,
              pages: data.pages,
              total: data.total,
              limit: pagination.limit,
            },
            loading: false,
          });
          return { success: true };
        } catch (err) {
          set({ error: err.message, loading: false });
          return { success: false, message: err.message };
        }
      },

      // ── GET /api/orders/stats ────────────────────────────────
      fetchStats: async () => {
        try {
          const { data } = await api.get(endpoints.orders.getStats);
          set({ stats: data.data });
          return { success: true, data: data.data };
        } catch (err) {
          console.warn("Stats fetch failed:", err.message);
          return { success: false };
        }
      },

      // ── GET /api/orders/:id ──────────────────────────────────
      fetchOrderById: async (id) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.get(endpoints.orders.getById(id));
          set({ loading: false });
          return { success: true, data: data.data };
        } catch (err) {
          set({ error: err.message, loading: false });
          return { success: false, message: err.message };
        }
      },

      // ── PATCH /api/orders/:id/status ─────────────────────────
      updateStatus: async (id, status, note = "") => {
        // Optimistic update
        set((s) => ({
          orders: s.orders.map((o) =>
            o._id === id ? { ...o, status } : o
          ),
        }));
        try {
          const { data } = await api.patch(endpoints.orders.updateStatus(id), { status, note });
          // Sync with server response
          set((s) => ({
            orders: s.orders.map((o) => (o._id === id ? data.data : o)),
          }));
          return { success: true };
        } catch (err) {
          // Revert
          await get().fetchOrders();
          set({ error: err.message });
          return { success: false, message: err.message };
        }
      },

      // ── DELETE /api/orders/:id ───────────────────────────────
      deleteOrder: async (id) => {
        set({ loading: true, error: null });
        try {
          await api.delete(endpoints.orders.delete(id));
          set((s) => ({
            orders:  s.orders.filter((o) => o._id !== id),
            loading: false,
          }));
          return { success: true };
        } catch (err) {
          set({ error: err.message, loading: false });
          return { success: false, message: err.message };
        }
      },

      // ── Pagination helper ─────────────────────────────────────
      goToPage: (page) => get().fetchOrders({ page }),
    }),
    { name: "OrderStore" }
  )
);

export default useOrderStore;