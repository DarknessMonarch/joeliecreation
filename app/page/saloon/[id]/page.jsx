"use client";
import Image from "next/image";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { useRouter } from "next/navigation";
import LoadingLogo from "@/app/components/LoadingLogo";
import DefaultServiceImage from "@/public/assets/service.png";
import "react-datepicker/dist/react-datepicker.css";
import styles from "@/app/styles/service.module.css";
import { useServiceStore } from "@/app/store/Service";
import { useBookingStore } from "@/app/store/Booking";
import { useSkrillStore } from "@/app/store/Skrill";

export default function SingleService({ params }) {
  const router = useRouter();
  const { currentService, loading: serviceLoading, error: serviceError, fetchServiceById, checkAvailability, availability } = useServiceStore();
  const { createBooking, loading: bookingLoading, error: bookingError } = useBookingStore();
  const { 
    initiatePayment, 
    paymentSession, 
    loading: paymentLoading, 
    error: paymentError,
    success: paymentSuccess,
    paymentType,
    setPaymentType,
    getPaymentAmount,
    calculateDepositAmount
  } = useSkrillStore();
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [bookingDetails, setBookingDetails] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [redirectingToPayment, setRedirectingToPayment] = useState(false);

  useEffect(() => {
    const loadService = async () => {
      try {
        const result = await fetchServiceById(params.id);
        
        if (!result.success) {
          toast.error(result.message || "Failed to fetch service");
          router.push("/page/saloon");
        }
      } catch (error) {
        toast.error("Failed to fetch service data");
        router.push("/page/saloon");
      }
    };

    loadService();
  }, [fetchServiceById, params.id, router]);

  useEffect(() => {
    if (selectedDate && currentService) {
      const fetchAvailability = async () => {
        try {
          const result = await checkAvailability(
            currentService._id, 
            selectedDate
          );
          if (result.success && result.data.available) {
            setAvailableTimeSlots(result.data.availableTimeSlots);
          } else {
            setAvailableTimeSlots([]);
            toast.info("No available time slots for the selected date");
          }
        } catch (error) {
          toast.error("Could not check availability");
        }
      };
  
      fetchAvailability();
    }
  }, [selectedDate, currentService, checkAvailability]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    if (!currentService) {
      toast.error("Service details not available");
      setIsSubmitting(false);
      return;
    }
  
    try {
      // Calculate deposit amount (15%)
      const depositAmount = calculateDepositAmount(currentService.price);
      const balanceAmount = currentService.price - depositAmount;
  
      const bookingData = {
        serviceId: currentService._id,
        date: selectedDate.toISOString(),
        timeSlot: selectedTimeSlot,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        price: {
          total: currentService.price,
          deposit: depositAmount,
          balance: balanceAmount
        }
      };
  
      const bookingResult = await createBooking(bookingData);
  
      if (!bookingResult.success) {
        throw new Error(bookingResult.message || "Failed to create booking");
      }
  
      toast.success("Booking created successfully!");
  
      const displayBookingDetails = {
        bookingId: bookingResult.data.bookingId,
        service: currentService.title,
        date: selectedDate.toLocaleDateString(),
        time: selectedTimeSlot,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        price: {
          total: currentService.price.toFixed(2),
          deposit: depositAmount.toFixed(2),
          balance: balanceAmount.toFixed(2)
        },
        timestamp: new Date().toLocaleString()
      };
  
      setBookingDetails(displayBookingDetails);
      setBookingId(bookingResult.data._id); 
      setCurrentStep(3); 
    } catch (error) {
      toast.error(error.message || "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentInitiation = async (type) => {
    setPaymentType(type); 
    setRedirectingToPayment(true);
    
    try {
      if (!bookingDetails || !currentService) {
        toast.error("Booking details not available");
        setRedirectingToPayment(false);
        return;
      }
      
     
      const amount = type === 'deposit' 
        ? parseFloat(bookingDetails.price.deposit)
        : parseFloat(bookingDetails.price.total);
      
      const paymentData = {
        amount,
        currency: 'USD', 
        orderId: `ORD-${Date.now()}`,
        bookingId: bookingDetails.bookingId,
        serviceId: currentService._id,
        customerEmail: bookingDetails.email,
        customerName: bookingDetails.name,
        description: `${type === 'deposit' ? 'Deposit' : 'Full payment'} for ${currentService.title}`,
        paymentType: type
      };
      
      const result = await initiatePayment(paymentData);
      
      if (result.success && result.data.paymentUrl) {
        window.location.href = result.data.paymentUrl;
      } else {
        throw new Error(result.message || "Failed to initiate payment");
      }
    } catch (error) {
      toast.error(error.message || "Failed to initiate payment");
      setRedirectingToPayment(false);
    }
  };

  const handleBookAnother = () => {
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setCurrentStep(1);
    setFormData({
      name: "",
      email: "",
      phone: ""
    });
    setBookingDetails(null);
    setBookingId(null);
  };

  const CalendarSelection = ({
    availableDates,
    selectedDate,
    onDateChange,
    selectedTimeSlot,
    onTimeSlotSelect,
    availableTimeSlots
  }) => {
    const isAvailableDate = (date) => {
      if (!availableDates || !Array.isArray(availableDates)) return false;
      
      return availableDates.some(
        (availableDate) => {
          const availDate = new Date(availableDate);
          return date.getDate() === availDate.getDate() &&
                 date.getMonth() === availDate.getMonth() &&
                 date.getFullYear() === availDate.getFullYear();
        }
      );
    };

    const renderDayContents = (day, date) => {
      const isAvailable = isAvailableDate(date);
      return (
        <div className={isAvailable ? styles.availableDay : ""}>
          {day}
          {isAvailable && <div className={styles.availableDot}></div>}
        </div>
      );
    };

    return (
      <div className={styles.calendarSelectionContainer}>
        <div className={styles.calendarWrapper}>
          <DatePicker
            selected={selectedDate}
            onChange={onDateChange}
            inline
            minDate={new Date()}
            filterDate={isAvailableDate}
            renderDayContents={renderDayContents}
            calendarClassName={styles.calendar}
            dayClassName={(date) =>
              isAvailableDate(date)
                ? styles.availableDate
                : styles.unavailableDate
            }
          />
        </div>

        {selectedDate && (
          <div className={styles.timeSlotSection}>
            <h3>
              Select a Time on{" "}
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <div className={styles.timeSlotContainer}>
              {availableTimeSlots && availableTimeSlots.length > 0 ? (
                availableTimeSlots.map((timeSlot) => (
                  <button
                    key={timeSlot}
                    className={`${styles.timeSlotButton} ${
                      selectedTimeSlot === timeSlot ? styles.selected : ""
                    }`}
                    onClick={() => onTimeSlotSelect(timeSlot)}
                  >
                    {timeSlot}
                  </button>
                ))
              ) : (
                <p className={styles.noSlots}>No available time slots for this date</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Show loading state
  if (serviceLoading || !currentService) {
    return (
      <div className={styles.container}>
        <LoadingLogo/>
      </div>
    );
  }

  // Show error state
  if (serviceError) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>Error loading service</h2>
          <p>{serviceError}</p>
          <button 
            className={styles.solidButton} 
            onClick={() => router.push("/page/saloon")}
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Hero Banner */}
      <section className={styles.hero}>
        <div className={styles.heroImageContainer}>
          <Image
            src={currentService.image || DefaultServiceImage}
            alt={currentService.title}
            fill
            style={{ objectFit: "cover" }}
            className={styles.heroImage}
            priority
          />
          <div className={styles.heroContent}>
            <h1>{currentService.title}</h1>
            <p>{currentService.description}</p>
            <div className={styles.serviceHighlights}>
              <div className={styles.highlight}>
                <span className={styles.highlightIcon}>⏱️</span>
                <span>{currentService.duration}</span>
              </div>
              <div className={styles.highlight}>
                <span className={styles.highlightIcon}>💰</span>
                <span>${currentService.price.toFixed(2)}</span>
              </div>
              <div className={styles.highlight}>
                <span className={styles.highlightIcon}>💼</span>
                <span>{currentService.breadcrumb}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Tracker - Updated to include payment step */}
      <section className={styles.progressTracker}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
        <div className={styles.steps}>
          {[
            { num: 1, title: "Select Date & Time" },
            { num: 2, title: "Your Details" },
            { num: 3, title: "Payment" },
            { num: 4, title: "Confirmation" }
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
      </section>

      <div className={styles.mainContent}>
        {currentStep === 1 && (
          <div className={styles.bookingStep}>
            <div className={styles.sectionHeader}>
              <h2>Choose Your Appointment Date & Time</h2>
              <p>Select from our available slots below</p>
            </div>

            <CalendarSelection
              availableDates={currentService.availableDates || []}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              selectedTimeSlot={selectedTimeSlot}
              onTimeSlotSelect={handleTimeSlotSelect}
              availableTimeSlots={availableTimeSlots}
            />

            <div className={styles.navigationButtons}>
              <button
                className={styles.nextButton}
                disabled={!selectedDate || !selectedTimeSlot}
                onClick={() => setCurrentStep(2)}
              >
                Continue to Your Details
                <span className={styles.buttonIcon}>→</span>
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className={styles.bookingStep}>
            <div className={styles.sectionHeader}>
              <h2>Your Details</h2>
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

              <div className={styles.navigationButtons}>
                <button
                  type="button"
                  className={styles.backButton}
                  onClick={() => setCurrentStep(1)}
                  disabled={isSubmitting}
                >
                  <span className={styles.buttonIcon}>←</span>
                  Back
                </button>
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
                      Continue to Payment
                      <span className={styles.buttonIcon}>→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {currentStep === 3 && bookingDetails && (
          <div className={styles.bookingStep}>
            <div className={styles.sectionHeader}>
              <h2>Payment Options</h2>
              <p>Choose how you'd like to pay for your booking</p>
            </div>

            <div className={styles.paymentContainer}>
              <div className={styles.bookingSummary}>
                <h3>Booking Summary</h3>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryRow}>
                    <span>Service:</span>
                    <span>{bookingDetails.service}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Date & Time:</span>
                    <span>{bookingDetails.date} at {bookingDetails.time}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Total Price:</span>
                    <span className={styles.priceHighlight}>${bookingDetails.price.total}</span>
                  </div>
                </div>
              </div>

              <div className={styles.paymentOptions}>
                <h3>Select Payment Option</h3>
                <div className={styles.paymentCards}>
                  <div className={styles.paymentCard}>
                    <div className={styles.paymentCardHeader}>
                      <h4>Pay Deposit</h4>
                      <div className={styles.paymentTag}>Recommended</div>
                    </div>
                    <div className={styles.paymentCardBody}>
                      <div className={styles.paymentAmount}>
                        ${bookingDetails.price.deposit}
                      </div>
                      <p>Secure your booking with a 15% deposit now</p>
                      <ul className={styles.paymentBenefits}>
                        <li>Reserve your spot instantly</li>
                        <li>Remaining balance due at service: ${bookingDetails.price.balance}</li>
                        <li>Flexible payment option</li>
                      </ul>
                      <button 
                        className={styles.paymentButton}
                        onClick={() => handlePaymentInitiation('deposit')}
                        disabled={redirectingToPayment}
                      >
                        {redirectingToPayment ? (
                          <span className={styles.loadingSpinner}></span>
                        ) : (
                          <>Pay Deposit</>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className={styles.paymentCard}>
                    <div className={styles.paymentCardHeader}>
                      <h4>Pay in Full</h4>
                    </div>
                    <div className={styles.paymentCardBody}>
                      <div className={styles.paymentAmount}>
                        ${bookingDetails.price.total}
                      </div>
                      <p>Complete your payment in one transaction</p>
                      <ul className={styles.paymentBenefits}>
                        <li>Fully paid - no balance remaining</li>
                        <li>Faster check-in on appointment day</li>
                        <li>Complete payment immediately</li>
                      </ul>
                      <button 
                        className={`${styles.paymentButton}`}
                        onClick={() => handlePaymentInitiation('full')}
                        disabled={redirectingToPayment}
                      >
                        {redirectingToPayment ? (
                          <span className={styles.loadingSpinner}></span>
                        ) : (
                          <>Pay in Full</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {paymentError && (
                  <div className={styles.paymentError}>
                    <p>{paymentError}</p>
                  </div>
                )}
              </div>

              <div className={styles.paymentFooter}>
                <div className={styles.securePayment}>
                  <span className={styles.lockIcon}>🔒</span>
                  <span>Secure payment processed by Skrill</span>
                </div>
                <p className={styles.paymentDisclaimer}>
                  By proceeding with payment, you agree to our terms and conditions.
                </p>
              </div>
            </div>

            <div className={styles.navigationButtons}>
              <button
                className={styles.backButton}
                onClick={() => setCurrentStep(2)}
                disabled={redirectingToPayment}
              >
                <span className={styles.buttonIcon}>←</span>
                Back to Details
              </button>
              <button
                className={styles.skipButton}
                onClick={() => setCurrentStep(4)}
                disabled={redirectingToPayment}
              >
                Skip Payment for Now
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className={styles.bookingStep}>
            <div className={styles.confirmationContainer}>
              <div className={styles.confirmationIcon}>✓</div>
              <h2>Booking Confirmed!</h2>
              <p>
                Thank you for your booking. We have sent a confirmation email to
                <strong> {bookingDetails.email}</strong> with all the
                details.
              </p>

              <div className={styles.confirmationDetails}>
                <div className={styles.confirmationCard}>
                  <h3>Booking Information</h3>
                  <div className={styles.confirmationRow}>
                    <span>Booking ID:</span>
                    <span>{bookingDetails.bookingId}</span>
                  </div>
                  <div className={styles.confirmationRow}>
                    <span>Service:</span>
                    <span>{bookingDetails.service}</span>
                  </div>
                  <div className={styles.confirmationRow}>
                    <span>Date & Time:</span>
                    <span>
                      {bookingDetails.date} at {bookingDetails.time}
                    </span>
                  </div>
                  <div className={styles.confirmationRow}>
                    <span>Name:</span>
                    <span>{bookingDetails.name}</span>
                  </div>
                  <div className={styles.confirmationRow}>
                    <span>Email:</span>
                    <span>{bookingDetails.email}</span>
                  </div>
                  <div className={styles.confirmationRow}>
                    <span>Phone:</span>
                    <span>{bookingDetails.phone}</span>
                  </div>
                  <div className={styles.confirmationRow}>
                    <span>Total Amount:</span>
                    <span>${bookingDetails.price.total}</span>
                  </div>
                </div>
              </div>

              <div className={styles.nextStepsSection}>
                <h3>What's Next?</h3>
                <ul className={styles.nextStepsList}>
                  <li>Check your email for booking confirmation</li>
                  <li>Add the appointment to your calendar</li>
                  <li>
                    {paymentSuccess ? (
                      <>
                        Your payment has been processed successfully. 
                        {paymentType === 'deposit' && 
                          ` Remaining balance of $${bookingDetails.price.balance} will be collected at the time of service.`}
                      </>
                    ) : (
                      <>
                        Payment of ${bookingDetails.price.total} will be collected at the time of service
                      </>
                    )}
                  </li>
                </ul>
              </div>

              <div className={styles.confirmationButtons}>
                <button
                  className={styles.outlineButton}
                  onClick={handleBookAnother}
                >
                  Book Another Service
                </button>
                <button
                  className={styles.solidButton}
                  onClick={() => router.push("/page/saloon")}
                >
                  Return to Homepage
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}