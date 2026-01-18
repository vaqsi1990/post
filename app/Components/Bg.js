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
    "<span>time to</span> be brave",
    "<span>time to</span> be playful",
    "<span>time to</span> design the future",
    "<span>time to</span> meet harrnish",
    "<span>time to</span> see project one",
  ];

  const [currentHeaderIndex, setCurrentHeaderIndex] = useState(0);
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

    // Animate hand rotation automatically like a clock
    if (handRef.current) {
      // Set initial rotation to 0
      gsap.set(handRef.current, { rotation: 0, transformOrigin: "50% 0%" });
      
      // Rotate the hand continuously like a clock (automatic rotation)
      gsap.to(handRef.current, {
        rotation: 360,
        duration: 7, // 7 seconds for one full rotation (faster)
        ease: "none",
        repeat: -1, // Infinite loop
      });
    }

    // Animate hand container scale on scroll
    if (handContainerRef.current && container.current) {
      const updateScale = (self) => {
        // Update current scale based on scroll progress
        const progress = self ? self.progress : 0;
        currentScaleRef.current = 1 - (progress * 0.5); // Goes from 1 to 0.5
      };
      
      gsap.to(handContainerRef.current, {
        scale: 0.5,
        scrollTrigger: {
          trigger: container.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
          onUpdate: updateScale,
          onEnter: updateScale,
          onEnterBack: updateScale,
        },
      });
      
      // Initialize scale
      currentScaleRef.current = 1;
    }

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

    // Animate website content on scroll
    if (websiteContentRef.current && container.current) {
      gsap.fromTo(
        websiteContentRef.current,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: container.current,
            start: "50% top",
            end: "100% top",
            scrub: 1,
          },
        }
      );
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

  // Automatic header text rotation - only when image is near text (scale > 0.7)
  useEffect(() => {
    if (!h1ElementRef.current) return;

    let interval;
    let checkScaleInterval;

    const changeText = () => {
      if (!h1ElementRef.current) return;
      
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

    const checkAndUpdateText = () => {
      // Check if ref exists before proceeding
      if (!h1ElementRef.current) return;
      
      // Only change text when scale is greater than 0.7 (image is near text)
      if (currentScaleRef.current > 0.7) {
        // Start interval if not already running
        if (!interval) {
          interval = setInterval(() => {
            // Double check scale and ref before changing text
            if (currentScaleRef.current > 0.7 && h1ElementRef.current) {
              changeText();
            } else {
              // Stop interval if scale changed
              if (interval) {
                clearInterval(interval);
                interval = null;
              }
            }
          }, 9000); // Change every 6 seconds
        }
      } else {
        // Stop interval when image is far (scale <= 0.7)
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }
    };

    // Small delay to ensure refs are ready
    const timeoutId = setTimeout(() => {
      // Check scale periodically
      checkScaleInterval = setInterval(checkAndUpdateText, 100);

      // Initial check
      checkAndUpdateText();
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      if (interval) clearInterval(interval);
      if (checkScaleInterval) clearInterval(checkScaleInterval);
    };
  }, [introHeaders.length]);
  return (
    <>
      <div className="container" ref={container}>
          <section className="sticky" ref={stickyRef}>
            <div className="hand-container" ref={handContainerRef}>
              <div className="hand" ref={handRef}>
                <img src="/portrait.jpg" alt="" ref={handImageRef} />
              </div>
            </div>

            <div className="intro text-white" ref={introRef}>
              <h1 ref={h1ElementRef}>
                <span>time to</span> be brave
              </h1>
            
            </div>

         
          </section>
          <section className="about">
            <p>(Your next section goes here)</p>
          </section>
        </div>
    </>
  );
}
