"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Bg() {
  const container = useRef(null);
  const stickyRef = useRef(null);
  const handContainerRef = useRef(null);
  const handRef = useRef(null);
  const handImageRef = useRef(null);
  const introRef = useRef(null);
  const h1ElementRef = useRef(null);
  const introCopyRef = useRef(null);
  const websiteContentRef = useRef(null);

  const introHeaders = [
    "<span>დროა</span> მიიღო შენი ამანათი",
    "<span>დროა</span> მარტივი შოპინგის",
    "<span>დროა</span> საიმედო გადაზიდვის",
    "<span>დროა</span> სწრაფი მიწოდების",
  ];
  const [currentHeaderIndex, setCurrentHeaderIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const currentScaleRef = useRef(1);

  useGSAP(() => {
    if (typeof window === 'undefined') return;
    
    const lenis = new Lenis({
      lerp: 0.1,
      syncTouch: true,
    });
  
    let rafId;
    function raf(time) {
      lenis.raf(time);
      ScrollTrigger.update();
      rafId = requestAnimationFrame(raf);
    }
  
    rafId = requestAnimationFrame(raf);
  
    ScrollTrigger.scrollerProxy(window, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });
  
    // Reset scroll position on mount
    lenis.scrollTo(0, { immediate: true });
  
    // Animate hand image fade in
    if (handImageRef.current) {
      gsap.to(handImageRef.current, {
        opacity: 1,
        duration: 1.5,
        ease: "power2.out",
      });
    }

    // Disable scroll during loading
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    }

    // Animate hand rotation - 1 full rotation then transition to main page
    if (handRef.current && handContainerRef.current && introRef.current) {
      // Set initial rotation to 0
      gsap.set(handRef.current, { rotation: 0, transformOrigin: "50% 0%" });
      
      // Create timeline for 1 rotation
      const rotationTimeline = gsap.timeline({
        onComplete: () => {
          // After 1 rotation, transition to main page
          if (handContainerRef.current && introRef.current) {
            // Fade out intro text
            gsap.to(introRef.current, {
              opacity: 0,
              y: -50,
              duration: 1,
              ease: "power2.in",
            });

            // Move hand container to center and scale down
            gsap.to(handContainerRef.current, {
              scale: 0.3,
              x: 0,
              y: 0,
              duration: 2,
              ease: "power2.inOut",
              onComplete: () => {
                // Fade out hand container
                gsap.to(handContainerRef.current, {
                  opacity: 0,
                  duration: 1,
                  ease: "power2.out",
                  onComplete: () => {
                    // Loading complete - enable scroll and show main content
                    setIsLoading(false);
                    document.body.style.overflow = '';
                    
                    // Fade out loading screen
                    if (stickyRef.current) {
                      gsap.to(stickyRef.current, {
                        opacity: 0,
                        duration: 0.5,
                        ease: "power2.out",
                        onComplete: () => {
                          if (stickyRef.current) {
                            stickyRef.current.style.display = 'none';
                          }
                        },
                      });
                    }
                  },
                });
              },
            });
          }
        },
      });

      // Rotate 1 time (360 degrees)
      rotationTimeline.to(handRef.current, {
        rotation: 360, // 1 full rotation
        duration: 5, // 5 seconds for faster rotation
        ease: "none",
      });
    }

    // Don't animate scale on scroll during loading
    // Initialize scale
    currentScaleRef.current = 1;

      // Animate intro text with initial fade in
      if (introRef.current && h1ElementRef.current && container.current) {
        // Initial fade in
        gsap.fromTo(
          h1ElementRef.current,
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.5,
            ease: "power2.out",
          }
        );

      if (introCopyRef.current) {
        const paragraphs = introCopyRef.current.querySelectorAll("p");
        gsap.fromTo(
          paragraphs,
          {
            opacity: 0,
            x: 20,
          },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            delay: 1,
            stagger: 0.2,
            ease: "power2.out",
          }
        );
      }
    }

  
    ScrollTrigger.refresh();
  
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
      if (typeof window !== 'undefined') {
        ScrollTrigger.scrollerProxy(window, {});
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      }
    };
  }, { scope: container });

  // Cleanup: restore body overflow on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Automatic header text rotation during loading
  useEffect(() => {
    if (!h1ElementRef.current || !isLoading) return;

    let interval;

    const changeText = () => {
      if (!h1ElementRef.current || !isLoading) return;
      
      setCurrentHeaderIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % introHeaders.length;
        
        // Check if ref still exists before animating
        if (!h1ElementRef.current) return prevIndex;
        
        // Animate out current text
        gsap.to(h1ElementRef.current, {
          opacity: 0,
          y: -30,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            // Check if ref still exists before updating
            if (!h1ElementRef.current) return;
            
            // Update text
            h1ElementRef.current.innerHTML = introHeaders[nextIndex];
            
            // Check again before animating in
            if (!h1ElementRef.current) return;
            
            // Animate in new text
            gsap.fromTo(
              h1ElementRef.current,
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
            );
          },
        });
        
        return nextIndex;
      });
    };

    // Start text rotation during loading
    interval = setInterval(() => {
      if (isLoading && h1ElementRef.current) {
        changeText();
      } else {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }
    }, 3000); // Change every 3 seconds during loading

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [introHeaders.length, isLoading]);
  return (
    <>
      {/* Loading Screen */}
      {isLoading && (
        <div className="container loading-screen" ref={container}>
          <section className="sticky" ref={stickyRef}>
            <div className="hand-container" ref={handContainerRef}>
              <div className="hand" ref={handRef}>
                <img src="/portrait.jpg" alt="" ref={handImageRef} />
              </div>
            </div>

            <div className="intro text-white" ref={introRef}>
              <h1 ref={h1ElementRef}>
                <span>დროა</span> მიიღო რაც გინდა
              </h1>
            </div>
          </section>
        </div>
      )}

   
    </>
  );
}
