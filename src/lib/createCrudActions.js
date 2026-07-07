import { toast } from "sonner";
import { apiRequest } from "./apiRequest";

const normalizeListData = (data, stateKey) => {
  const payload = data?.data ?? data;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.[stateKey])) return payload[stateKey];
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.expenses)) return payload.expenses;
  if (Array.isArray(payload?.categories)) return payload.categories;

  return [];
};

const normalizeSingleData = (data) => data?.data ?? data;

export const createCrudActions = (set, endpoint, stateKey) => ({
  fetchAll: async () => {
    set({ loading: true });

    try {
      const data = await apiRequest("get", endpoint);
      set({
        [stateKey]: normalizeListData(data, stateKey),
        loading: false,
      });
    } catch (err) {
      toast.error(err.message);
      set({ loading: false });
    }
  },

  create: async (payload) => {
    set({ submitting: true });
    try {
      const data = await apiRequest("post", endpoint, payload);
      const createdItem = normalizeSingleData(data);
      set((state) => ({
        [stateKey]: [createdItem, ...(Array.isArray(state[stateKey]) ? state[stateKey] : [])],
        submitting: false,
      }));
      toast.success("Created");
      return createdItem;
    } catch (err) {
      toast.error(err.message);
      set({ submitting: false });
      throw err;
    }
  },

  update: async (id, payload) => {
    set({ submitting: true });
    try {
      const data = await apiRequest("put", `${endpoint}/${id}`, payload);
      const updatedItem = normalizeSingleData(data);
      set((state) => ({
        [stateKey]: (Array.isArray(state[stateKey]) ? state[stateKey] : []).map((item) =>
          item?._id === id ? { ...item, ...updatedItem } : item
        ),
        submitting: false,
      }));
      toast.success("Updated");
      return updatedItem;
    } catch (err) {
      toast.error(err.message);
      set({ submitting: false });
      throw err;
    }
  },

  delete: async (id) => {
    set({ submitting: true });
    try {
      await apiRequest("delete", `${endpoint}/${id}`);
      set((state) => ({
        [stateKey]: (Array.isArray(state[stateKey]) ? state[stateKey] : []).filter((item) => item?._id !== id),
        submitting: false,
      }));
      toast.success("Deleted");
    } catch (err) {
      toast.error(err.message);
      set({ submitting: false });
      throw err;
    }
  },
});