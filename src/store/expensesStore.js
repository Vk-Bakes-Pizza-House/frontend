import { create } from "zustand";
import { createCrudActions } from "../lib/createCrudActions";
import { apiRequest } from "../lib/apiRequest";

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
  const expenseCrud = createCrudActions(set, "/expenses", "expenses");
  const categoryCrud = createCrudActions(set, "/expenses/categories", "categories");

  return {
    // ---- Expenses ---------------------------------------------------
    expenses: [],
    loading: false,
    error: null,

    ...expenseCrud,
    fetchExpenses: expenseCrud.fetchAll,
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

    // ---- Expense Categories ----------------------------------------
    categories: [],

    ...categoryCrud,
    fetchCategories: categoryCrud.fetchAll,
    createCategory: categoryCrud.create,

    getActiveCategories: () => get().categories.filter((c) => c.isActive),

    // Deactivate rather than hard-delete (handled server-side by the
    // DELETE /expense-categories/:id route), so past expenses that
    // reference a category by name aren't orphaned.
    deactivateCategory: async (id) => {
      return get().deleteCategory(id);
    },
  };
});