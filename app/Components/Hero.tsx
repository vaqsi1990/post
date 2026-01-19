"use client";

import React, { useEffect, useRef } from "react";

const Hero = () => {
  const imageRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!imageRef.current || !sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate scroll position relative to section
      // When section top is at viewport top: rect.top = 0, offset should be 0
      // As we scroll, rect.top decreases (becomes negative)
      const scrollPosition = -rect.top;
      
      // Parallax effect: background moves slower than scroll
      // Adjust the multiplier (0.5) to control parallax strength
      // Lower values = less movement, higher values = more movement
      const parallaxOffset = scrollPosition * 0.5;
      
      imageRef.current.style.transform = `translateY(${parallaxOffset}px)`;
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen overflow-hidden"
    >
      {/* Background parallax layer */}
      <div ref={imageRef} className="parallax img1"></div>
      
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/60 z-[1]"></div>
      
      {/* Content layer - stays fixed */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="par md:text-[30px] text-[20px] text-white">გამოიწერეთ ნივთები ჩვენთან ერთად</div>
      </div>
    </section>
  );
};

export default Hero;
