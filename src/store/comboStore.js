// src/store/useComboStore.js
// ─────────────────────────────────────────────────────────────
// Combo deals store — public browsing + admin CRUD.
//
// Public state:
//   combos        → available combos (filtered by activeType)
//   activeType    → current category filter
//
// Admin state:
//   adminCombos   → all combos incl. inactive
//
// Shared:
//   loading, saveLoading, error
// ─────────────────────────────────────────────────────────────
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "./api";

const useComboStore = create(
  devtools(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────
      combos:      [],
      adminCombos: [],
      activeType:  "all",
      loading:     false,
      saveLoading: false,
      error:       null,

      // ── Helpers ─────────────────────────────────────────────
      clearError:  () => set({ error: null }),
setType:     async (t) => { 
  set({ activeType: t }); 
  const result = await get().fetchCombos(t);
  if (!result.success) {
    set({ activeType: get().activeType }); // revert on failure
  }
},
      filteredCombos: () => {
        const { combos, activeType } = get();
        return activeType === "all" ? combos : combos.filter(c => c.comboType === activeType);
      },

      // ─────────────────────────────────────────────────────────
      // PUBLIC
      // ─────────────────────────────────────────────────────────

      // GET /api/combos?type=
      fetchCombos: async (type = null) => {
        set({ loading: true, error: null });
        try {
          const params = type && type !== "all" ? { type } : {};
          const { data } = await api.get("/combos", { params });
          set({ combos: data.data, loading: false });
          return { success: true };
        } catch (err) {
          set({ error: err.message, loading: false });
          return { success: false };
        }
      },

      // ─────────────────────────────────────────────────────────
      // ADMIN
      // ─────────────────────────────────────────────────────────

      // GET /api/combos/admin/all
      fetchAdminCombos: async () => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.get("/combos/admin/all");
          set({ adminCombos: data.data, loading: false });
          return { success: true };
        } catch (err) {
          set({ error: err.message, loading: false });
          return { success: false };
        }
      },

      // POST /api/combos
      createCombo: async (payload) => {
        set({ saveLoading: true, error: null });
        try {
          const { data } = await api.post("/combos", payload);
          set(s => ({ adminCombos: [data.data, ...s.adminCombos], saveLoading: false }));
          return { success: true, data: data.data };
        } catch (err) {
          set({ error: err.message, saveLoading: false });
          return { success: false, message: err.message };
        }
      },

      // PUT /api/combos/:id
      updateCombo: async (id, payload) => {
        set({ saveLoading: true, error: null });
        try {
          const { data } = await api.put(`/combos/${id}`, payload);
          set(s => ({
            adminCombos: s.adminCombos.map(c => c._id === id ? data.data : c),
            saveLoading: false,
          }));
          return { success: true, data: data.data };
        } catch (err) {
          set({ error: err.message, saveLoading: false });
          return { success: false, message: err.message };
        }
      },

      // PATCH /api/combos/:id/toggle  (optimistic)
      toggleCombo: async (id) => {
        set(s => ({
          adminCombos: s.adminCombos.map(c => c._id === id ? { ...c, available: !c.available } : c),
        }));
        try {
          const { data } = await api.patch(`/combos/${id}/toggle`);
          set(s => ({ adminCombos: s.adminCombos.map(c => c._id === id ? data.data : c) }));
          return { success: true };
        } catch (err) {
 const recovery = await get().fetchAdminCombos();
  if (!recovery.success) {
    // Ultimate fallback: force a full page refresh or show critical error
    console.error('Failed to recover from toggle error:', err);
  }          set({ error: err.message });
          return { success: false };
        }
      },

      // DELETE /api/combos/:id
      deleteCombo: async (id) => {
        set({ loading: true, error: null });
        try {
          await api.delete(`/combos/${id}`);
          set(s => ({ adminCombos: s.adminCombos.filter(c => c._id !== id), loading: false }));
          return { success: true };
        } catch (err) {
          set({ error: err.message, loading: false });
          return { success: false };
        }
      },
    }),
    { name: "ComboStore" }
  )
);

export default useComboStore;