import { create } from "zustand";
import { persist } from "zustand/middleware";

const SERVER_API = process.env.NEXT_PUBLIC_SERVER_API;

export const useServiceStore = create(
  persist(
    (set, get) => ({
      services: [],
      currentService: null,
      availability: null,
      loading: false,
      error: null,
      success: false,

      fetchServices: async () => {
        try {
          set({ loading: true, error: null });

          const response = await fetch(`${SERVER_API}/services`);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || `HTTP error! status: ${response.status}`
            );
          }

          const data = await response.json();

          if (data.success && data.data) {
            set({ services: data.data });
            return { success: true, data: data.data };
          } else {
            set({ services: [] });
            throw new Error(
              data.error || "Invalid data format received from server"
            );
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      fetchServiceById: async (id) => {
        try {
          set({ loading: true, error: null, currentService: null });

          const response = await fetch(`${SERVER_API}/services/${id}`);

          if (response.status === 404) {
            set({ currentService: null });
            throw new Error(`Service with ID "${id}" not found`);
          }

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || `HTTP error! status: ${response.status}`
            );
          }

          const data = await response.json();

          if (data.success && data.data) {
            set({ currentService: data.data });
            return { success: true, data: data.data };
          } else {
            set({ currentService: null });
            throw new Error(
              data.error || "Invalid data format received from server"
            );
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      checkAvailability: async (serviceId, date) => {
        try {
          set({ loading: true, error: null, availability: null });
      
          const queryParams = new URLSearchParams({
            serviceId,
            date: date instanceof Date ? date.toISOString() : date,
            nocache: Date.now()
          });
      
          const response = await fetch(
            `${SERVER_API}/services/availability?${queryParams}`
          );
      
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || `HTTP error! status: ${response.status}`
            );
          }
      
          const data = await response.json();
      
          if (data.success) {
            set({ availability: data });
            return { success: true, data };
          }
      
          throw new Error(data.error || "Failed to check availability");
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

      // Clear state
      clearServiceState: () => {
        set({
          currentService: null,
          availability: null,
          loading: false,
          error: null,
          success: false,
        });
      },
    }),
    {
      name: "service-store",
      getStorage: () => localStorage,
    }
  )
);
