"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

type Props = {
  isKa: boolean;
  activeServiceId?: string;
};

type ServiceItem = {
  id: string;
  title: string;
  content: string;
};

export default function ServicesAccordion({ isKa, activeServiceId }: Props) {
  const t = useTranslations("home");

  const services: ServiceItem[] = [
    {
      id: "service1",
      title: t("service1"),
      content: t("service1Content"),
    },
    {
      id: "service2",
      title: t("service3"),
      content: t("service3Content"),
    },
    {
      id: "service3",
      title: t("service2"),
      content: t("service2Content"),
    },
    {
      id: "service4",
      title: t("service4"),
      content: t("service4Content"),
    },
  ];

  const pageTitle = isKa ? "სერვისები" : "Services";

  const visibleServices =
    activeServiceId && services.some((s) => s.id === activeServiceId)
      ? services.filter((s) => s.id === activeServiceId)
      : services;

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
        {visibleServices.map((service) => {
          const indexInAll = services.findIndex((s) => s.id === service.id);
          const number = indexInAll + 1;

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
              

              <div className="px-4 md:px-6 pb-4 md:pb-5 pt-0 md:pt-2 text-black/80 md:text-[16px] text-[14px] leading-relaxed border-t border-gray-100 bg-gradient-to-b from-white to-purple-50/40">
                {service.content}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

