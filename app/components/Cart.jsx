"use client";

import { toast } from "sonner";
import Image from "next/image";
import Popup from "@/app/components/Popup";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nothing from "@/app/components/Nothing";
import { useCartStore } from "@/app/store/Cart";
import styles from "@/app/styles/cart.module.css";
import { useSkrillStore } from "@/app/store/Skrill";
import { useBookingStore } from "@/app/store/Booking";
import emptyCart from "@/public/assets/emptycart.png";
import BookingContent from "@/app/components/Booking";
import DefaultServiceImage from "@/public/assets/food.png";

import {
  HiMinus as MinusIcon,
  HiPlus as AddIcon,
  HiTrash as DeleteIcon,
  HiArrowRight as BackIcon,
  HiShoppingBag as ShoppingIcon,
  HiChevronDoubleRight as CheckOutIcon,
} from "react-icons/hi";

export default function Cart() {
  const router = useRouter();
  const {
    cartData,
    isCartOpen,
    toggleCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    getCartTotals,
    checkout,
    updateBookingInCart,
    getBookingItems,
    getServiceItems,
  } = useCartStore();

  const { createBooking, loading: bookingLoading } = useBookingStore();
  const { 
    initiatePayment, 
    loading: paymentLoading,
    calculateDepositAmount 
  } = useSkrillStore();

  const [totals, setTotals] = useState({
    totalPrice: 0,
    totalDelivery: 0,
    total: 0,
    bookingItems: 0,
    serviceItems: 0,
  });
  const [isMobile, setIsMobile] = useState(false);
  
  // Booking popup state
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [currentBookingItem, setCurrentBookingItem] = useState(null);
  const [currentCartItemKey, setCurrentCartItemKey] = useState(null);

  useEffect(() => {
    setTotals(getCartTotals());
  }, [cartData, getCartTotals]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleRemoveItem = (itemKey) => {
    removeFromCart(itemKey);
    toast.success("Item removed from cart", {
      style: {
        background: "#ff3b3b",
        color: "#ffffff",
      },
    });
  };

  const handleIncreaseQuantity = (itemKey) => {
    increaseQuantity(itemKey);
  };

  const handleDecreaseQuantity = (itemKey) => {
    decreaseQuantity(itemKey);
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared", {
      style: {
        background: "#ff3b3b",
        color: "#ffffff",
      },
    });
  };

