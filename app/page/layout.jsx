"use client";

import styles from "@/app/styles/pageLayout.module.css";
import { useDrawerStore } from "@/app/store/Drawer";
import Navbar from "@/app/components/NavBar";
import { useEffect, useState } from "react";

export default function PageLayout({ children }) {
  const { isOpen, toggleDrawer } = useDrawerStore();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const CloseSideNav = () => {
    if (window.innerWidth < 768 && isOpen) {
      toggleDrawer();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className={styles.pageLayout} onClick={CloseSideNav}>
      <Navbar />
      {children}
      <div className={styles.backgroundGradient}></div>
      <div className={styles.glowOrbs}>
        <div className={styles.orb1}></div>
        <div className={styles.orb2}></div>
        <div className={styles.orb3}></div>
      </div>
      <div className={styles.particles}>
        {[...Array(40)].map((_, i) => (
          <div 
            key={i} 
            className={styles.particle}
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s` 
            }}
          ></div>
        ))}
      </div>

      <div 
        className={styles.spotlight}
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`
        }}
      ></div>
    </div>
  );
}