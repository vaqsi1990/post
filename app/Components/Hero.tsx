"use client";

import Image from "next/image";
import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Hero() {
  const t = useTranslations("home");
  const line1 = t("heroSpeedLine1");
  const line2 = t("heroSpeedLine2");
  const line3 = t("heroSpeedLine3");

  return (
    <section className=" w-full overflow-hidden mt-14">
      <Image
        src="/hero/prices1.png"
        alt="pricing background"
        fill
        priority
        className="object-cover object-center opacity-90"
        sizes="100vw"
      />
      <div className="relative mx-auto grid min-h-[520px] max-w-screen-1xl grid-cols-1 items-start px-4 py-6 sm:px-6 md:min-h-[560px] md:py-8 lg:px-5">
        <div className="relative z-10 max-w-2xl rounded-2xl p-6 sm:p-8 ">
          <h1 className="text-balance text-[25px] md:text-[30px] text-center lg:text-left font-semibold leading-tight text-white ">
            POSTIFLY
          </h1>
          <p className="mt-4 text-pretty text-[25px] md:text-[30px] leading-relaxed text-white ">
            {line1}
          </p>
          <p className=" text-pretty text-[25px] md:text-[30px] leading-relaxed text-white ">
            {line2}
          </p>
          <Link
            href="#tariffs"
            className="mt-5 inline-flex rounded-lg bg-[#3a5bff] px-6 py-3 text-base font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#3a5bff]"
          >
            {t("tariffsTitle")}
          </Link>
        </div>
        <div className="relative z-10 max-w-2xl rounded-2xl p-6 text-[25px] text-white sm:p-8 md:mt-44 md:text-[30px]">
          {line3}
        </div>
      </div>
    </section>
  );
}