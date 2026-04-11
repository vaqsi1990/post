"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

type ServiceTone = "light" | "dark";

type ServiceBlock = {
  num: string;
  imageSrc: string;
  titleKey: "service1" | "service2" | "service3" | "service4";
  descKey:
    | "service1GridDesc"
    | "service2GridDesc"
    | "service3GridDesc"
    | "service4GridDesc";
  tone: ServiceTone;
};

const SERVICES: ServiceBlock[] = [
  {
    num: "01",
    imageSrc: "/transport/1.png",
    titleKey: "service1",
    descKey: "service1GridDesc",
    tone: "light",
  },
  {
    num: "02",
    imageSrc: "/transport/2.png",
    titleKey: "service2",
    descKey: "service2GridDesc",
    tone: "dark",
  },
  {
    num: "03",
    imageSrc: "/transport/3.png",
    titleKey: "service3",
    descKey: "service3GridDesc",
    tone: "light",
  },
  {
    num: "04",
    imageSrc: "/transport/4.png",
    titleKey: "service4",
    descKey: "service4GridDesc",
    tone: "dark",
  },
];

const tonePanelClass: Record<ServiceTone, string> = {
  light: "bg-[#5278f0]",
  dark: "bg-[#1e3a78]",
};

/** Row 1 pairs from left; row 2 pairs from right (staggered entrance) */
const slideFromSide = (serviceIndex: number) =>
  serviceIndex < 2 ? -56 : 56;

const Services = () => {
  const t = useTranslations("home");

  const renderImageCell = (s: ServiceBlock) => (
    <div className="relative h-full min-h-[200px] w-full overflow-hidden sm:min-h-[220px] lg:min-h-0">
      <Image
        src={s.imageSrc}
        alt={t(s.titleKey)}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 25vw"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/25"
        aria-hidden
      />
    </div>
  );

  const renderTextCell = (s: ServiceBlock) => (
    <div
      className={`flex h-full min-h-[200px] flex-col justify-center px-6 py-8 sm:min-h-[220px] lg:min-h-0 lg:px-8 lg:py-10 ${tonePanelClass[s.tone]}`}
    >
      <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.2em] text-white/75">
        {s.num}
      </p>
      <h3 className="mb-3 text-xl font-bold leading-tight text-white sm:text-2xl md:text-[1.65rem]">
        {t(s.titleKey)}
      </h3>
      <p className="text-[15px] leading-relaxed text-white/95 sm:text-base md:text-[17px]">
        {t(s.descKey)}
      </p>
    </div>
  );

  return (
    <>
      <section
        className="relative flex w-full items-center justify-center overflow-hidden bg-white pb-0 md:pb-14"
        aria-labelledby="home-services-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(58,91,255,0.06),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"
          aria-hidden
        />
        <div className="relative z-10 min-w-0 w-full max-w-7xl overflow-x-hidden">
          <div className="overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: -48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="mb-4 text-center md:mb-6"
            >
              <h2
                id="home-services-heading"
                className="text-[18px] font-bold text-black md:text-[30px]"
              >
                {t("servicesTitle")}
              </h2>
            </motion.div>
          </div>

          <div className="min-w-0 overflow-x-hidden">
            {/* Mobile / tablet: stacked cards (image + text each) */}
            <div className="flex flex-col gap-0 lg:hidden">
              {SERVICES.map((s, index) => (
                <motion.article
                  key={s.titleKey}
                  initial={{
                    opacity: 0,
                    x: slideFromSide(index),
                  }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.06,
                    ease: "easeOut",
                  }}
                  className="overflow-hidden rounded-none border-0 bg-white shadow-none"
                >
                  {index < 2 ? (
                    <>
                      {renderImageCell(s)}
                      {renderTextCell(s)}
                    </>
                  ) : (
                    <>
                      {renderTextCell(s)}
                      {renderImageCell(s)}
                    </>
                  )}
                </motion.article>
              ))}
            </div>

            {/* Desktop 4×2: row1 [img|txt][img|txt]; row2 [txt|img][txt|img] — zero gap */}
            <div className="hidden gap-0 overflow-hidden rounded-none border-0 shadow-none lg:grid lg:grid-cols-4 lg:grid-rows-[1fr_1fr] lg:items-stretch">
              {[
                { node: renderImageCell(SERVICES[0]), i: 0 },
                { node: renderTextCell(SERVICES[0]), i: 0 },
                { node: renderImageCell(SERVICES[1]), i: 1 },
                { node: renderTextCell(SERVICES[1]), i: 1 },
                { node: renderTextCell(SERVICES[2]), i: 2 },
                { node: renderImageCell(SERVICES[2]), i: 2 },
                { node: renderTextCell(SERVICES[3]), i: 3 },
                { node: renderImageCell(SERVICES[3]), i: 3 },
              ].map(({ node, i }, cellIdx) => (
                <motion.div
                  key={`cell-${cellIdx}`}
                  className="min-h-0 min-w-0 h-full self-stretch transform-gpu backface-hidden"
                  initial={{ opacity: 0, x: slideFromSide(i) }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.08,
                    ease: "easeOut",
                  }}
                >
                  {node}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;
