import { create } from "zustand";
import { endpoints } from "../utils/endpoints"; 
import { createCrudActions } from "../lib/createCrudActions";
import { apiRequest } from "../lib/apiRequest";
import { toast } from "sonner";

const useSalesStore = create((set) => ({
  sales: [],
  overview: null,
  dailySales: [],
  monthlySales: [],
  paymentReport: [],
  topProducts: [],
  loading: false,
  error: null,

  ...createCrudActions(set, endpoints.sales.getAll, "sales"),

  getOverview: async () => {
    set({ loading: true });
    try {
      const data = await apiRequest("get", endpoints.sales.overview);
      set({ overview: data.data, loading: false });
      return data.data;
    } catch (err) {
      toast.error(err.message || "Failed to fetch overview");
      set({ loading: false, error: err.message });
      return null;
    }
  },

  getDailySales: async (date = "") => {
    set({ loading: true });
    try {
      const data = await apiRequest("get", endpoints.sales.daily, null, { params: { date } });
      set({ dailySales: data.data, loading: false });
      return data.data;
    } catch (err) {
      toast.error(err.message || "Failed to fetch daily sales");
      set({ loading: false, error: err.message });
      return [];
    }
  },

  getMonthlySales: async (year = new Date().getFullYear()) => {
    set({ loading: true });
    try {
      const data = await apiRequest("get", endpoints.sales.monthly, null, { params: { year } });
      set({ monthlySales: data.data, loading: false });
      return data.data;
    } catch (err) {
      toast.error(err.message || "Failed to fetch monthly sales");
      set({ loading: false, error: err.message });
      return [];
    }
  },

  getPaymentReport: async () => {
    set({ loading: true });
    try {
      const data = await apiRequest("get", endpoints.sales.payments);
      set({ paymentReport: data.data, loading: false });
      return data.data;
    } catch (err) {
      toast.error(err.message || "Failed to fetch payment report");
      set({ loading: false, error: err.message });
      return [];
    }
  },

  getTopSellingProducts: async (limit = 10) => {
    set({ loading: true });
    try {
      const data = await apiRequest("get", endpoints.sales.topProducts, null, { params: { limit } });
      set({ topProducts: data.data, loading: false });
      return data.data;
    } catch (err) {
      toast.error(err.message || "Failed to fetch top products");
      set({ loading: false, error: err.message });
      return [];
    }
  },
}));

export default useSalesStore;