"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

type Props = {
  isKa: boolean;
};

type ServiceItem = {
  id: string;
  title: string;
  content: string;
};

export default function ServicesAccordion({ isKa }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const t = useTranslations("home");

  const services: ServiceItem[] = [
    {
      id: "service1",
      title: t("service1"),
      content: t("service1Content"),
    },
    {
      id: "service2",
      title: t("service2"),
      content: t("service2Content"),
    },
    {
      id: "service3",
      title: t("service3"),
      content: t("service3Content"),
    },
    {
      id: "service4",
      title: t("service4"),
      content: t("service4Content"),
    },
  ];

  const pageTitle = isKa ? "სერვისები" : "Services";

  const handleToggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0">
      <div className="relative mb-8 md:mb-10">
        <div className="absolute -inset-x-10 -inset-y-4 bg-gradient-to-r from-[#7C3AED]/5 via-[#EC4899]/5 to-[#22C55E]/5 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col items-center gap-2">
          <h1 className="text-center text-black md:text-[32px] text-[24px] font-extrabold tracking-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        {services.map((service, index) => {
          const isOpen = openIndex === index;

          return (
            <motion.div
              key={service.id}
              id={service.id}
              className="relative overflow-hidden rounded-3xl border border-pink-200/60 bg-gradient-to-br from-white via-pink-50 to-indigo-50 shadow-xl p-5 md:p-8"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={() => handleToggle(index)}
                className="w-full flex items-center justify-between gap-3 px-4 md:px-6 py-3.5 md:py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm transition-all duration-200 ${
                      isOpen
                        ? "bg-gradient-to-br from-purple-600 to-pink-500 scale-105"
                        : "bg-gradient-to-br from-purple-500 to-indigo-500 group-hover:scale-105"
                    }`}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span className="text-black md:text-[18px] text-[15px] font-semibold group-hover:text-purple-700 transition-colors duration-150">
                    {service.title}
                  </span>
                </div>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition-all duration-200 ${
                    isOpen
                      ? "bg-black text-white rotate-180 border-black"
                      : "bg-white text-black group-hover:border-purple-400 group-hover:text-purple-700"
                  }`}
                  aria-hidden="true"
                >
                  {isOpen ? "–" : "+"}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <div className="px-4 md:px-6 pb-4 md:pb-5 pt-0 md:pt-2 text-black/80 md:text-[16px] text-[14px] leading-relaxed border-t border-gray-100 bg-gradient-to-b from-white to-purple-50/40">
                      {service.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

