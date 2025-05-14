import { create } from "zustand";
import { persist } from "zustand/middleware";

const SERVER_API = process.env.NEXT_PUBLIC_SERVER_API;

export const usePortfolioStore = create(
  persist(
    (set, get) => ({
      portfolioItems: [],
      currentItem: null,
      loading: false,
      error: null,
      success: false,

      fetchPortfolioItems: async () => {
        try {
          set({ loading: true, error: null });

          const response = await fetch(`${SERVER_API}/portfolio`);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.success && data.data) {
            set({ portfolioItems: data.data });
            return { success: true, data: data.data };
          } else {
            set({ portfolioItems: [] });
            throw new Error(data.error || 'Invalid data format received from server');
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      fetchPortfolioItem: async (id) => {
        try {
          set({ loading: true, error: null, currentItem: null });

          const response = await fetch(`${SERVER_API}/portfolio/${id}`);

          if (response.status === 404) {
            set({ currentItem: null });
            throw new Error(`Portfolio item with ID "${id}" not found`);
          }

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.success && data.data) {
            set({ currentItem: data.data });
            return { success: true, data: data.data };
          } else {
            set({ currentItem: null });
            throw new Error(data.error || 'Invalid data format received from server');
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      
      resetSuccess: () => {
        set({ success: false });
      },

      clearPortfolioState: () => {
        set({
          currentItem: null,
          loading: false,
          error: null,
          success: false
        });
      }
    }),
    {
      name: "portfolio-store",
      getStorage: () => localStorage,
    }
  )
);