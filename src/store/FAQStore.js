import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import api  from "../services/api";
import { endpoints } from "../utils/endpoints";

  const useFQAStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ── State ─────────────────────────────────────────────
        FAQS: [],
        loading: false,
        error: null,

        // ── Actions ───────────────────────────────────────────
        
        // 1. Fetch all FAQs (Home Page aur Manage Page par call karein)
        fetchFaqs: async () => {
          set({ loading: true, error: null });
          try {
            // Endpoints object se query link check karein (e.g., endpoints.FAQ.getAll)
            const response = await api.get(endpoints.FAQ.getAll);
            set({ FAQS: response.data, loading: false });
          } catch (err) {
            set({ 
              error: err.response?.data?.message || "FAQs load nahi ho paye.", 
              loading: false 
            });
          }
        },

        // 2. Add New FAQ (Manage form ke onSubmit par call karein)
        addFaq: async (faqData) => {
          set({ loading: true, error: null });
          try {
            const response = await api.post(endpoints.FAQ.create, faqData);
            // Naya FAQ direct state mein front par push karein
            set((state) => ({
              FAQS: [response.data, ...state.FAQS],
              loading: false
            }));
            return { success: true };
          } catch (err) {
            set({ 
              error: err.response?.data?.message || "FAQ add nahi ho paya.", 
              loading: false 
            });
            return { success: false, message: get().error };
          }
        },
        editFaq: async (faqData) => {
          set({ loading: true, error: null });
          try {
            const response = await api.put(`${endpoints.FAQ.update(faqData._id)}`, faqData);
            set((state) => ({
              FAQS: state.FAQS.map((faq) =>
                faq._id === faqData._id ? response.data : faq
              ),
              loading: false
            }));
            return { success: true };
          } catch (err) {
            set({ 
              error: err.response?.data?.message || "FAQ edit nahi ho paya.", 
              loading: false 
            });
            return { success: false, message: get().error };
          }
        },
        // 3. Delete FAQ (Trash icon ke onClick par _id pass karein)
        deleteFaq: async (id) => {
          set({ loading: true, error: null });
          try {
            await api.delete(endpoints.FAQ.delete(id));
            // Filter karke list se instantly remove karein
            set((state) => ({
              FAQS: state.FAQS.filter((faq) => faq._id !== id),
              loading: false
            }));
            return { success: true };
          } catch (err) {
            set({ 
              error: err.response?.data?.message || "FAQ delete nahi ho paya.", 
              loading: false 
            });
            return { success: false, message: get().error };
          }
        },

        // 4. Toggle FAQ visibility state locally
        toggleFaq: (id) => {
          set((state) => ({
            FAQS: state.FAQS.map((faq) =>
              faq._id === id ? { ...faq, active: !faq.active } : faq
            ),
          }));
          return { success: true };
        }

      }),
      {
        name: "faq-storage", // local storage identifier name
        partialize: (state) => ({ FAQS: state.FAQS }), // Sirf FAQS data persist karein, loading/error nahi
      }
    )
  )
);
export default useFQAStore