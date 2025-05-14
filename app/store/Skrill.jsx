import { create } from "zustand";
import { persist } from "zustand/middleware";

const SERVER_API = process.env.NEXT_PUBLIC_SERVER_API;

export const useSkrillStore = create(
  persist(
    (set, get) => ({
      paymentSession: null,
      paymentHistory: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        total: 0,
        limit: 10
      },
      currentTransaction: null,
      loading: false,
      error: null,
      success: false,
      paymentType: 'deposit', // default to deposit (15%)
      
      initiatePayment: async (paymentData) => {
        try {
          set({ loading: true, error: null, success: false });
          
          const paymentType = paymentData.paymentType || get().paymentType;
          
          const response = await fetch(`${SERVER_API}/skrill/checkout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
              ...paymentData,
              paymentType
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Payment initiation failed: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            set({ 
              paymentSession: {
                sessionId: data.sessionId,
                paymentUrl: data.paymentUrl,
                amount: data.amount,
                paymentType: data.paymentType
              },
              success: true 
            });
            return { success: true, data };
          } else {
            throw new Error(data.message || "Failed to initiate payment");
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },
      

      processRefund: async (transactionId, amount, reason) => {
        try {
          set({ loading: true, error: null, success: false });
          
          const response = await fetch(`${SERVER_API}/skrill/refund/${transactionId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
              amount,
              reason
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Refund processing failed: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            set({ success: true });
            const currentTransaction = get().currentTransaction;
            if (currentTransaction && currentTransaction.transactionId === transactionId) {
              set({
                currentTransaction: {
                  ...currentTransaction,
                  status: 'refunded',
                  refundAmount: amount,
                  refundDate: new Date()
                }
              });
            }
            
            // Update payment in history if it exists
            const paymentHistory = get().paymentHistory;
            const updatedHistory = paymentHistory.map(payment => {
              if (payment.transactionId === transactionId) {
                return {
                  ...payment,
                  status: 'refunded',
                  refundAmount: amount,
                  refundDate: new Date()
                };
              }
              return payment;
            });
            
            set({ paymentHistory: updatedHistory });
            
            return { success: true, refund: data.refund };
          } else {
            throw new Error(data.message || "Failed to process refund");
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },
    
      setPaymentType: (type) => {
        if (type === 'deposit' || type === 'full') {
          set({ paymentType: type });
        }
      },
      
      calculateDepositAmount: (totalAmount) => {
        return parseFloat((totalAmount * 0.15).toFixed(2));
      },
 
      getPaymentAmount: (totalAmount) => {
        const paymentType = get().paymentType;
        if (paymentType === 'deposit') {
          return get().calculateDepositAmount(totalAmount);
        }
        return totalAmount;
      },
      
      resetSuccess: () => {
        set({ success: false });
      },
      
      clearPaymentSession: () => {
        set({ paymentSession: null });
      },
      
      clearCurrentTransaction: () => {
        set({ currentTransaction: null });
      },
      
      clearPaymentState: () => {
        set({
          paymentSession: null,
          currentTransaction: null,
          loading: false,
          error: null,
          success: false,
          paymentType: 'deposit'
        });
      }
    }),
    {
      name: "skrill-payment-store",
      getStorage: () => localStorage,
    }
  )
);