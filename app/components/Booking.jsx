"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/styles/book.module.css";
import { useBookingStore } from "@/app/store/Booking";
import { useSkrillStore } from "@/app/store/Skrill";
import { useCartStore } from "@/app/store/Cart";

import {
  HiX as CloseIcon,
  HiArrowLeft as BackIcon,
  HiArrowRight as NextIcon,
} from "react-icons/hi";

export default function Booking({ 
  isOpen, 
  onClose, 
  service, 
  mode = "standalone", // "standalone" or "cart"
  onBookingComplete = null,
  cartItemKey = null,
  existingBookingDetails = null
}) {
  const router = useRouter();
  const {
    createBooking,
    loading: bookingLoading,
    error: bookingError,
  } = useBookingStore();
  const {
    calculateDepositAmount,
  } = useSkrillStore();
  const { addToCart, openCart, updateBookingInCart } = useCartStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === "cart" && existingBookingDetails) {
        setFormData({
          name: existingBookingDetails.customerInfo?.name || "",
          email: existingBookingDetails.customerInfo?.email || "",
          phone: existingBookingDetails.customerInfo?.phone || "",
        });
        if (existingBookingDetails.bookingId) {
          setBookingId(existingBookingDetails.bookingId);
          setBookingDetails({
            bookingId: existingBookingDetails.bookingId,
            service: service.title,
            name: existingBookingDetails.customerInfo?.name || "",
            email: existingBookingDetails.customerInfo?.email || "",
            phone: existingBookingDetails.customerInfo?.phone || "",
            price: {
              total: service.price.toFixed(2),
              deposit: calculateDepositAmount(service.price).toFixed(2),
              balance: (service.price - calculateDepositAmount(service.price)).toFixed(2),
            },
            timestamp: new Date().toLocaleString(),
          });
          setCurrentStep(2);
        }
      } else {
        resetForm();
      }
    }
  }, [isOpen, mode, existingBookingDetails, service]);

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({ name: "", email: "", phone: "" });
    setBookingDetails(null);
    setBookingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleBookingSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  if (!service) {
    toast.error("order not available");
    setIsSubmitting(false);
    return;
  }

  try {
    const depositAmount = calculateDepositAmount(service.price);
    const balanceAmount = service.price - depositAmount;

    const bookingData = {
      serviceId: service._id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      breadcrumb: service.breadcrumb, 
      price: {
        total: service.price,
        deposit: depositAmount,
        balance: balanceAmount,
      },
    };

    const bookingResult = await createBooking(bookingData);

    if (!bookingResult.success) {
      throw new Error(bookingResult.message || "Failed to create order");
    }

    toast.success("Food ordered successfully!");

    const displayBookingDetails = {
      bookingId: bookingResult.data.bookingId,
      service: service.title,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      price: {
        total: service.price.toFixed(2),
        deposit: depositAmount.toFixed(2),
        balance: balanceAmount.toFixed(2),
      },
      timestamp: new Date().toLocaleString(),
    };

    setBookingDetails(displayBookingDetails);
    setBookingId(bookingResult.data._id);

    if (mode === "cart" && cartItemKey) {
      updateBookingInCart(cartItemKey, {
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        bookingId: bookingResult.data.bookingId,
        isBooked: true,
        paymentStatus: 'pending'
      });
    }

    setCurrentStep(2);
  } catch (error) {
    toast.error(error.message || "Failed to create order");
  } finally {
    setIsSubmitting(false);
  }
};

  const handleAddToCart = () => {
    if (!service) return;

    let bookingDetailsForCart = null;

    if (formData.name || bookingDetails) {
      bookingDetailsForCart = {
        customerInfo: {
          name: bookingDetails?.name || formData.name,
          email: bookingDetails?.email || formData.email,
          phone: bookingDetails?.phone || formData.phone,
        },
        bookingId: bookingDetails?.bookingId || null,
        paymentStatus: "pending",
        isBooked: !!bookingDetails?.bookingId,
      };
    }

    addToCart(service, bookingDetailsForCart);

    toast.success(
      bookingDetailsForCart?.isBooked
        ? "Order added to cart!"
        : bookingDetailsForCart
        ? "Food added to cart with order details!"
        : "Food added to cart!"
    );

    onClose();
    openCart();
  };

  const handleBookAnother = () => {
    resetForm();
  };

  const handleCloseBooking = () => {
    if (mode === "cart" && onBookingComplete && bookingDetails) {
      onBookingComplete({
        bookingId: bookingDetails.bookingId,
        name: bookingDetails.name,
        email: bookingDetails.email,
        phone: bookingDetails.phone,
      });
    }
    onClose();
  };

  const handleCompleteCartBooking = () => {
    if (onBookingComplete && bookingDetails) {
      onBookingComplete({
        bookingId: bookingDetails.bookingId,
        name: bookingDetails.name,
        email: bookingDetails.email,
        phone: bookingDetails.phone,
      });
    }
    onClose();
  };

  if (!isOpen || !service) return null;

  return (
    <div className={styles.popupContainer}>
      {/* Progress Tracker */}
      <div className={styles.progressTracker}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(currentStep / 2) * 100}%` }}
          ></div>
        </div>
        <div className={styles.steps}>
          {[
            { num: 1, title: "Details" },
            { num: 2, title: "Confirmation" },
          ].map((step) => (
            <div
              key={step.num}
              className={`${styles.stepItem} ${
                currentStep >= step.num ? styles.active : ""
              } ${currentStep === step.num ? styles.current : ""}`}
            >
              <div className={styles.stepNumber}>{step.num}</div>
              <div className={styles.stepTitle}>{step.title}</div>
            </div>
          ))}
        </div>
      </div>

      {currentStep === 1 && (
        <div className={styles.bookingStep}>
          <div className={styles.sectionHeader}>
            <h3>Your Details</h3>
            <p>Please provide your contact information</p>
          </div>

          <form className={styles.detailsForm} onSubmit={handleBookingSubmit}>
            <div className={styles.formContent}>
              <div className={styles.formSection}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Phone *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.popupActions}>
              {mode === "cart" && (
                <button
                  type="button"
                  className={styles.backButton}
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  <BackIcon className={styles.buttonIcon} height={16} />
                  Back to Cart
                </button>
              )}
              <button
                type="submit"
                className={styles.nextButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className={styles.loadingSpinner}></span>
                    Processing...
                  </>
                ) : (
                  <>
                    Order
                    <NextIcon className={styles.buttonIcon} height={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {currentStep === 2 && (
        <div className={styles.bookingStep}>
          <div className={styles.confirmationContainer}>
            <div className={styles.confirmationIcon}>✓</div>
            <h3>Booking Confirmed!</h3>
            <p>
              Thank you for your booking. We have sent a confirmation email to
              <strong> {bookingDetails.email}</strong> with all the details.
            </p>

            <div className={styles.confirmationDetails}>
              <div className={styles.confirmationCard}>
                <h4>Booking Information</h4>
                <div className={styles.confirmationRow}>
                  <span>Booking ID:</span>
                  <span>{bookingDetails.bookingId}</span>
                </div>
                <div className={styles.confirmationRow}>
                  <span>Service:</span>
                  <span>{bookingDetails.service}</span>
                </div>
                <div className={styles.confirmationRow}>
                  <span>Customer:</span>
                  <span>{bookingDetails.name}</span>
                </div>
                <div className={styles.confirmationRow}>
                  <span>Total Amount:</span>
                  <span>${bookingDetails.price.total}</span>
                </div>
              </div>
            </div>

            <div className={styles.popupActions}>
              <button
                className={styles.outlineButton}
                onClick={handleBookAnother}
              >
                Book Another Service
              </button>
              {mode === "standalone" && (
                <button
                  className={styles.addToCartButton}
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>
              )}
              <button 
                className={styles.nextButton} 
                onClick={handleCloseBooking}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}