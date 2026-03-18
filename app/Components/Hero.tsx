'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { useTranslations } from 'next-intl';
import {
  GB,
  US,
  CN,
  IT,
  GR,
  ES,
  FR,
  DE,
  TR,
} from 'country-flag-icons/react/3x2';
const FLAGS: Record<string, React.ComponentType<{ title?: string; className?: string }>> = {
  GB,
  US,
  CN,
  IT,
  GR,
  ES,
  FR,
  DE,
  TR,
};
const Hero = () => {
  const t = useTranslations('home');
  const HERO_TEXTS = useMemo(
    () => [
      {
        line1: t('hero1Line1'),
        line2: t('hero1Line2'),
        line3: t('hero1Line3'),
        line4: t('hero1Line4'),
      },
      {
        line1: t('hero2Line1'),
        line2: t('hero2Line2'),
        line3: null as string | null,
        line4: null as string | null,
      },
    ],
    [t]
  );
  const [textIndex, setTextIndex] = useState(0);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((i) => (i + 1) % HERO_TEXTS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleScrollClick = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div ref={containerRef} className=" bg-[#010002] hero-parallax-container">
      {/* Dark Overlay */}
  
      
      {/* Hero Text — იცვლება ყოველ 3 წამში */}
      <div className="absolute inset-0 z-20 flex items-center justify-start -translate-y-32 md:-translate-y-16">
        <div className="relative pl-6 md:pl-12 lg:pl-20 pr-4 max-w-4xl">
          <div className="mb-4 md:mb-6 flex flex-col items-center gap-3 md:flex-row md:items-center md:gap-4">
            <Image
              src="/guide.png"
              alt="Guide"
              width={256}
              height={256}
              sizes="(max-width: 768px) 160px, 150px"
              className="w-40 h-40 md:w-[150px] md:h-[150px] object-contain rounded-xl bg-white/5 p-2 ring-1 ring-white/10"
              priority
            />
            <div className="min-w-0 w-full md:w-auto">
              <h1 className="mt-3 mb-3 md:mt-2 text-white text-[18px] md:text-[25px] font-semibold leading-snug text-center md:text-left">
                რთულია გამოწერის პროცესი? დარეკე და გადააბარე!!!
              </h1>
              <div className="mt-1 md:mt-3 flex flex-wrap justify-center gap-2 md:grid md:grid-cols-5 md:justify-items-start md:gap-2">
                {Object.entries(FLAGS).map(([code, Flag]) => (
                  
                  <span
                    key={code}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15"
                  >
                    <Flag title={code} className="h-4 w-6 md:h-5 md:w-7 rounded-sm" />
                    <span className="text-white/80 text-[11px] md:text-[12px] font-medium">
                      {code}
                    </span>
                  </span>
                ))}
              </div>
             
            </div>
            
          </div>
          {HERO_TEXTS.map((text, i) => (
            <h1
              key={i}
              className={`md:text-[25px] text-[18px] text-white font-medium md:text-left text-center transition-opacity duration-500 ${
                textIndex === i
                  ? 'opacity-100 relative'
                  : 'opacity-0 absolute left-6 md:left-12 lg:left-20 top-0 pointer-events-none'
              }`}
            >
              {text.line1}
              {text.line2 && (
                <>
                  <br />
                  <span className="inline-block md:text-[30px] text-[20px] space-x-2 mt-5 text-white ">
                    {text.line2}
                  </span>
                </>
              )}
              {text.line3 && (
                <>
                  <br />
                  <span className="inline-block md:text-[30px] text-[20px] space-x-2 mt-5 text-white ">
                    {text.line3}
                  </span>
                </>
              )}
              {text.line4 && (
                <>
                  <br />
                  <span className="inline-block md:text-[30px] text-[20px] space-x-2 mt-5 text-white ">
                    {text.line4}
                  </span>
                </>
              )}
            </h1>
          ))}
        </div>
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