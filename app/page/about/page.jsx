"use client";
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from '@/app/styles/about.module.css';
import BannerImg from '@/public/assets/banner.png';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    gsap.fromTo(
      section,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
        },
      }
    );
  }, []);

  const toggleTermsModal = () => {
    setIsTermsModalOpen(!isTermsModalOpen);
  };

  return (
    <>
      <section ref={sectionRef} className={styles.aboutSection}>
        <div className={styles.aboutContainer}>
          <div className={styles.aboutImageWrapper}>
            <Image
              src={BannerImg}
              alt="Professional service banner"
              layout="fill"
              objectFit="cover"
              className={styles.aboutImage}
            />
            <div className={styles.imageOverlay}></div>
          </div>
          <div className={styles.aboutContent}>
            <span className={styles.aboutSubtitle}>About us</span>
            <h2 className={styles.aboutHeading}>Excellence in Every Service</h2>
            <div className={styles.divider}></div>
            <p className={styles.aboutText}>
              <strong>Dedicated to providing top-quality services</strong> customized to meet your unique needs and preferences.
            </p>
            <p className={styles.aboutText}>
              With years of industry experience, our team of professionals is committed to delivering exceptional results. We combine innovative techniques with personalized attention to ensure your complete satisfaction with every service we provide.
            </p>
            
            <div className={styles.termsSection}>
              <p className={styles.termsLink} onClick={toggleTermsModal}>
                Read our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {isTermsModalOpen && (
        <div className={styles.termsModal}>
          <div className={styles.termsContent}>
            <button className={styles.closeModal} onClick={toggleTermsModal}>×</button>
            <h2 className={styles.termsHeading}>Terms & Conditions</h2>
            <div className={styles.modalDivider}></div>
            
            <div className={styles.termsText}>
              <h3>1. Services</h3>
              <p>
                All services provided are subject to availability and professional assessment. 
                We reserve the right to refuse service to anyone for any reason at our discretion.
              </p>
              
              <h3>2. Booking & Cancellation</h3>
              <p>
                Appointments must be canceled at least 24 hours in advance to avoid a cancellation fee.
                No-shows will be charged the full service price.
              </p>
              
              <h3>3. Payment Terms</h3>
              <p>
                We accept various payment methods including credit/debit cards and electronic payments.
                Full payment is due at the time of service unless otherwise arranged.
                Online payments are processed through secure third-party payment processors.
              </p>
              
              <h3>4. Online Payment Security</h3>
              <p>
                All online transactions are secured using industry-standard encryption protocols.
                We do not store your credit card information on our servers.
                By making a payment, you agree to our payment processor's terms of service.
              </p>
              
              <h3>5. Refund Policy</h3>
              <p>
                If you are unsatisfied with our services, please contact us within 48 hours.
                Refunds are issued at our discretion and may be offered as service credit.
                No refunds will be issued for completed services without a valid reason.
              </p>
              
              <h3>6. Privacy Policy</h3>
              <p>
                We collect personal information solely for providing and improving our services.
                Your information will never be sold to third parties.
                By using our services, you consent to our collection and use of your information as described.
              </p>
              
              <h3>7. Liability</h3>
              <p>
                We are not liable for any damages or injuries resulting from misuse of our services or products.
                By using our services, you acknowledge and accept these terms and limitations.
              </p>
              
              <h3>8. Changes to Terms</h3>
              <p>
                We reserve the right to modify these terms at any time without prior notice.
                Continued use of our services constitutes acceptance of any modified terms.
              </p>
              
              <div className={styles.acceptTerms}>
                <button className={styles.acceptButton} onClick={toggleTermsModal}>
                  I Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}