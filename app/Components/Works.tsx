"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const STEPS: {
  id: 1 | 2 | 3;
  imageSrc: string;
  titleKey: "worksStep1Title" | "worksStep2Title" | "worksStep3Title";
  subtitleKey: "worksStep1Subtitle" | "worksStep2Subtitle" | "worksStep3Subtitle";
  altKey: "worksStep1ImageAlt" | "worksStep2ImageAlt" | "worksStep3ImageAlt";
}[] = [
  {
    id: 1,
    imageSrc: "/works/1.png",
    titleKey: "worksStep1Title",
    subtitleKey: "worksStep1Subtitle",
    altKey: "worksStep1ImageAlt",
  },
  {
    id: 2,
    imageSrc: "/works/2.png",
    titleKey: "worksStep2Title",
    subtitleKey: "worksStep2Subtitle",
    altKey: "worksStep2ImageAlt",
  },
  {
    id: 3,
    imageSrc: "/works/5.png",
    titleKey: "worksStep3Title",
    subtitleKey: "worksStep3Subtitle",
    altKey: "worksStep3ImageAlt",
  },
];

function StepBadge({ n }: { n: number }) {
  return (
    <span className="absolute right-5 top-5 grid h-6 w-6 place-items-center rounded-full bg-[#3a5bff] text-xs font-semibold text-white ring-2 ring-[#f5f7fa]">
      {n}
    </span>
  );
}

function ArrowDivider() {
  return (
    <motion.div
      className="hidden items-center justify-center lg:flex"
      aria-hidden="true"
      variants={{
        hidden: { opacity: 0, y: 6 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
      }}
    >
      <div className="flex items-center gap-2 text-slate-300">
        <span className="h-px w-10 bg-slate-200" />
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M10 7l5 5-5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="h-px w-10 bg-slate-200" />
      </div>
    </motion.div>
  );
}

export default function Works() {
  const t = useTranslations("home");
  const viewport = { once: true, amount: 0.25 } as const;

  return (
    <section className="relative mt-10  flex w-full items-center justify-center overflow-hidden bg-white pb-0 md:pb-14">
      <div className="pointer-events-auto mx-auto w-full max-w-8xl overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-md">
        <div className="px-4 py-5 sm:px-6 md:px-8 md:py-7">
          <motion.h2
            className="text-center text-center text-2xl font-semibold text-slate-900 sm:text-3xl"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {t("worksTitle")}
          </motion.h2>

          <motion.div
            className="mt-5 grid grid-cols-1 justify-items-center gap-4 md:mt-6 lg:justify-items-stretch lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
          >
            {STEPS.map((s, idx) => (
              <React.Fragment key={s.id}>
                <motion.div
                  className="flex flex-col items-center gap-3  h-[250px] w-[250px] md:h-full md:w-full rounded-2xl  px-4 py-4 text-center  backdrop-blur-[2px] md:flex-row md:items-center md:gap-4 md:bg-transparent md:px-0 md:py-0 md:text-left md:ring-0 md:backdrop-blur-0"
                  variants={{
                    hidden: { opacity: 0, y: 18, scale: 0.98 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                >
                  <div className="relative h-[170px] w-[170px] shrink-0">
                    <Image
                      src={s.imageSrc}
                      alt={t(s.altKey)}
                      width={150}
                      height={150}
                      className="h-full w-full object-contain object-center"
                      priority={s.id === 1}
                    />
                    <StepBadge n={s.id} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-4 font-semibold text-slate-900 md:text-[18px]">
                      {t(s.titleKey)}
                    </p>
                    <p className="mt-1 text-base leading-snug text-slate-500">
                      {t(s.subtitleKey)}
                    </p>
                  </div>
                </motion.div>

                {idx !== STEPS.length - 1 && <ArrowDivider />}
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
