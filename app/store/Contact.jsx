import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const SERVER_API = process.env.NEXT_PUBLIC_SERVER_API;

export const useContactStore = create(
  persist(
    (set, get) => ({
      contactInfo: null,
      loading: false,
      error: null,
      submitSuccess: false,

      submitContactForm: async (formData) => {
        try {
          set({ loading: true, error: null, submitSuccess: false });
          
          const { name, email, message } = formData;
          if (!name || !email || !message) {
            throw new Error('Please provide all required fields');
          }
          
          const requestOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          };

          const response = await fetch(`${SERVER_API}/contact/submit`, requestOptions);
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to submit contact form');
          }

          if (data.success) {
            set({ submitSuccess: true });
            return { success: true, data: data.data };
          }
          
          throw new Error(data.error || 'Failed to submit contact form');
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      resetSubmitStatus: () => {
        set({ submitSuccess: false });
      },

      clearContactState: () => {
        set({
          contactInfo: null,
          loading: false,
          error: null,
          submitSuccess: false
        });
      }
    }),
    {
      name: "contact-store",
     storage: createJSONStorage(() => localStorage),
    }
  )
);