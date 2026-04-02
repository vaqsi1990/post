"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Hero() {
  const t = useTranslations("home");
  const tHeader = useTranslations("header");
  const line1 = t("heroSpeedLine1");
  const line2 = t("heroSpeedLine2");
  const line3 = t("heroSpeedLine3");
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === 0 ? 1 : 0));
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full overflow-hidden mt-14">
      <div className="relative h-[560px] md:h-[600px]">
        <Image
          src="/hero/hero1.jpg"
          alt="pricing background"
          width={1700}
          height={500}
          className={`h-full w-full object-cover image object-center transition-opacity duration-1000 ease-in-out ${
            activeSlide === 0 ? "opacity-90" : "opacity-0"
          }`}
        />
        <Image
          src="/hero/hero2.jpg"
          alt="pricing background alternate"
          width={1700}
          height={500}
          className={`absolute  inset-0 h-full w-full object-cover image object-center transition-opacity duration-1000 ease-in-out ${
            activeSlide === 1 ? "opacity-90" : "opacity-0"
          }`}
        />
      </div>
      {activeSlide === 0 && (
        <div className="absolute inset-0 mx-auto grid h-full max-w-screen-1xl grid-cols-1 content-start px-4 py-6 sm:px-6 md:py-8 lg:px-5">
          <div className="relative z-10 flex justify-center  flex-col max-w-2xl rounded-2xl p-6 sm:p-8 ">
            <p className="text-balance text-[25px] md:text-[30px] font-semibold leading-tight text-white ">
              Postifly
            </p>
            <p className="mt-4 text-pretty text-[25px] md:text-[30px]  leading-relaxed text-white ">
              {line1}
            </p>
            <p className=" text-pretty text-[25px] md:text-[30px] leading-relaxed text-white ">
              {line2}
            </p>
            <Link
              href="#tariffs"
              className="mt-5 w-[150px] rounded-xl inline-flex flex justify-center items-center  text-centerrounded-lg text-center bg-[#3a5bff] px-6 py-3 text-base font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#3a5bff] mx-auto lg:mx-0"
            >
              {t("tariffsTitle")}
            </Link>
          </div>
          <div className="relative z-10 max-w-2xl rounded-2xl p-6 text-center text-[25px] text-white  md:text-start md:text-[30px]">
            {line3}
          </div>
        </div>
      )}
      {activeSlide === 1 && (
        <div className="absolute inset-x-0 bottom-1 z-10 mx-auto flex max-w-screen-1xl justify-center px-4 sm:px-6 lg:px-5">
          <div className="flex flex-wrap  items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-[150px] rounded-xl inline-flex items-center justify-center text-center bg-[#3a5bff] px-6 py-3 text-base font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#3a5bff]"
            >
             რეგისტრაცია
            </Link>
            <Link
              href="/tracking"
              className="w-[150px] rounded-xl inline-flex items-center justify-center text-center bg-[#ff4fd8] px-6 py-3 text-base font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#3a5bff]"
            >
              {tHeader("tracking")}
            </Link>
          </div>
        </div>
      )}
      <div className="absolute right-5 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-3">
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