"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

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
    <div className="hidden items-center justify-center lg:flex" aria-hidden="true">
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
    </div>
  );
}

export default function Works() {
  const t = useTranslations("home");

  return (
    <section className="relative mt-14 md:mt-24 flex w-full items-center justify-center overflow-hidden bg-white pb-0 md:pb-14">
      <div className="pointer-events-auto mx-auto w-full max-w-8xl overflow-hidden rounded-2xl border border-[#e8eaf0] bg-[#f5f7fa] shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div className="px-4 py-5 sm:px-6 md:px-8 md:py-7">
          <h2 className="text-center text-lg font-semibold text-slate-900 md:text-xl">
            {t("worksTitle")}
          </h2>

          <div className="mt-5 grid grid-cols-1 justify-items-center gap-4 md:mt-6 lg:justify-items-stretch lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
            {STEPS.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-3  h-[250px] w-[250px] md:h-full md:w-full rounded-2xl bg-white/70 px-4 py-4 text-center ring-1 ring-[#e8eaf0] backdrop-blur-[2px] md:flex-row md:items-center md:gap-4 md:bg-transparent md:px-0 md:py-0 md:text-left md:ring-0 md:backdrop-blur-0">
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
                    <p className="text-sm font-semibold text-slate-900 md:text-[15px]">
                      {t(s.titleKey)}
                    </p>
                    <p className="mt-1 text-sm leading-snug text-slate-500">
                      {t(s.subtitleKey)}
                    </p>
                  </div>
                </div>

                {idx !== STEPS.length - 1 && <ArrowDivider />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
