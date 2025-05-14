"use client";

import gsap from "gsap";
import Image from "next/image";
import Nothing from "@/app/components/Nothing";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import NoDataImg from "@/public/assets/noData.png";
import LoadingLogo from "@/app/components/LoadingLogo";
import styles from "@/app/styles/portfolio.module.css";
import { usePortfolioStore } from "@/app/store/Portfolio";
import BannerImg from "@/public/assets/banner.png";

export default function Portfolio() {
  const galleryRef = useRef(null);
  const imagesRef = useRef([]);
  const [isReady, setIsReady] = useState(false);

  const { portfolioItems, fetchPortfolioItems, loading, error } =
    usePortfolioStore();

  useEffect(() => {
    const loadPortfolioData = async () => {
      await fetchPortfolioItems();
      setIsReady(true);
    };

    loadPortfolioData();
  }, [fetchPortfolioItems]);

  useEffect(() => {
    if (!isReady || !portfolioItems.length) return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      ".galleryTitle",
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
    );

    const images = imagesRef.current;

    gsap.fromTo(
      images,
      { y: 120, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        duration: 1,
        ease: "power2.in",
        scrollTrigger: {
          trigger: galleryRef.current,
          start: "top bottom-=100",
          end: "center center",
          toggleActions: "play none none none",
        },
      }
    );

    images.forEach((img) => {
      if (!img) return;

      const overlay = img.querySelector(`.${styles.textOverlay}`);
      const image = img.querySelector("img");
      const textContent = img.querySelector(`.${styles.hoverText}`);
      const title = img.querySelector(`.${styles.hoverTitle}`);
      const content = img.querySelector(`.${styles.hoverContent}`);
      const date = img.querySelector(`.${styles.hoverDate}`);
      const shine = img.querySelector(`.${styles.shineEffect}`);

      if (textContent) {
        gsap.set(textContent, { y: 40, opacity: 0 });
      }

      if (title && content && date) {
        gsap.set([title, content, date], { y: 25, opacity: 0 });
      }

      img.addEventListener("mouseenter", () => {
        const tl = gsap.timeline();

        if (image) {
          tl.to(
            image,
            {
              scale: 1.08,
              filter: "brightness(0.65) contrast(1.15)",
              duration: 0.8,
              ease: "power2.out",
            },
            0
          );
        }

        if (overlay) {
          tl.to(
            overlay,
            {
              opacity: 1,
              duration: 0.6,
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%)",
            },
            0
          );
        }

        if (textContent) {
          tl.to(
            textContent,
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              ease: "power2.out",
            },
            0.1
          );
        }

        if (title && content && date) {
          tl.to(
            title,
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              ease: "power3.out",
            },
            0.2
          );

          tl.to(
            content,
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              ease: "power3.out",
            },
            0.3
          );

          tl.to(
            date,
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              ease: "power3.out",
            },
            0.4
          );
        }

        if (shine) {
          tl.fromTo(
            shine,
            { x: "-100%", opacity: 0.7 },
            { x: "100%", opacity: 0, duration: 1, ease: "power2.inOut" },
            0.1
          );
        }

        // Add a subtle bounce to the container
        tl.to(
          img,
          {
            y: -5,
            duration: 0.4,
            ease: "power2.out",
          },
          0
        );
      });

      // Mouse leave animation
      img.addEventListener("mouseleave", () => {
        const tl = gsap.timeline();

        if (image) {
          tl.to(
            image,
            {
              scale: 1,
              filter: "brightness(1) contrast(1)",
              duration: 0.5,
              ease: "power2.inOut",
            },
            0
          );
        }

        if (overlay) {
          tl.to(
            overlay,
            {
              opacity: 0,
              duration: 0.5,
              background: "rgba(0,0,0,0.2)",
            },
            0
          );
        }

        if (title && content && date) {
          tl.to(
            [date, content, title],
            {
              y: 25,
              opacity: 0,
              duration: 0.3,
              stagger: 0.05,
              ease: "power2.in",
            },
            0
          );
        }

        if (textContent) {
          tl.to(
            textContent,
            {
              y: 40,
              opacity: 0,
              duration: 0.3,
              ease: "power2.in",
            },
            0
          );
        }

        tl.to(
          img,
          {
            y: 0,
            duration: 0.3,
            ease: "power2.inOut",
          },
          0
        );
      });
    });
  }, [isReady, portfolioItems]);

  if (loading && !portfolioItems.length || error && !portfolioItems.length) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingLogo />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.gallery} ref={galleryRef}>
        {portfolioItems.map((item, index) => (
          <div
            key={item._id || index}
            className={`${styles.galleryItem} ${styles.imageItem}`}
            ref={(el) => (imagesRef.current[index] = el)}
          >
            <div className={styles.imageContainer}>
              <Image
                src={item.imageUrl || BannerImg}
                alt={item.title || "Portfolio item"}
                fill
                className={styles.portfolioImage}
                priority={index < 2}
              />
              <div className={`${styles.textOverlay}`}></div>
              <div className={styles.shineEffect}></div>
              <div className={styles.hoverText}>
                <h3 className={styles.hoverTitle}>{item.title}</h3>
                <p className={styles.hoverContent}>
                  {item.content || "No content available"}
                </p>
                <span className={styles.hoverDate}>
                  {item.updatedAt
                    ? `Updated: ${new Date(
                        item.updatedAt
                      ).toLocaleDateString()}`
                    : ""}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isReady && portfolioItems.length === 0 && !loading && !error && (
        <Nothing
          NothingImage={NoDataImg}
          Text="No portfolio items found"
          Alt="No portfolio items found"
        />
      )}

      <div className={styles.buyNowContainer}>
        <span>more than {portfolioItems.length} Clients</span>
          
      </div>
    </div>
  );
}
