import { create } from "zustand";
import { createCrudActions } from "../lib/createCrudActions"; 
import { apiRequest } from "../lib/apiRequest"; 
// Assumes createCrudActions(set, get, { endpoint }) returns:
//   { items, loading, error, fetchAll, create, update, remove }
// If your actual helper's signature differs, only this block needs to change —
// everything below (selectors, filters) stays the same.
const useProductStore = create((set, get) => ({
  ...createCrudActions(set, get, { endpoint: "/api/products" }),

  // Local UI state for the Products page
  typeFilter: "All",
  searchTerm: "",

  setTypeFilter: (type) => set({ typeFilter: type }),
  setSearchTerm: (term) => set({ searchTerm: term }),

  // Derived list respecting the current filter + search — components read this,
  // not `items` directly, so filter logic lives in one place.
  getFilteredProducts: () => {
    const { items, typeFilter, searchTerm } = get();
    return (items || []).filter((p) => {
      const matchesType = typeFilter === "All" || p.type === typeFilter;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  },

  getLowStockProducts: () => {
    const { items } = get();
    return (items || []).filter((p) => p.currentStock <= p.reorderLevel);
  },

  // For the Stock and Purchases pages later — quick lookup without a re-fetch.
  getProductById: (id) => {
    const { items } = get();
    return (items || []).find((p) => p._id === id);
  },
}));

export default useProductStore;