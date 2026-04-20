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

  const isFilteredToOneSection =
    Boolean(sectionId) && allSections.some((s) => s.id === sectionId);

  return (
    <div
      className={`mx-auto w-full max-w-4xl px-4${isFilteredToOneSection ? " " : ""}`}
    >
      <div className="space-y-3 md:space-y-4">
        {sections.map((section) => (
          <motion.article
            key={section.id}
            id={section.id}
            className="relative overflow-hidden rounded-3xl  bg-white shadow-xl p-5 md:p-8"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 px-4 md:px-6 pb-3 md:pb-4">
              <h2 className="text-left text-[16px] font-semibold text-black md:text-[18px]">
                {section.title}
              </h2>
            </div>
            <div className="border-t border-gray-100 px-4 pb-4 pt-0 text-[14px] leading-relaxed text-black md:px-6 md:pb-5 md:text-[16px] md:text-justify">
              <p className="m-0">{section.content}</p>
              {section.listItems && section.listItems.length > 0 ? (
                <ul className="conditions-section-list mt-3 list-disc space-y-1.5 pl-5 md:mt-4 md:pl-6">
                  {section.listItems.map((item, i) => (
                    <li key={`${section.id}-li-${i}`}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {section.contentAfterList ? (
                <p className="mt-3 m-0 md:mt-4">{section.contentAfterList}</p>
              ) : null}
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
