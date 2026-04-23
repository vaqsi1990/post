'use client';

import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import 'swiper/css';
import 'swiper/css/pagination';

const Middle = () => {
    const t = useTranslations("home");
    const tHeader = useTranslations("header");
    const line1 = t("heroSpeedLine1");
    const line2 = t("heroSpeedLine2");
    const line3 = t("heroSpeedLine3");
    const slide2Title = t("heroSlide2Title");
    const slide2SubtitleLine1 = t("heroSlide2SubtitleLine1");
    const slide2SubtitleLine2 = t("heroSlide2SubtitleLine2");
  return (
    <div className="relative mt-10 h-full md:h-[1500px]">
      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        loop
        pagination={{ clickable: true }}
        autoplay={{ delay: 5500, disableOnInteraction: false }}
       className="h-[600px]"
      >
        {[
          { src: '/hero/resized_image.jpg', alt: 'pricing background 1' },
          { src: '/hero/resized_image.jpg', alt: 'pricing background 2' },
        ].map((slide, idx) => (
          <SwiperSlide key={`${slide.src}-${idx}`} className="h-full">
            <div className="relative  w-full h-[700px] ">
            <Image
        src={slide.src}
        alt={slide.alt}
        fill
        priority
        sizes="100vw"
        className="object-contain"
      />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Middle