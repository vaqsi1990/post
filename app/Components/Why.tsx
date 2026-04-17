"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import {
  FaBolt,
  FaDollarSign,
  FaLocationDot,
  FaShieldHalved,
} from "react-icons/fa6";

const FEATURES: {
  titleKey: "whyCard1Title" | "whyCard2Title" | "whyCard3Title" | "whyCard4Title";
  descKey:
    | "whyCard1Description"
    | "whyCard2Description"
    | "whyCard3Description"
    | "whyCard4Description";
  Icon: IconType;
  iconWrap: string;
}[] = [
  {
    titleKey: "whyCard1Title",
    descKey: "whyCard1Description",
    Icon: FaBolt,
    iconWrap: "bg-sky-100 text-sky-600",
  },
  {
    titleKey: "whyCard2Title",
    descKey: "whyCard2Description",
    Icon: FaDollarSign,
    iconWrap: "bg-amber-100 text-amber-600",
  },
  {
    titleKey: "whyCard3Title",
    descKey: "whyCard3Description",
    Icon: FaShieldHalved,
    iconWrap: "bg-emerald-100 text-emerald-600",
  },
  {
    titleKey: "whyCard4Title",
    descKey: "whyCard4Description",
    Icon: FaLocationDot,
    iconWrap: "bg-rose-100 text-rose-600",
  },
];

const Why = () => {
  const t = useTranslations("home");

  return (
    <section
      className="pointer-events-none mt-14 relative bottom-0 left-0 right-0 z-30 mt-0 w-full translate-y-0 px-4 pb-0 md:absolute md:-translate-y-1/2 md:px-5"
      aria-labelledby="why-heading"
    >
      

      <motion.div
        className="pointer-events-auto mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-[#e8eaf0] bg-[#f5f7fa] shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col  md:flex-row ">
          {FEATURES.map(({ titleKey, descKey, Icon, iconWrap }) => (
            <div
              key={titleKey}
              className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5 sm:gap-3.5 sm:px-5 sm:py-4"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 ${iconWrap}`}
                aria-hidden
              >
                <Icon className="h-[1.1rem] w-[1.1rem] sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0 text-left">
                <h3 className="text-sm font-bold leading-snug text-[#1a2550] sm:text-[0.95rem] md:text-base">
                  {t(titleKey)}
                </h3>
                <p className="mt-0.5 text-xs leading-snug text-[#6b7280] sm:text-[0.8125rem] md:text-sm">
                  {t(descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Why;
