"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

const HERO_IMAGES = Array.from({ length: 9 }, (_, i) => `/hero/${i + 1}.png`);

function clampIndex(n: number, len: number) {
  if (len <= 0) return 0;
  return ((n % len) + len) % len;
}

export default function Hero() {
  const t = useTranslations("home");

  const texts = useMemo(
    () => [
      {
        line1: t("hero1Line1"),
        line2: t("hero1Line2"),
        line3: t("hero1Line3"),
        line4: t("hero1Line4"),
      },
      {
        line1: t("hero2Line1"),
        line2: t("hero2Line2"),
        line3: null as string | null,
        line4: null as string | null,
      },
    ],
    [t]
  );

  const [index, setIndex] = useState(0);
  const active = clampIndex(index, HERO_IMAGES.length);
  const activeText = texts[active % texts.length];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((i) => i + 1);
    }, 4500);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full overflow-hidden mt-14 bg-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_30%,rgba(255,79,216,0.18),transparent_55%),radial-gradient(ellipse_60%_45%_at_75%_40%,rgba(58,91,255,0.16),transparent_58%)]"
        aria-hidden
      />

      <div className="relative mx-auto grid min-h-[520px] max-w-7xl grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 md:min-h-[560px] md:grid-cols-2 md:py-14 lg:px-10">
        <div className="relative z-10">
          <h1 className="text-balance text-3xl font-semibold leading-tight text-black sm:text-4xl">
            {activeText.line1}
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-black/75 sm:text-lg">
            {activeText.line2}
            {activeText.line3 ? ` ${activeText.line3}` : ""}
            {activeText.line4 ? ` ${activeText.line4}` : ""}
          </p>

         
        </div>
        <div className="relative z-10 flex justify-center md:justify-end">
          <div className="w-[350px] max-w-full">
            <div className="relative h-[500px] w-[350px] max-w-full overflow-hidden rounded-[2rem] bg-black/5 shadow-[0_5px_10px_0_rgba(0,0,0,0.25),0_15px_20px_0_rgba(0,0,0,0.125)]">
            
            {HERO_IMAGES.map((src, i) => (
              
              <div
                key={src}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  i === active ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={i !== active}
              >
                <Image
                  src={src}
                  alt={`Hero image ${i + 1}`}
                  fill
                  priority={i === 0}
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 45vw"
                />
                
              </div>
            ))}

          

            <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-center">
              <div className="flex items-center justify-center gap-1.5 rounded-full  px-2 py-1.5 backdrop-blur">
              {HERO_IMAGES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={`grid h-7 w-7 place-items-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
                    i === active ? "bg-white/25" : "hover:bg-white/15"
                  }`}
                >
                  <span
                    className={`block h-2.5 w-2.5 rounded-full transition ${
                      i === active
                        ? "bg-[#3a5bff]"
                        : "bg-[#3a5bff]/50 hover:bg-[#3a5bff]/85"
                    }`}
                  />
                </button>
              ))}
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}