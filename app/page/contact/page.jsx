"use client";
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  FiPhone, FiMail, FiMapPin, FiClock, FiSend,
  FiUser, FiMessageSquare, FiInfo, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import styles from '@/app/styles/contact.module.css';
import { useContactStore } from "@/app/store/Contact";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '', email: '', subject: '', message: ''
  });
  const [focusedField, setFocusedField] = useState(null);
  
  // Get store methods and state
  const { 
    submitContactForm, 
    fetchContactInfo, 
    resetSubmitStatus,
    loading, 
    error, 
    submitSuccess, 
    contactInfo 
  } = useContactStore();
  
  const headingRef = useRef(null);
  const contentRef = useRef(null);
  const formRef = useRef(null);
  const infoRef = useRef(null);

  useEffect(() => {
    // Fetch contact info when component mounts
    fetchContactInfo();
    
    // GSAP animations
    gsap.fromTo(headingRef.current, 
      { opacity: 0, y: -30 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
    
    gsap.fromTo(contentRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power3.out" }
    );
    
    gsap.fromTo(formRef.current.querySelectorAll('input, textarea'), 
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, delay: 0.5, ease: "power2.out" }
    );
    
    gsap.fromTo(infoRef.current.querySelectorAll('div'), 
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, delay: 0.5, ease: "power2.out" }
    );
    
    // Clean up - reset submit status when unmounting
    return () => {
      resetSubmitStatus();
    };
  }, [fetchContactInfo, resetSubmitStatus]);

  // Reset form and success state when submission is successful
  useEffect(() => {
    if (submitSuccess) {
      // Success animation
      const formElements = formRef.current.querySelectorAll('input, textarea');
      gsap.to(formElements, {
        opacity: 0,
        y: -10,
        stagger: 0.05,
        duration: 0.3,
        onComplete: () => {
          setFormData({ name: '', email: '', subject: '', message: '' });
          
          // Fade form elements back in
          gsap.to(formElements, {
            opacity: 1,
            y: 0,
            stagger: 0.05,
            duration: 0.3,
            delay: 0.2
          });
        }
      });
    }
  }, [submitSuccess]);

  // Error animation effect
  useEffect(() => {
    if (error) {
      // Error shake animation
      gsap.to(formRef.current, {
        x: [-10, 10, -10, 10, 0],
        duration: 0.5,
        ease: "power2.inOut"
      });
    }
  }, [error]);

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handleFocus = field => setFocusedField(field);
  
  const handleBlur = () => setFocusedField(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitContactForm(formData);
  };

  return (
    <div className={styles.contactContainer}>
      <div className={styles.contactWrapper}>
      
        <div ref={contentRef} className={styles.contactContent}>
          <form ref={formRef} className={styles.contactForm} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <div className={`${styles.inputIcon} ${focusedField === 'name' ? styles.iconActive : ''}`}>
                <FiUser />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => handleFocus('name')}
                onBlur={handleBlur}
                placeholder="Your Name"
                required
                className={styles.inputField}
                disabled={loading}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <div className={`${styles.inputIcon} ${focusedField === 'email' ? styles.iconActive : ''}`}>
                <FiMail />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => handleFocus('email')}
                onBlur={handleBlur}
                placeholder="Your Email"
                required
                className={styles.inputField}
                disabled={loading}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <div className={`${styles.inputIcon} ${focusedField === 'subject' ? styles.iconActive : ''}`}>
                <FiInfo />
              </div>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                onFocus={() => handleFocus('subject')}
                onBlur={handleBlur}
                placeholder="Subject"
                required
                className={styles.inputField}
                disabled={loading}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <div className={`${styles.inputIcon} ${focusedField === 'message' ? styles.iconActive : ''}`}>
                <FiMessageSquare />
              </div>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                onFocus={() => handleFocus('message')}
                onBlur={handleBlur}
                placeholder="Your Message"
                required
                className={`${styles.inputField} ${styles.textareaField}`}
                rows={5}
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.buttonLoading}>Sending...</span>
              ) : (
                <>
                  <FiSend className={styles.buttonIcon} />
                  <span>Send Message</span>
                </>
              )}
            </button>
            
            {submitSuccess && (
              <div className={styles.successMessage}>
                <FiCheckCircle className={styles.successIcon} />
                <p>Thank you! Your message has been sent successfully.</p>
              </div>
            )}
            
            {error && (
              <div className={styles.errorMessage}>
                <FiAlertCircle className={styles.errorIcon} />
                <p>{error}</p>
              </div>
            )}
          </form>
          
          <div ref={infoRef} className={styles.contactInfo}>
            {contactInfo ? (
              <>
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}>
                    <FiMapPin />
                  </div>
                  <div className={styles.infoContent}>
                    <h3>Our Location</h3>
                    <p>{contactInfo.address.street}</p>
                    <p>{contactInfo.address.city}, {contactInfo.address.state} {contactInfo.address.zip}</p>
                  </div>
                </div>
                
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}>
                    <FiPhone />
                  </div>
                  <div className={styles.infoContent}>
                    <h3>Call Us</h3>
                    <p>{contactInfo.phone.main}</p>
                    <p>{contactInfo.phone.support}</p>
                  </div>
                </div>
                
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}>
                    <FiMail />
                  </div>
                  <div className={styles.infoContent}>
                    <h3>Email Us</h3>
                    <p>{contactInfo.email.info}</p>
                    <p>{contactInfo.email.support}</p>
                  </div>
                </div>
                
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}>
                    <FiClock />
                  </div>
                  <div className={styles.infoContent}>
                    <h3>Business Hours</h3>
                    <p>{contactInfo.hours.weekdays}</p>
                    <p>{contactInfo.hours.weekends}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}>
                    <FiMapPin />
                  </div>
                  <div className={styles.infoContent}>
                    <h3>Our Location</h3>
                    <p>123 Business Avenue, Suite 500</p>
                    <p>New York, NY 10001</p>
                  </div>
                </div>
                
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}>
                    <FiPhone />
                  </div>
                  <div className={styles.infoContent}>
                    <h3>Call Us</h3>
                    <p>+1 (555) 123-4567</p>
                    <p>+1 (555) 987-6543</p>
                  </div>
                </div>
                
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}>
                    <FiMail />
                  </div>
                  <div className={styles.infoContent}>
                    <h3>Email Us</h3>
                    <p>info@yourcompany.com</p>
                    <p>support@yourcompany.com</p>
                  </div>
                </div>
                
                <div className={styles.infoCard}>
                  <div className={styles.infoIcon}>
                    <FiClock />
                  </div>
                  <div className={styles.infoContent}>
                    <h3>Business Hours</h3>
                    <p>Monday - Friday: 9am - 5pm</p>
                    <p>Saturday & Sunday: Closed</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}