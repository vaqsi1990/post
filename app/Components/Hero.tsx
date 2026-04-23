"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Hero() {
  const t = useTranslations("home");
  const tHeader = useTranslations("header");
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === 0 ? 1 : 0));
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full overflow-hidden mt-14">
      <h1 className="sr-only">{t("h1")}</h1>
      <div className="relative h-[420px] sm:h-[520px] lg:h-[600px]">
        <Image
          src="/hero/Artboard1.png"
          alt="pricing background"
          fill
          priority
          quality={85}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
          className={`absolute inset-0 h-full w-full object-cover object-left sm:object-center transition-opacity duration-1000 ease-in-out ${
            activeSlide === 0 ? "opacity-90" : "opacity-0"
          }`}
        />
        <Image
          src="/hero/Artboard2.jpg"
          alt="pricing background alternate"
          fill
          quality={85}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
          className={`absolute inset-0 h-full w-full object-cover object-left sm:object-center transition-opacity duration-1000 ease-in-out ${
            activeSlide === 1 ? "opacity-90" : "opacity-0"
          }`}
        />
      </div>
      {activeSlide === 0 && (
        <div className="absolute inset-0 mx-auto flex h-full w-full max-w-screen-1xl items-center justify-start px-4 sm:px-6 lg:px-5">
          <div className="relative z-10 flex w-full max-w-2xl translate-y-6 flex-col items-start rounded-2xl p-6 sm:p-8 sm:translate-y-8">
            <Link
              href="#tariffs"
              className="mt-32 inline-flex w-[150px] items-center justify-center rounded-xl bg-[#3a5bff] px-6 py-3 text-base font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#3a5bff]"
            >
              {t("tariffsTitle")}
            </Link>
          </div>
        </div>
      )}
      {activeSlide === 1 && (
        <div className="absolute inset-0 mx-auto flex h-full w-full max-w-screen-1xl items-center justify-start px-4 sm:px-6 lg:px-5">
          <div className="relative z-10 flex w-full max-w-2xl translate-y-6 flex-col items-start rounded-2xl pt- p-6 sm:p-8 sm:translate-y-8">
            <div className="mt-32 flex w-full items-center justify-start gap-3">
            <Link
              href="/register"
              className="w-[150px] rounded-xl inline-flex items-center justify-center text-center bg-[#3a5bff] px-6 py-3 text-base font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#3a5bff]"
            >
              {t("heroRegisterCta")}
            </Link>
            <Link
              href="/tracking"
              className="w-[150px] rounded-xl inline-flex items-center justify-center text-center bg-[#ff4fd8] px-6 py-3 text-base font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#3a5bff]"
            >
              {tHeader("tracking")}
            </Link>
          </div>
          </div>
        </div>
      )}
      <div className="absolute right-5 lg:right-10 xl:right-16 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-3">
        {[0, 1].map((slideIndex) => (
          <button
            key={slideIndex}
            type="button"
            onClick={() => setActiveSlide(slideIndex)}
            aria-label={`Go to slide ${slideIndex + 1}`}
            className={`h-3 w-3 rounded-full transition-colors duration-300 ${
              activeSlide === slideIndex ? "bg-[#3a5bff]" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </section>
  );
}