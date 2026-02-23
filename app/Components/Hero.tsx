
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const Hero = () => {
  const layer0Ref = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const xAxisRef = useRef<HTMLDivElement>(null);
  const yAxisRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const container_w = container.offsetWidth;
      const container_h = container.offsetHeight;
      const pos_x = event.pageX;
      const pos_y = event.pageY;

      const left = container_w / 2 - pos_x;
      const top = container_h / 2 - pos_y;

      if (xAxisRef.current) {
        gsap.to(xAxisRef.current, {
          duration: 1,
          x: left * -1,
          ease: 'expo.out',
          overwrite: true,
        });
      }

      if (yAxisRef.current) {
        gsap.to(yAxisRef.current, {
          duration: 1,
          y: top * -1,
          ease: 'expo.out',
          overwrite: true,
        });
      }

      if (layer2Ref.current) {
        gsap.to(layer2Ref.current, {
          duration: 1,
          x: left / 24,
          y: top / 12,
          ease: 'expo.out',
          overwrite: true,
        });
      }

      if (layer1Ref.current) {
        gsap.to(layer1Ref.current, {
          duration: 1,
          x: left / 8,
          y: top / 4,
          ease: 'expo.out',
          overwrite: true,
        });
      }

      if (layer0Ref.current) {
        gsap.to(layer0Ref.current, {
          duration: 10,
          rotation: left / 200,
          ease: 'expo.out',
          overwrite: false,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleScrollClick = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div ref={containerRef} className="hero-parallax-container">
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      
      {/* Hero Text */}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <h1 className="md:text-[25px] text-[18px] text-white font-medium text-center px-4 max-w-4xl">
        გამოიწერე მარტივად,  <br/> <span className='inline-block md:text-[30px] text-[20px] space-x-2 mt-10 text-white tracking-[20px]'> მიიღე სწრაფად </span>  
        </h1>
      </div>
     

   
      <div id="background" ref={layer0Ref} className="layer-0"></div>
      <div id="x-axis" ref={xAxisRef} className="axis"></div>
      <div id="y-axis" ref={yAxisRef} className="axis"></div>
      <div id="planet-1" ref={layer1Ref} className="planet layer-1"></div>
      <div id="planet-2" ref={layer2Ref} className="planet layer-2"></div>
    </div>
  );
};

export default Hero;