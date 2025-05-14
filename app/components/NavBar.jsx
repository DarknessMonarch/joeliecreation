"use client";

import { gsap } from "gsap";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { useDrawerStore } from "@/app/store/Drawer";
import { useEffect, useState, useRef, useCallback } from "react";
import { BsCalendarCheck, BsTelephone } from "react-icons/bs";
import Logo from "@/public/assets/logo.png";
import styles from "@/app/styles/nav.module.css";

import { CgMenuCake as MenuIcon } from "react-icons/cg";
import { RiCloseLargeLine as CloseIcon } from "react-icons/ri";

const WEEK_SCHEDULE = [
  { day: "Monday", hours: "Closed" },
  { day: "Tuesday", hours: "8.30am to 5.30pm" },
  { day: "Wednesday", hours: "8.30am to 12.45pm" },
  { day: "Thursday", hours: "8.30am to 5.30pm" },
  { day: "Friday", hours: "8.30am to 8.00pm" },
  { day: "Saturday", hours: "8.30am to 3.30pm" },
  { day: "Sunday", hours: "Closed" },
];

const navLinksData = [
  { href: "/page/home", label: "Home" },
  { href: "/page/portfolio", label: "Portfolio" },
  { href: "/page/about", label: "About us" },
  { href: "/page/contact", label: "Contact" },
];

export default function NavBar() {
  const router = useRouter();
  const { isOpen, toggleDrawer, closeDrawer } = useDrawerStore();
  const [isMobile, setIsMobile] = useState(false);
  const [isscheduleOpen, setIsscheduleOpen] = useState(false);
  const pathname = usePathname();

  const navOverlayRef = useRef(null);
  const scheduleOverlayRef = useRef(null);
  const navItemsRef = useRef([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isOpen || !navItemsRef.current.length) return;

    const tl = gsap.timeline();

    tl.fromTo(
      navItemsRef.current.filter(Boolean),
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.3,
      }
    );
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isscheduleOpen) {
      setIsscheduleOpen(false);
    }
  }, [isOpen, isscheduleOpen]);

  // Close drawer when route changes (especially important for mobile)
  useEffect(() => {
    if (isOpen) {
      closeDrawer();
    }
  }, [pathname, closeDrawer, isOpen]);

  const toggleschedule = useCallback(() => {
    setIsscheduleOpen((prev) => !prev);
    if (isOpen) closeDrawer();
  }, [isOpen, closeDrawer]);

  const handleNavLinkClick = useCallback(() => {
    if (isMobile) {
      closeDrawer();
    }
  }, [isMobile, closeDrawer]);

  const MakeAppointment = () => {
    toggleschedule();
    router.push("/page/home");
    toast.success("Choose a service from the homepage to make an appointment");
  };

  return (
    <>
      <div className={styles.navLink}>
        <div className={styles.logoContainer} onClick={() => {
          router.push("/page/home");
          if (isOpen) closeDrawer();
        }}>
          <Image
            className={styles.logoImg}
            src={Logo}
            alt="logo"
            height={50}
            priority
          />
        </div>

        <div className={styles.navLinkControls}>
          <button
            className={styles.scheduleButton}
            onClick={toggleschedule}
            aria-label="weekly schedule"
          >
            {isscheduleOpen ? "close schedule" : "show schedule"}
          </button>
          <button
            className={styles.menuToggle}
            onClick={toggleDrawer}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? (
              <CloseIcon className={styles.navIcon} aria-label="Close menu" />
            ) : (
              <MenuIcon className={styles.navIcon} aria-label="Open menu" />
            )}
          </button>
        </div>
      </div>
      <div
        ref={scheduleOverlayRef}
        className={`${styles.scheduleOverlay} ${
          isscheduleOpen ? styles.open : ""
        }`}
        aria-hidden={!isscheduleOpen}
      >
        <div className={styles.scheduleContent}>
          <div className={styles.scheduleContainer}>
            <div className={styles.scheduleActions}>
              <div onClick={MakeAppointment} className={styles.scheduleLink}>
                <BsCalendarCheck size={20} />
                <span>Online appointment</span>
              </div>
              <a href="tel:+14847440421" className={styles.scheduleLink}>
                <BsTelephone size={20} />
                <span>+1 (484) 744 0421</span>
              </a>
            </div>
            <h3 className={styles.scheduleTitle}>WEEKLY SCHEDULE</h3>
            <div className={styles.scheduleGrid}>
              {WEEK_SCHEDULE.map((item, index) => (
                <div key={index} className={styles.scheduleItem}>
                  <span className={styles.scheduleDay}>{item.day}</span>
                  <span className={styles.scheduleHours}>{item.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        ref={navOverlayRef}
        className={`${styles.navOverlay} ${isOpen ? styles.open : ""}`}
        aria-hidden={!isOpen}
      >
        <div className={styles.navContent}>
          <div className={styles.navCardLink}>
            {navLinksData.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                aria-label={link.label}
                className={`${styles.navItem} ${
                  pathname === link.href || pathname.includes(link.href)
                    ? styles.activeNavLink
                    : ""
                }`}
                onClick={handleNavLinkClick}
                ref={(el) => {
                  if (el) navItemsRef.current[index] = el;
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}