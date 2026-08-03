import { create } from "zustand";
import { createCrudActions } from "../lib/createCrudActions";
import { apiRequest } from "../lib/apiRequest";
import { toast } from "sonner";
import { endpoints } from "../utils/endpoints"; 


/**
 * Assumes createCrudActions(set, endpoint, stateKey) exposes, per call:
 *   fetch{StateKey}(query?)   -> GET {endpoint}
 *   create{Singular}(payload) -> POST {endpoint}
 *   update{Singular}(id, data)-> PUT {endpoint}/:id
 *   delete{Singular}(id)      -> DELETE {endpoint}/:id
 * Rename below if your generator uses different verbs.
 *
 */
export const useExpenseStore = create((set, get) => {
const expenseCrud = createCrudActions(set, endpoints.expenses.getAll, "expenses");
const categoryCrud = createCrudActions(set, endpoints.expenses.categories, "categories");
  return {
    // ---- Expenses ---------------------------------------------------
    expenses: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 25,
      totalPages: 1,
    },
    loading: false,
    error: null,

    ...expenseCrud,
    fetchExpenses: async (query = {}) => {
      set({ loading: true, error: null });
      try {
        const params = {
          limit: 25,
          ...query,
        };
        const res = await apiRequest("get", endpoints.expenses.getAll, null, { params });
        const payload = res?.data ?? res;
        const items = Array.isArray(payload?.expenses) ? payload.expenses : [];
        const pagination = payload?.pagination || {
          total: items.length,
          page: Number(params.page) || 1,
          limit: Number(params.limit) || 25,
          totalPages: 1,
        };

        set({
          expenses: items,
          pagination,
          loading: false,
        });
        return payload;
      } catch (err) {
        set({
          error: err?.response?.data?.message || "Failed to load expenses",
          loading: false,
        });
        throw err;
      }
    },
    createExpense: expenseCrud.create,
    updateExpense: expenseCrud.update,
    deleteExpense: expenseCrud.delete,

    getActiveExpenses: () => get().expenses.filter((e) => !e.isDeleted),

  // Soft delete: flip isDeleted instead of a hard DELETE, since the model
  // carries an isDeleted flag for exactly this purpose.
  softDeleteExpense: async (id) => {
    return get().updateExpense(id, { isDeleted: true });
  },

  restoreExpense: async (id) => {
    return get().updateExpense(id, { isDeleted: false });
  },

  // Optional server-side aggregation for analytics at scale. Falls back to
  // client-side aggregation in ExpenseAnalytics.jsx if you haven't wired up
  // a GET /expenses/stats endpoint yet.
  stats: null,
  statsLoading: false,
  fetchExpenseStats: async (params = {}) => {
    set({ statsLoading: true, error: null });
    try {
      const res = await apiRequest("get", "/expenses/stats", null, { params });
      set({ stats: res.data, statsLoading: false });
      return res.data;
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Failed to load expense stats",
        statsLoading: false,
      });
      throw err;
    }
  },
getExpenseAnalytics: async () => {
  set({ loading: true, error: null });
  try {
const res = await apiRequest("get", endpoints.expenses.analytics);
    const payload = res?.data ?? res;
    set({ analytics: payload, loading: false });
    return payload;
  } catch (err) {
    toast.error(err.message || "Failed to fetch analytics");
    set({ analytics: null, loading: false });
    return null;
  }
},
    // ---- Expense Categories ----------------------------------------
    categories: [],
categorySpend: {},
    ...categoryCrud,
    fetchCategories: (query = {}) => categoryCrud.fetchAll({ limit: 10000, ...query }),
    createCategory: categoryCrud.create,
    updateCategory: categoryCrud.update,
    deleteCategory: categoryCrud.delete,

    getActiveCategories: () => get().categories.filter((c) => c.isActive),

    // Deactivate rather than hard-delete (handled server-side by the
    // DELETE /expense-categories/:id route), so past expenses that
    // reference a category by name aren't orphaned.
    deactivateCategory: async (id) => {
      return get().deleteCategory(id);
    },
    getCategorySpendSummary: async () => {
      try {
const res = await apiRequest("get", endpoints.expenses.summary);
        const payload = res?.data ?? res;
        const summary = payload && typeof payload === "object" ? payload : {};

        set({ categorySpend: summary });
        return summary;
      } catch (err) {
        toast.error(err.message || "Failed to fetch category summary");
        return {};
      }
    },
  };
});