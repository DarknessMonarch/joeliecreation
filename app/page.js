"use client";

import Image from "next/image";
import { toast } from "sonner";
import Cart from "@/app/components/Cart";
import { useEffect, useState } from "react";
import { useCartStore } from "@/app/store/Cart";
import styles from "@/app/styles/food.module.css";
import Logo from "@/public/assets/coloredlogo.png";
import { useServiceStore } from "@/app/store/Service";
import DefaultServiceImage from "@/public/assets/food.png";
import LoadingLogo from "@/app/components/ColoredLoadingLogo";

import { IoTime as TimeIcon } from "react-icons/io5";
import { IoCart as CartIcon } from "react-icons/io5";
import { IoMdAdd as AddIcon } from "react-icons/io";
import { IoFilterSharp as FilterIcon } from "react-icons/io5";

export default function Food() {
  const { services, loading, error, fetchServices } = useServiceStore();
  const { addToCart, openCart } = useCartStore();
  const [selected, setSelected] = useState(null);
  const [foodServices, setFoodServices] = useState([]);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const result = await fetchServices();

        if (!result.success) {
          toast.error(result.message || "Failed to fetch services",
            {
              style: {
                background: "#4caf50",
                color: "#ffffff",
              },
            }
          );
        }
      } catch (error) {
        toast.error("Failed to fetch services data", {
          style: {
            background: "#4caf50",
            color: "#ffffff",
          },
        }
        );
      }
    };

    loadServices();
  }, [fetchServices]);

  useEffect(() => {
    if (services.length > 0) {
      const filteredServices = services.filter(service =>
        service.breadcrumb && service.breadcrumb.toLowerCase().includes('food')
      );
      setFoodServices(filteredServices);
      if (filteredServices.length > 0 && !selected) {
        setSelected(filteredServices[0]);
      }
    }
  }, [services, selected]);

  const handleAddToCart = (service) => {
    addToCart(service);
    toast.success(`${service.title} added to cart`, {
      style: {
        background: "#4caf50",
        color: "#ffffff",
      },
    });
    openCart();
  };

  if (error || loading || foodServices.length === 0) {
    return <div className={styles.foodWrap}><LoadingLogo /></div>;
  }

  return (
    <div className={styles.foodWrap}>
      <div className={styles.foodHeader}>
        <Image
          className={styles.foodLogo}
          src={Logo}
          alt="Food Logo"
          height={50}
          priority
        />
        <div className={styles.foodCart} onClick={() => openCart()}>
          <CartIcon height={20} width={20} className={styles.cartIcon} />
          Cart
        </div>
      </div>
      <div className={styles.foodDivider}>
        <div className={styles.foodContainer}>
          <div className={styles.foodTitle}>
            <div className={styles.foodTitleInner}>
              <h1>Meal Category</h1>
              <FilterIcon height={20} width={20} className={styles.filterIcon} alt="Filter Icon" />
            </div>
            <div className={styles.mealFilter}>
              {foodServices.map((service, index) => (
                <button
                  key={service._id || index}
                  className={`${styles.mealButton} ${selected?._id === service._id ? styles.filteredCard : ""}`}
                  onClick={() => setSelected(service)}
                >
                  {service.title}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.foodContent}>
            {selected && (
              <div className={styles.foodContentInfo}>
                <div className={styles.foodImageContainer}>
                  <Image
                    src={selected.image || DefaultServiceImage}
                    alt={selected.title}
                    fill
                    style={{ objectFit: "contain" }}
                    className={styles.foodImage}
                    priority
                  />
                </div>
                <div className={styles.foodInfo}>
                  <div className={styles.foodinfoinner}>
                    <h1>{selected.title}</h1>
                    <p>{selected.description}</p>
                  </div>
                  <div className={styles.foodDuration}>
                    <TimeIcon className={styles.timeIcon} alt="Time Icon" />
                    <span>{selected.duration}</span>
                  </div>
                  <button
                    className={styles.addToCartBtn}
                    onClick={() => handleAddToCart(selected)}
                  >
                    <span>${selected.price}</span>
                    <span>|</span>
                    Add to Cart
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className={styles.foodSlideFooter}>
            <h4>Meals available</h4>
            <div className={styles.foodSlide}>
              {foodServices.map((service, index) => (
                <div
                  key={service._id || index}
                  className={`${styles.foodItem} ${selected?._id === service._id ? styles.selected : ""}`}
                  alt={service.title}
                  onClick={() => setSelected(service)}
                >
                  <div className={styles.foodItemImage}>
                    <Image
                      className={styles.foodImage}
                      src={service.image || DefaultServiceImage}
                      alt={service.title}
                      fill
                      style={{ objectFit: "contain" }}
                      priority
                    />
                  </div>
                  <div className={styles.foodCardFooter}>
                    <h3>{service.title}</h3>
                    <div className={styles.foodCardInner}>
                      <p>${service.price}</p>
                      <button
                        className={styles.foodButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(service);
                        }}
                      >
                        <AddIcon className={styles.addIcon} alt="Add Icon" height={20} width={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Cart />
      </div>
    </div>
  );
}