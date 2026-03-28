"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type Props = {
  locale: string;
  steps: string[];
};

const IMAGE_ALT: Record<string, string> = {
  ka: "როგორ გამოვიწერო - ნაბიჯები",
  en: "How to order — steps",
  ru: "Как оформить заказ — шаги",
};

export default function HowToSubscribeSection({ locale, steps }: Props) {
  const lang = locale === "ka" ? "ka" : locale === "ru" ? "ru" : "en";
  const alt = IMAGE_ALT[lang] ?? IMAGE_ALT.en;

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        className="mb-8 md:mb-10 flex justify-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl">
          <Image
            src="/how.png"
            alt={alt}
            width={1200}
            height={675}
            className="h-auto w-full object-cover"
            priority
          />
        </div>
      </motion.div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        {steps.map((step, index) => (
          <motion.div
            key={`${lang}-${index}`}
            className="flex items-start gap-3 rounded-xl bg-white shadow-sm border border-gray-100 p-4 md:p-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-indigo-500 text-white text-sm font-bold shrink-0">
              {index + 1}
            </div>
            <p className="text-black md:text-[16px] text-[14px] leading-relaxed">
              {step}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
