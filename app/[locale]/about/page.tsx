"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

type Props = {
  params: { locale: string };
};

const containerVariants = {
  hidden: { opacity: 0, scale: 0.98, rotateX: -6 },
  visible: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.08,
    },
  },
};

const paragraphVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export default function AboutPage(_props: Props) {
  const t = useTranslations("about");

  return (
    <section className="w-full pt-14 mt-14 md:pt-20 pb-16 md:pb-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 md:px-0">
        <div className="relative mb-8 md:mb-12">
          <div className="absolute -inset-x-10 -inset-y-4 bg-gradient-to-r from-[#7C3AED]/10 via-[#EC4899]/10 to-[#22C55E]/10 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col items-center gap-3">
            <h1 className="text-center text-black md:text-[32px] text-[24px] font-extrabold tracking-tight">
              {t("title")}
            </h1>
          </div>
        </div>

        <motion.div
          className="relative overflow-hidden rounded-3xl border border-pink-200/60 bg-gradient-to-br from-white via-pink-50 to-indigo-50 shadow-xl p-6 md:p-10 space-y-4 md:space-y-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          whileHover={{ rotateX: 2, scale: 1.01 }}
        >
          <motion.p
            className="text-black md:text-[18px] text-[16px] leading-relaxed text-justify"
            variants={paragraphVariants}
          >
            {t("intro1")}
          </motion.p>
          <motion.p
            className="text-black md:text-[18px] text-[16px] leading-relaxed text-justify"
            variants={paragraphVariants}
          >
            {t("intro2")}
          </motion.p>
          <motion.p
            className="text-black md:text-[18px] text-[16px] leading-relaxed text-justify"
            variants={paragraphVariants}
          >
            {t("intro3")}
          </motion.p>
          <motion.p
            className="text-black md:text-[18px] text-[16px] leading-relaxed text-justify"
            variants={paragraphVariants}
          >
            {t("intro4")}
          </motion.p>
          <motion.p
            className="text-black md:text-[18px] text-[16px] leading-relaxed text-justify"
            variants={paragraphVariants}
          >
            {t("intro5")}
          </motion.p>

          <motion.div
            className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-indigo-100"
            variants={paragraphVariants}
          >
            <h2 className="text-black md:text-[22px] text-[18px] font-bold mb-3 md:mb-4">
              {t("requisitesTitle")}
            </h2>
            <p className="text-black md:text-[18px] text-[16px] leading-relaxed text-justify whitespace-pre-line">
              {t("requisitesContent")}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

