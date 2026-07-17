import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import api from "../services/api";
import { endpoints } from "../utils/endpoints";

export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Delivered",
  "Cancelled",
];

export const STATUS_STYLES = {
  Pending:   { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-400" },
  Confirmed: { bg: "bg-blue-100",   text: "text-blue-800",   dot: "bg-blue-400"   },
  Preparing: { bg: "bg-orange-100", text: "text-orange-800", dot: "bg-orange-400" },
  Delivered: { bg: "bg-green-100",  text: "text-green-800",  dot: "bg-green-400"  },
  Cancelled: { bg: "bg-red-100",   text: "text-red-700",    dot: "bg-red-400"    },
};

// Cache Expiration Configurations (in Milliseconds)
const CACHE_DURATION_ORDERS = 2 * 60 * 1000; // 2 Minutes
const CACHE_DURATION_STATS  = 5 * 60 * 1000; // 5 Minutes

const useOrderStore = create(
  devtools(
    (set, get) => ({
      // ── State ─────────────────────────────────────────────
      orders:     [],
      revenue:     0,
      stats:      null,
      pagination: { page: 1, pages: 1, total: 0, limit: 20 },
      filters:    { status: "all", q: "", orderType: "all" },
      loading:    false,
      error:      null,

      // ── Cache Timestamps State ────────────────────────────
      ordersLastFetched: null,
      statsLastFetched:  null,

      // ── Helpers ───────────────────────────────────────────
      clearError: () => set({ error: null }),

      // Manual Cache Invalidation Helper
      invalidateCache: () => set({ ordersLastFetched: null, statsLastFetched: null }),

      setFilter: (key, value) => {
        set((s) => ({
          filters:    { ...s.filters, [key]: value },
          pagination: { ...s.pagination, page: 1 },
          ordersLastFetched: null, // Force a network refetch when filters change
        }));
        get().fetchOrders();
      },

      goToPage: (page) => {
        set({ ordersLastFetched: null }); // Force network fetch for different pages
        return get().fetchOrders({ page });
      },

      // ── GET /api/orders ───────────────────────────────────
      fetchOrders: async (overrides = {}) => {
        const { filters, pagination, ordersLastFetched, orders } = get();
        const now = Date.now();

        // 1. Check if valid data exists in cache and no pagination/filter override is sent
        if (
          !overrides.page && 
          ordersLastFetched && 
          (now - ordersLastFetched < CACHE_DURATION_ORDERS) && 
          orders.length > 0
        ) {
          return { success: true, cached: true };
        }

        set({ loading: true, error: null });

        const params = {
          page:  overrides.page || pagination.page,
          limit: pagination.limit,
          ...(filters.status    !== "all" && { status:    filters.status    }),
          ...(filters.orderType !== "all" && { orderType: filters.orderType }),
          ...(filters.q         &&           { q:         filters.q         }),
          ...overrides,
        };

        try {
          const { data } = await api.get(endpoints.orders.getAll, { params });
          set({
            orders: data.data,
            pagination: {
              page:  data.page,
              pages: data.pages,
              total: data.total,
              limit: pagination.limit,
            },
            ordersLastFetched: Date.now(), // Save successful timestamp
            loading: false,
          });
          return { success: true };
        } catch (err) {
          const message = err?.response?.data?.message || err.message;
          set({ error: message, loading: false });
          toast.error(`Failed to load orders: ${message}`);
          return { success: false, message };
        }
      },

      // ── GET /api/orders/stats ─────────────────────────────
      fetchStats: async () => {
        const { statsLastFetched, stats } = get();
        const now = Date.now();

        // Check if stats are freshly cached
        if (statsLastFetched && (now - statsLastFetched < CACHE_DURATION_STATS) && stats) {
          return { success: true, data: stats, cached: true };
        }

        try {
          const { data } = await api.get(endpoints.orders.getStats);
          set({ 
            stats: data.data,
            statsLastFetched: Date.now() // Save stats timestamp
          });
          return { success: true, data: data.data };
        } catch (err) {
          console.warn("Stats fetch failed:", err.message);
          return { success: false };
        }
      },

      // ── GET /api/orders/:id ───────────────────────────────
      fetchOrderById: async (id) => {
        // First check inside current local orders list state array to skip network hit
        const localOrder = get().orders.find((o) => o._id === id);
        if (localOrder) {
          return { success: true, data: localOrder, cached: true };
        }

        set({ loading: true, error: null });
        try {
          const { data } = await api.get(endpoints.orders.getById(id));
          set({ loading: false });
          return { success: true, data: data.data };
        } catch (err) {
          const message = err?.response?.data?.message || err.message;
          set({ error: message, loading: false });
          return { success: false, message };
        }
      },

      // ── POST /api/orders ──────────────────────────────────
      createOrder: async (payload) => {
        set({ loading: true, error: null });
        const toastId = toast.loading("Placing order…");
        try {
          const { data } = await api.post(endpoints.orders.create, payload);
          set((s) => ({
            orders:  [data.data, ...s.orders],
            loading: false,
            // Reset stats timestamp so revenue dashboards pull fresh math updates
            statsLastFetched: null, 
          }));
          toast.success(`Order ${data.data.orderId} placed!`, { id: toastId });
          return { success: true, data: data.data };
        } catch (err) {
          const message = err?.response?.data?.message || err.message;
          set({ error: message, loading: false });
          toast.error(`Order failed: ${message}`, { id: toastId });
          return { success: false, message };
        }
      },

      // ── PATCH /api/orders/:id/status ──────────────────────
      updateStatus: async (id, status, note = "") => {
        const prev = get().orders.find((o) => o._id === id);

        // Optimistic update handles UI transition instantly
        set((s) => ({
          orders: s.orders.map((o) =>
            o._id === id
              ? { ...o, status, statusHistory: [...(o.statusHistory || []), { status, note, changedAt: new Date() }] }
              : o
          ),
        }));

        try {
          const { data } = await api.patch(endpoints.orders.updateStatus(id), { status, note });
          set((s) => ({
            orders: s.orders.map((o) => (o._id === id ? data.data : o)),
            statsLastFetched: null, // Reset dashboard aggregate stats metric values
          }));
          toast.success(`Order marked as ${status}`);
          return { success: true, data: data.data };
        } catch (err) {
          if (prev) {
            set((s) => ({
              orders: s.orders.map((o) => (o._id === id ? prev : o)),
            }));
          }
          const message = err?.response?.data?.message || err.message;
          set({ error: message });
          toast.error(`Status update failed: ${message}`);
          return { success: false, message };
        }
      },

      // ── DELETE /api/orders/:id ────────────────────────────
      deleteOrder: async (id) => {
        set({ loading: true, error: null });
        const toastId = toast.loading("Deleting order…");
        try {
          await api.delete(endpoints.orders.delete(id));
          set((s) => ({
            orders:  s.orders.filter((o) => o._id !== id),
            loading: false,
            statsLastFetched: null, // Clear stats metrics out
          }));
          toast.success("Order deleted", { id: toastId });
          return { success: true };
        } catch (err) {
          const message = err?.response?.data?.message || err.message;
          set({ error: message, loading: false });
          toast.error(`Delete failed: ${message}`, { id: toastId });
          return { success: false, message };
        }
      },

      clearOrderHistory: async () => {
        set({ loading: true, error: null });
        const toastId = toast.loading("Deleting all orders…");
        try {
          await api.delete(endpoints.orders.deleteAll);
          set({
            orders: [],
            stats: null,
            ordersLastFetched: null,
            statsLastFetched: null,
            loading: false,
          });
          toast.success("All orders deleted", { id: toastId });
          return { success: true };
        } catch (err) {
          const message = err?.response?.data?.message || err.message;
          set({ error: message, loading: false });
          toast.error(`Delete failed: ${message}`, { id: toastId });
          return { success: false, message };
        }
      },
    }),
    { name: "OrderStore" }
  )
);

export default useOrderStore;