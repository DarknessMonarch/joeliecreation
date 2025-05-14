"use client";
import { useState, useEffect } from 'react';
import {
  FiUser, FiMessageSquare, FiMail, FiSend, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import { useContactStore } from "@/app/store/Contact";
import styles from '@/app/styles/contact.module.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '', email: '', message: ''
  });
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState(null);
  
  const { 
    submitContactForm, 
    resetSubmitStatus,
    loading, 
    submitSuccess
  } = useContactStore();
  
  useEffect(() => {
    return () => resetSubmitStatus();
  }, [resetSubmitStatus]);

  useEffect(() => {
    if (submitSuccess) {
      setFormData({ name: '', email: '', message: '' });
    }
  }, [submitSuccess]);

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFocus = field => setFocusedField(field);
  const handleBlur = () => setFocusedField(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Client-side validation
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      const result = await submitContactForm(formData);
      
      if (!result || !result.success) {
        setError(result?.message || 'Failed to send message. Please try again later.');
      }
    } catch (err) {
      setError('There was a problem sending your message. Please try again later.');
      console.error("Error submitting form:", err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h2 className={styles.heading}>Get In Touch</h2>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputWrapper}>
            <div className={`${styles.iconContainer} ${focusedField === 'name' ? styles.active : ''}`}>
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
              className={styles.input}
              disabled={loading}
            />
          </div>
          
          <div className={styles.inputWrapper}>
            <div className={`${styles.iconContainer} ${focusedField === 'email' ? styles.active : ''}`}>
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
              className={styles.input}
              disabled={loading}
            />
          </div>
                      
          <div className={styles.inputWrapper}>
            <div className={`${styles.iconContainer} ${focusedField === 'message' ? styles.active : ''}`}>
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
              className={`${styles.input} ${styles.textarea}`}
              rows={4}
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.button}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.loading}>Sending...</span>
            ) : (
              <>
                <FiSend />
                <span>Send Message</span>
              </>
            )}
          </button>
          
          {submitSuccess && (
            <div className={styles.success}>
              <FiCheckCircle />
              <p>Thank you! Your message has been sent successfully.</p>
            </div>
          )}
          
          {error && (
            <div className={styles.error}>
              <FiAlertCircle />
              <p>{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}