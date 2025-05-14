  "use client";
  import Image from "next/image";
  import { toast } from "sonner";
  import { useRouter } from "next/navigation";
  import { useEffect, useState } from "react";
  import styles from "@/app/styles/home.module.css";
  import LoadingLogo from "@/app/components/LoadingLogo";
  import { useServiceStore } from "@/app/store/Service";
  import DefaultServiceImage from "@/public/assets/service.png";

  export default function Service() {
    const router = useRouter();
    const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
    const { services, loading, error, fetchServices } = useServiceStore();
    
    useEffect(() => {
      const loadServices = async () => {
        try {
          const result = await fetchServices();
          
          if (!result.success) {
            toast.error(result.message || "Failed to fetch services");
          }
        } catch (error) {
          toast.error("Failed to fetch services data");
          console.error("Error fetching services:", error);
        }
      };

      loadServices();
    }, [fetchServices]);

    useEffect(() => {
      if (services.length === 0) return;
      
      const interval = setInterval(() => {
        setCurrentServiceIndex((prevIndex) =>
          prevIndex === services.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); 

      return () => clearInterval(interval);
    }, [services.length]);

    const defaultService = {
      title: loading ? "Loading..." : "No Services",
      description: loading ? "Please wait" : "No services available",
      breadcrumb: loading ? "Loading" : "Services",
      image: DefaultServiceImage,
    };

    const currentService = services.length > 0 ? services[currentServiceIndex] : defaultService;

    const goToNextService = () => {
      if (services.length === 0) return;
      setCurrentServiceIndex((prevIndex) =>
        prevIndex === services.length - 1 ? 0 : prevIndex + 1
      );
    };

    const goToPrevService = () => {
      if (services.length === 0) return;
      setCurrentServiceIndex((prevIndex) =>
        prevIndex === 0 ? services.length - 1 : prevIndex - 1
      );
    };

    const bookService = (serviceId) => () => {
      if (serviceId) {
        router.push(`/page/home/${serviceId}`);
      } else {
        toast.error("Service ID is missing");
      }
    };

    if (error || loading || services.length === 0) {
      return <div className={styles.homeContainer}><LoadingLogo /></div>;
    }


    return (
      <div className={styles.homeContainer}>
        <div className={styles.serviceContent}>
          <div className={styles.serviceTextSide}>
            <span>{currentService.breadcrumb}</span>
            <div className={styles.serviceTextContent}>
              <p>{currentService.description}</p>
              <div className={styles.serviceDetails}> 
                <h1>{currentService.title}</h1>
                <div className={styles.serviceCounter}>
                  {services.length > 0 ? `${currentServiceIndex + 1}/${services.length}` : "0/0"}
                </div>
              </div>
            
              <button 
                className={styles.serviceButton} 
                onClick={bookService(currentService._id)}
                disabled={services.length === 0}
              >
                book this service
              </button>
            </div>
          </div>

          <div className={styles.diagonalPattern}></div>
          <div className={styles.serviceImageSide}>
            <Image
              className={styles.serviceImage}
              src={currentService.image || DefaultServiceImage}
              alt={`${currentService.title} image`}
              fill
              quality={100}
              sizes="100%"
              style={{
                objectFit: "cover",
              }}
              priority={true}
            />
          </div>
        </div>

        <div className={styles.navigationArrows}>
          <button 
            className={styles.navArrow} 
            onClick={goToPrevService}
            disabled={services.length === 0}
          >
            &#10094;
          </button>
          <button 
            className={styles.navArrow} 
            onClick={goToNextService}
            disabled={services.length === 0}
          >
            &#10095;
          </button>
        </div>
      </div>
    );
  }