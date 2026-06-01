// src/store/useOrderStore.js
// ─────────────────────────────────────────────────────────────
// Admin order management store — matched to Order.js schema.
//
// Order model fields used here:
//   orderId, customer{name,phone,address}, items[], orderType,
//   subtotal, deliveryCharge, total, paymentMethod,
//   status, statusHistory[], note, cakeDetails{}
//
// Actions:
//   fetchOrders(filters?)         → GET    /api/orders
//   fetchStats()                  → GET    /api/orders/stats
//   fetchOrderById(id)            → GET    /api/orders/:id
//   createOrder(payload)          → POST   /api/orders
//   updateStatus(id,status,note)  → PATCH  /api/orders/:id/status
//   deleteOrder(id)               → DELETE /api/orders/:id
//   setFilter(key, value)         → local filter + auto-refetch
//   goToPage(page)                → pagination helper
// ─────────────────────────────────────────────────────────────
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import api from "./api";
import { endpoints } from "../utils/endpoints";

// ── Status flow allowed by the model ─────────────────────────
export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Delivered",
  "Cancelled",
];

// ── Status badge style map (for UI) ──────────────────────────
export const STATUS_STYLES = {
  Pending:   { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-400" },
  Confirmed: { bg: "bg-blue-100",   text: "text-blue-800",   dot: "bg-blue-400"   },
  Preparing: { bg: "bg-orange-100", text: "text-orange-800", dot: "bg-orange-400" },
  Delivered: { bg: "bg-green-100",  text: "text-green-800",  dot: "bg-green-400"  },
  Cancelled: { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-400"    },
};

// ─────────────────────────────────────────────────────────────

const useOrderStore = create(
  devtools(
    (set, get) => ({
      // ── State ─────────────────────────────────────────────
      orders:     [],
      stats:      null,       // { total, pending, delivered, cancelled, revenue, todayOrders, todayRevenue }
      pagination: { page: 1, pages: 1, total: 0, limit: 20 },
      filters:    { status: "all", q: "", orderType: "all" },
      loading:    false,
      error:      null,

      // ── Helpers ───────────────────────────────────────────
      clearError: () => set({ error: null }),

      setFilter: (key, value) => {
        set((s) => ({
          filters:    { ...s.filters, [key]: value },
          pagination: { ...s.pagination, page: 1 },   // reset to page 1 on filter change
        }));
        get().fetchOrders();
      },

      goToPage: (page) => get().fetchOrders({ page }),

      // ── GET /api/orders ───────────────────────────────────
      // Query params mapped to Order model:
      //   status    → order.status  (Pending|Confirmed|…)
      //   orderType → order.orderType (delivery|pickup)
      //   q         → search customer.name / customer.phone / orderId
      //   page, limit → pagination
      fetchOrders: async (overrides = {}) => {
        set({ loading: true, error: null });
        const { filters, pagination } = get();

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
      // Returns: { total, pending, delivered, cancelled, revenue, todayOrders, todayRevenue }
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

      // ── GET /api/orders/:id ───────────────────────────────
      fetchOrderById: async (id) => {
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
      // Payload must match Order.js schema exactly:
      // {
      //   customer:       { name, phone, address }
      //   items:          [{ name, price, qty, menuItem? }]
      //   orderType:      "delivery" | "pickup"
      //   subtotal:       Number
      //   deliveryCharge: Number
      //   total:          Number
      //   paymentMethod:  "Cash on Delivery"  (default)
      //   note:           String (optional)
      //   cakeDetails:    { size, flavour, message, design, deliveryDate } (optional)
      // }
      createOrder: async (payload) => {
        set({ loading: true, error: null });
        const toastId = toast.loading("Placing order…");
        try {
          const { data } = await api.post(endpoints.orders.create, payload);
          // Prepend new order to top of list
          set((s) => ({
            orders:  [data.data, ...s.orders],
            loading: false,
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
      // Body: { status: "Confirmed"|"Preparing"|"Delivered"|"Cancelled", note? }
      // Optimistic update → revert on error
      updateStatus: async (id, status, note = "") => {
        const prev = get().orders.find((o) => o._id === id);

        // Optimistic update
        set((s) => ({
          orders: s.orders.map((o) =>
            o._id === id
              ? { ...o, status, statusHistory: [...(o.statusHistory || []), { status, note, changedAt: new Date() }] }
              : o
          ),
        }));

        try {
          const { data } = await api.patch(endpoints.orders.updateStatus(id), { status, note });
          // Sync with real server response
          set((s) => ({
            orders: s.orders.map((o) => (o._id === id ? data.data : o)),
          }));
          toast.success(`Order marked as ${status}`);
          return { success: true, data: data.data };
        } catch (err) {
          // Revert optimistic update
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
          set((s) => ({
            orders: [],
            loading: false,
          }));
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