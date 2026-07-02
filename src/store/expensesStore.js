import { create } from "zustand";
import { createCrudActions } from "../lib/createCrudActions"; // adjust path to match your project
import {apiRequest} from "../lib/apiRequest"; // adjust path to match your project

/**
 * Assumes createCrudActions("/expenses", "expenses") exposes:
 *   fetchExpenses(query?)   -> GET /expenses
 *   createExpense(payload)  -> POST /expenses
 *   updateExpense(id, data) -> PUT /expenses/:id
 *   deleteExpense(id)       -> DELETE /expenses/:id
 * Rename below if your generator uses different verbs.
 */
export const useExpenseStore = create((set, get) => ({
  // ---- Expenses -----------------------------------------------------
  expenses: [],
  loading: false,
  error: null,
 
  ...createCrudActions(set, "/expenses", "expenses"),
 
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
 
  // ---- Expense Categories --------------------------------------------
  categories: [],
 
  ...createCrudActions(set, "/expenses/categories", "categories"),
 
  getActiveCategories: () => get().categories.filter((c) => c.isActive),
 
  // Deactivate rather than hard-delete (handled server-side by the
  // DELETE /expense-categories/:id route), so past expenses that
  // reference a category by name aren't orphaned.
  deactivateCategory: async (id) => {
    return get().deleteCategory(id);
  },
}));
