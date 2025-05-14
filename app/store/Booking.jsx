import { create } from "zustand";
import { persist } from "zustand/middleware";

const SERVER_API = process.env.NEXT_PUBLIC_SERVER_API;

export const useBookingStore = create(
  persist(
    (set, get) => ({
      bookings: [],
      singleBooking: null,
      loading: false,
      error: null,
      pagination: {
        total: 0,
        totalPages: 1,
        currentPage: 1
      },

      createBooking: async (bookingData) => {
        try {
          set({ loading: true, error: null });
      
          const requestOptions = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(bookingData),
          };
      
          const response = await fetch(
            `${SERVER_API}/bookings`,
            requestOptions
          );
          const data = await response.json();
      
          if (!response.ok) {
            throw new Error(data.message || "Failed to create booking");
          }
      
          if (data.success) {
            // Make sure the bookingId is properly accessed from the response
            const bookingWithId = data.data;
            return { success: true, data: bookingWithId };
          }
      
          throw new Error(data.message || "Failed to create booking");
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      updateBooking: async (id, updateData) => {
        try { 
          set({ loading: true, error: null });

          const requestOptions = {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          };

          const response = await fetch(
            `${SERVER_API}/bookings/${id}`,
            requestOptions
          );
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to update booking");
          }

          if (data.success) {
            set((state) => ({
              bookings: state.bookings.map((booking) =>
                booking._id === id ? data.data : booking
              ),
              singleBooking:
                state.singleBooking?._id === id
                  ? data.data
                  : state.singleBooking,
            }));
            return { success: true, data: data.data };
          }

          throw new Error(data.message || "Failed to update booking");
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      clearBookingState: () => {
        set({
          bookings: [],
          singleBooking: null,
          loading: false,
          error: null,
          pagination: {
            total: 0,
            totalPages: 1,
            currentPage: 1
          },
        });
      },
    }),
    {
      name: "booking-store",
      getStorage: () => localStorage,
    }
  )
);