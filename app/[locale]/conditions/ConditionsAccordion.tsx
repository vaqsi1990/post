"use client";

import React from "react";
import { motion } from "framer-motion";
import { getConditionsSections } from "./conditionsSections";

type Props = {
  locale: string;
  sectionId?: string;
};

export default function ConditionsAccordion({ locale, sectionId }: Props) {
  const allSections = getConditionsSections(locale);
  const sections =
    sectionId && allSections.some((s) => s.id === sectionId)
      ? allSections.filter((s) => s.id === sectionId)
      : allSections;

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="space-y-3 md:space-y-4">
        {sections.map((section, index) => (
          <motion.article
            key={section.id}
            id={section.id}
            className="relative overflow-hidden rounded-3xl border border-pink-200/60 bg-gradient-to-br from-white via-pink-50 to-indigo-50 shadow-xl p-5 md:p-8"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 px-4 md:px-6 pb-3 md:pb-4">
            
              <h2 className="text-black md:text-[18px] text-[15px] font-semibold text-left">
                {section.title}
              </h2>
            </div>
            <div className="px-4 md:px-6 pb-4 md:pb-5 pt-0 text-black md:text-[16px] text-[14px] leading-relaxed text-left md:text-justify border-t border-gray-100">
              {section.content}
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
