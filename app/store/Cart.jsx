import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      isCartOpen: false,
      token: null,
      cartData: [],

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      setToken: (newToken) => set({ token: newToken }),

      // Enhanced addToCart to handle both services and bookings
      addToCart: (service, bookingDetails = null) => {
        const { cartData } = get();
        const serviceId = service._id || service.id;
        
        // Create a unique key for items - simplified without date/time
        const itemKey = bookingDetails && bookingDetails.bookingId
          ? `${serviceId}_booking_${bookingDetails.bookingId}`
          : bookingDetails && bookingDetails.customerInfo?.name
          ? `${serviceId}_prebooking_${Date.now()}`
          : serviceId;
        
        const existingItemIndex = cartData.findIndex(item => 
          item.itemKey === itemKey
        );

        let updatedCart;
        if (existingItemIndex !== -1) {
          // If item exists, just increase quantity
          updatedCart = [...cartData];
          updatedCart[existingItemIndex].quantity += 1;
        } else {
          // Create new cart item
          const newItem = {
            _id: serviceId,
            id: serviceId,
            itemKey: itemKey, // Unique identifier for cart items
            title: service.title,
            name: service.title,
            price: parseFloat(service.price) || 0,
            image: service.image,
            quantity: 1,
            deliveryFee: service.deliveryFee || 0,
            description: service.description,
            breadcrumb: service.breadcrumb,
            duration: service.duration,
            // Booking-specific details (without date/time)
            bookingDetails: bookingDetails ? {
              customerInfo: bookingDetails.customerInfo,
              bookingId: bookingDetails.bookingId,
              isBooked: !!bookingDetails.bookingId, // true if already booked
              paymentStatus: bookingDetails.paymentStatus || 'pending'
            } : null,
            // Item type for better handling
            itemType: bookingDetails ? 'booking' : 'service'
          };
          updatedCart = [...cartData, newItem];
        }

        set({ cartData: updatedCart });
      },

      // Enhanced removeFromCart to handle itemKey
      removeFromCart: (itemKey) => {
        const { cartData } = get();
        const updatedCart = cartData.filter((item) => 
          item.itemKey !== itemKey && item._id !== itemKey && item.id !== itemKey
        );
        set({ cartData: updatedCart });
      },

      // Enhanced quantity controls to handle itemKey
      increaseQuantity: (itemKey) => {
        const { cartData } = get();
        const updatedCart = cartData.map(item =>
          (item.itemKey === itemKey || item._id === itemKey || item.id === itemKey) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
        set({ cartData: updatedCart });
      },

      decreaseQuantity: (itemKey) => {
        const { cartData } = get();
        const updatedCart = cartData.map(item =>
          (item.itemKey === itemKey || item._id === itemKey || item.id === itemKey) && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ).filter(item => item.quantity > 0);

        set({ cartData: updatedCart });
      },

      clearCart: () => {
        set({ cartData: [] });
      },

      // Enhanced totals calculation
      getCartTotals: () => {
        const { cartData } = get();
        let totalPrice = 0;
        let totalDelivery = 0;
        let bookingItems = 0;
        let serviceItems = 0;

        cartData.forEach((item) => {
          totalPrice += (item.price * item.quantity);
          totalDelivery += (item.deliveryFee || 0) * item.quantity;
          
          if (item.itemType === 'booking') {
            bookingItems += item.quantity;
          } else {
            serviceItems += item.quantity;
          }
        });

        return { 
          totalPrice, 
          totalDelivery, 
          total: totalPrice + totalDelivery,
          bookingItems,
          serviceItems,
          totalItems: cartData.length
        };
      },

      // Enhanced checkout for handling bookings
      checkout: async () => {
        const { cartData } = get();
        const bookingItems = cartData.filter(item => item.itemType === 'booking');
        const serviceItems = cartData.filter(item => item.itemType === 'service');
        
        // Return information about what's being checked out
        const checkoutData = {
          bookingItems,
          serviceItems,
          totals: get().getCartTotals()
        };
        
        // Clear cart after successful checkout
        get().clearCart();
        set({ isCartOpen: false });
        
        return checkoutData;
      },

      // Updated method to update booking status in cart (using itemKey instead of bookingId)
      updateBookingInCart: (itemKey, updates) => {
        const { cartData } = get();
        const updatedCart = cartData.map(item => {
          if (item.itemKey === itemKey) {
            return {
              ...item,
              bookingDetails: {
                ...item.bookingDetails,
                ...updates
              }
            };
          }
          return item;
        });
        set({ cartData: updatedCart });
      },

      // Helper method to get booking items
      getBookingItems: () => {
        const { cartData } = get();
        return cartData.filter(item => item.itemType === 'booking');
      },

      // Helper method to get service items
      getServiceItems: () => {
        const { cartData } = get();
        return cartData.filter(item => item.itemType === 'service');
      },

      // New helper method to find cart item by booking ID
      findItemByBookingId: (bookingId) => {
        const { cartData } = get();
        return cartData.find(item => 
          item.bookingDetails?.bookingId === bookingId
        );
      },

      updateItemByBookingId: (bookingId, updates) => {
        const { cartData } = get();
        const updatedCart = cartData.map(item => {
          if (item.bookingDetails?.bookingId === bookingId) {
            return {
              ...item,
              bookingDetails: {
                ...item.bookingDetails,
                ...updates
              }
            };
          }
          return item;
        });
        set({ cartData: updatedCart });
      }
    }),
    {
      name: "cart-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cartData: state.cartData,
        token: state.token
      })
    }
  )
);