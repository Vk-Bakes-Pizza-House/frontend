import { create } from "zustand";
import { toast } from "sonner";
import { apiRequest } from "../lib/apiRequest";
import { endpoints } from "../utils/endpoints";

const unwrapResponse = (response) => response?.data ?? response;

// NOTE: if your createCrudActions helper fits, swap these actions for it.
export const useClientStore = create((set, get) => ({
  clients: [],
  loading: false,

  fetchClients: async () => {
    set({ loading: true });
    try {
      const response = await apiRequest("get", endpoints.clients.getAll);
      const data = unwrapResponse(response);
      const clients = data?.clients ?? data;
      if (!Array.isArray(clients)) {
        throw new Error("Unexpected clients response");
      }
      set({ clients });
    } catch (e) {
      toast.error(e.message || "Clients load nahi hue");
    } finally {
      set({ loading: false });
    }
  },

  addClient: async (payload) => {
    try {
      const response = await apiRequest("post", endpoints.clients.create, payload);
      const data = unwrapResponse(response);
      set({ clients: [data.client ?? data, ...get().clients] });
      toast.success("Client added");
      return true;
    } catch (e) {
      toast.error(e.message || "Client add nahi hua");
      return false;
    }
  },

  updateClient: async (id, payload) => {
    try {
      const response = await apiRequest("put", endpoints.clients.update(id), payload);
      const data = unwrapResponse(response);
      const updated = data.client ?? data;
      set({ clients: get().clients.map((c) => (c._id === id ? updated : c)) });
      toast.success("Client updated");
      return true;
    } catch (e) {
      toast.error(e.message || "Update fail ho gaya");
      return false;
    }
  },

  deleteClient: async (id) => {
    try {
      await apiRequest("delete", endpoints.clients.delete(id));
      set({ clients: get().clients.filter((c) => c._id !== id) });
      toast.success("Client removed");
    } catch (e) {
      toast.error("Delete fail ho gaya");
    }
  },
}));