const handleBookItem = (item) => {
  const serviceForBooking = {
    _id: item._id,
    title: item.title,
    price: item.price,
    image: item.image,
    duration: item.duration,
    description: item.description,
    availableDates: item.availableDates,
    breadcrumb: item.breadcrumb, 
  };
  
  setCurrentBookingItem(serviceForBooking);
  setCurrentCartItemKey(item.itemKey || item._id);
  setShowBookingPopup(true);
};
  // Handle booking popup close
  const handleBookingPopupClose = () => {
    setShowBookingPopup(false);
    setCurrentBookingItem(null);
    setCurrentCartItemKey(null);
  };

  // Handle successful booking from popup
  const handleBookingComplete = (bookingDetails) => {
    if (currentCartItemKey) {
      // Update the cart item with new booking details
      updateBookingInCart(currentCartItemKey, {
        date: bookingDetails.date,
        time: bookingDetails.time,
        customerInfo: {
          name: bookingDetails.name,
          email: bookingDetails.email,
          phone: bookingDetails.phone
        },
        bookingId: bookingDetails.bookingId,
        isBooked: true,
        paymentStatus: 'pending'
      });

      toast.success("Booking details updated in cart!");
    }
    
    handleBookingPopupClose();
  };

  const handlePayForBooking = async (item, paymentType = 'deposit') => {
    if (!item.bookingDetails?.bookingId) {
      toast.error("Please create booking first");
      return;
    }

    try {
      const amount = paymentType === 'deposit' 
        ? calculateDepositAmount(item.price)
        : item.price;

      const paymentData = {
        amount,
        currency: 'USD',
        orderId: `ORD-${Date.now()}`,
        bookingId: item.bookingDetails.bookingId,
        serviceId: item._id,
        customerEmail: item.bookingDetails.customerInfo.email,
        customerName: item.bookingDetails.customerInfo.name,
        description: `${paymentType === 'deposit' ? 'Deposit' : 'Full payment'} for ${item.title}`,
        paymentType: paymentType
      };

      const result = await initiatePayment(paymentData);
      
      if (result.success && result.data.paymentUrl) {
        window.location.href = result.data.paymentUrl;
      } else {
        throw new Error(result.message || "Failed to initiate payment");
      }
    } catch (error) {
      toast.error(error.message || "Failed to initiate payment");
    }
  };

  const handleCheckout = async () => {
    if (cartData.length === 0) {
      toast.error("Your cart is empty", {
        style: {
          background: "#ff3b3b",
          color: "#ffffff",
        },
      });
      return;
    }

    // Check for items that need booking but don't have booking details
    const itemsNeedingBooking = cartData.filter(item => 
      item.itemType !== 'booking' && 
      (!item.bookingDetails || !item.bookingDetails.isBooked)
    );

    if (itemsNeedingBooking.length > 0) {
      // Show booking popup for the first item that needs booking
      handleBookItem(itemsNeedingBooking[0]);
      toast.info("Please complete booking details for your items");
      return;
    }

    // Check for booking items that aren't fully booked
    const incompleteBookings = cartData.filter(item => 
      item.itemType === 'booking' && 
      (!item.bookingDetails || !item.bookingDetails.isBooked)
    );

    if (incompleteBookings.length > 0) {
      toast.error("Please complete all bookings before checkout");
      return;
    }

    // Proceed with checkout
    try {
      const checkoutData = await checkout();
      
      toast.success("Checkout successful! Your order has been placed.", {
        style: {
          background: "#4caf50",
          color: "#ffffff",
        },
      });

      console.log("Checkout data:", checkoutData);
    } catch (error) {
      toast.error("Checkout failed. Please try again.");
    }
  };

  const cartClasses = `${styles.sideNav} ${
    isMobile && isCartOpen ? styles.sideSlide : ""
  } ${!isMobile ? styles.desktopVisible : ""}`;

  return (
    <>
      <div className={cartClasses}>
        <div className={styles.cartNav}>
          <ShoppingIcon className={styles.cartIcon} height={24} />
          <h1>My Order</h1>
          {isMobile && (
            <div onClick={() => toggleCart()}>
              <BackIcon className={styles.backIcon} height={24} />
            </div>
          )}
        </div>

        <div className={styles.cartContent}>
          {cartData.length > 0 ? (
            cartData.map((data) => {              
              return (
                <div className={styles.cartCard} key={data.itemKey || data._id}>
                  <Image
                    className={styles.cartImg}
                    src={data.image || DefaultServiceImage}
                    alt={data.title || data.name}
                    width={80}
                    height={80}
                    priority
                  />
                  <div className={styles.cartContainInfo}>
                    <h3>{data.title || data.name}</h3>
                    
  
                    <div className={styles.cartModify}>
                      <p>${data.price}</p>

                      <div className={styles.quantityControl}>
                        <div
                          className={styles.cartModifyContain}
                          onClick={() => handleDecreaseQuantity(data.itemKey || data._id)}
                        >
                          <MinusIcon className={styles.cartMinus} height={16} />
                        </div>
                        <span>{data.quantity}</span>
                        <div
                          className={styles.cartModifyContain}
                          onClick={() => handleIncreaseQuantity(data.itemKey || data._id)}
                        >
                          <AddIcon className={styles.cartAdd} height={16} />
                        </div>
                      </div>
                    </div>
                    <div
                      className={styles.cartDelete}
                      onClick={() => handleRemoveItem(data.itemKey || data._id)}
                    >
                      <DeleteIcon className={styles.cartDeleteIcon} height={20} />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <Nothing
              NothingImage={emptyCart}
              Text="Your cart is empty"
              Alt="No data"
            />
          )}
        </div>

        <div className={styles.cartFooter}>
          <div className={styles.cartFooterItem}>
            {totals.bookingItems > 0 && (
              <div className={styles.cartItem}>
                <h4>Booking Items: {totals.bookingItems}</h4>
              </div>
            )}
            <div className={styles.cartItem}>
              <h3>Subtotal:</h3>
              <h3>${totals.totalPrice}</h3>
            </div>
            <div className={styles.cartItem}>
              <h2>Total:</h2>
              <h2>${totals.total}</h2>
            </div>
          </div>

          {cartData.length > 0 && (
            <>
              <button className={styles.clearCartBtn} onClick={handleClearCart}>
                Clear Cart
              </button>
              
              <button 
                className={styles.checkOutBtn} 
                onClick={handleCheckout}
                disabled={bookingLoading || paymentLoading}
              >
                {bookingLoading || paymentLoading ? (
                  <>
                    <span className={styles.loadingSpinner}></span>
                    Processing...
                  </>
                ) : (
                  <>
                    Checkout <CheckOutIcon className={styles.checkIcon} height={18} />
                  </>
                )}
              </button>
            </>
          )}

          {isMobile && (
            <span onClick={() => toggleCart()}>Continue shopping</span>
          )}
        </div>
      </div>

      {/* Booking Popup */}
      <Popup
        Top={0}
        Right={0}
        Left={0}
        Bottom={0}
        Width={800}
        OnClose={handleBookingPopupClose}
        Blur={5}
        Zindex={9999}
        BorderRadiusTopLeft={15}
        BorderRadiusTopRight={15}
        BorderRadiusBottomRight={15}
        BorderRadiusBottomLeft={15}
        Content={
          <BookingContent
            isOpen={showBookingPopup}
            onClose={handleBookingPopupClose}
            service={currentBookingItem}
            mode="cart"
            onBookingComplete={handleBookingComplete}
            cartItemKey={currentCartItemKey}
            existingBookingDetails={
              cartData.find(item => (item.itemKey || item._id) === currentCartItemKey)?.bookingDetails
            }
          />
        }
        IsOpen={showBookingPopup}
      />
    </>
  );
}