"use client";

import Image from "next/image";
import React from "react";
import { useTranslations } from "next-intl";

export default function Hero() {
  const t = useTranslations("home");
  const line1 = t("hero1Line1");
  const line2 = t("hero1Line2");
  const line3 = t("hero1Line3");
  const line4 = t("hero1Line4");

  return (
    <section className="relative w-full overflow-hidden mt-14 bg-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_30%,rgba(255,79,216,0.18),transparent_55%),radial-gradient(ellipse_60%_45%_at_75%_40%,rgba(58,91,255,0.16),transparent_58%)]"
        aria-hidden
      />

      <div className="relative mx-auto grid min-h-[520px] max-w-screen-2xl grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 md:min-h-[560px] md:grid-cols-2 md:py-14 lg:px-10">
        <div className="relative z-10">
          <h1 className="text-balance text-3xl font-semibold leading-tight text-black sm:text-4xl">
            {line1}
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-black/75 sm:text-lg">
            {line2} {line3} {line4}
          </p>

         
        </div>
        <div className="relative z-10 w-full flex justify-center md:justify-end">
          <div className="w-full">
            <div className="relative h-[420px] w-full sm:h-[500px]">
              <Image
                src="/hero/prices.png"
                alt="pricing image"
                fill
                priority
                className="object-contain object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* <div className="absolute -right-14 -top-10 z-10 h-28 w-44 sm:h-36 sm:w-36 lg:h-48 lg:w-48">
                <Image
                  src="/hero/geo.png"
                  alt="geo"
                  fill
                  priority
                  className="object-contain"
                  sizes="(max-width: 640px) 112px, (max-width: 1024px) 144px, 192px"
                />
              </div> */}
          

          
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}