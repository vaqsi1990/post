import Image from "next/image";
import React from "react";
import { useTranslations } from "next-intl";

const Why = () => {
  const t = useTranslations("home");
  const cards = [
    {
      title: t("whyCard1Title"),
      description: t("whyCard1Description"),
      image: "/why/1.png",
      alt: t("whyCard1Title"),
    },
    {
      title: t("whyCard2Title"),
      description: t("whyCard2Description"),
      image: "/why/2.png",
      alt: t("whyCard2Title"),
    },
    {
      title: t("whyCard3Title"),
      description: t("whyCard3Description"),
      image: "/why/3.png",
      alt: t("whyCard3Title"),
    },
  ];

  return (
    <>
      <section className=" mt-10 flex flex-col w-full items-center justify-center overflow-hidden bg-white pb-0 md:pb-14">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-black md:text-3xl">
            {t("whyTitle")}
          </h2>
        </div>

        <div className="grid w-full max-w-7xl grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.title}
              className="rounded-[24px] border border-[#e8e9ff] bg-[#f7f8ff] px-4 pb-6 pt-5 text-center shadow-[0_14px_30px_-24px_rgba(58,91,255,0.55)] transition duration-300 sm:rounded-[28px] sm:px-5 sm:pb-7 sm:pt-6"
            >
              <div className="relative mx-auto mb-4 h-[180px] w-[180px] sm:h-[220px] sm:w-[220px] md:h-[250px] md:w-[250px]">
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  className="object-contain transition duration-300 group-hover:scale-[1.06]"
                />
              </div>
              <h3 className="text-[20px] font-extrabold leading-tight text-[#3a5bff] sm:text-[24px] md:text-[28px]">
                {card.title}
              </h3>
              <div className="mx-auto my-4 h-px w-4/5 bg-[#d8daf5]" />
              <p className="mx-auto max-w-full text-base leading-snug text-black sm:max-w-[24ch] sm:text-[19px] md:max-w-[22ch] md:text-[22px]">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </section>


    </>
  );
};

export default Why;