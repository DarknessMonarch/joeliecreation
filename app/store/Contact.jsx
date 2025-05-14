import { create } from "zustand";
import { persist } from "zustand/middleware";

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
          
          // Validate required fields
          const { name, email, subject, message } = formData;
          if (!name || !email || !subject || !message) {
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

      fetchContactInfo: async () => {
        try {
          set({ loading: true, error: null });
          
          const response = await fetch(`${SERVER_API}/contact/info`);
          
          if (response.status === 404) {
            set({ contactInfo: null });
            throw new Error('Contact information not found');
          }
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success && data.data) {
            set({ contactInfo: data.data });
            return { success: true, data: data.data };
          } else {
            set({ contactInfo: null });
            throw new Error(data.error || 'Invalid data format received from server');
          }
        } catch (error) {
          set({ error: error.message, contactInfo: null });
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
      getStorage: () => localStorage,
    }
  )
);