'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { useTranslations } from 'next-intl';
import 'swiper/css';
import 'swiper/css/pagination';

const Middle = () => {
  const t = useTranslations('home');
  const tHeader = useTranslations('header');

  const slides = useMemo(
    () => [
      {
        src: '/hero/resized_image.jpg',
        alt: 'hero background 1',
        eyebrow: t('heroSpeedLine1'),
        title: t('heroSpeedLine2'),
        subtitle: t('heroSpeedLine3'),
      },
      {
        src: '/hero/resized_image2.jpg',
        alt: 'hero background 2',
        eyebrow: t('heroSlide2SubtitleLine1'),
        title: t('heroSlide2Title'),
        subtitle: t('heroSlide2SubtitleLine2'),
      },
    ],
    [t, tHeader]
  );
  return (
    <section className="relative mt-14 w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        loop
        pagination={{ clickable: true }}
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        className="h-[420px] sm:h-[520px] lg:h-[600px]"
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={`${slide.src}-${idx}`} className="h-full">
            <div className="relative h-full w-full">
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={idx === 0}
                quality={85}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 mx-auto flex h-full w-full max-w-screen-1xl items-center px-4 sm:px-6 lg:px-5">
                <div className="relative z-10 w-full max-w-2xl">
                  <div className="rounded-2xl p-6 sm:p-8">
                    {idx === 0 ? (
                      <>
                        <h2 className="text-[clamp(2.75rem,9vw,6.25rem)] font-extrabold leading-none tracking-tight text-[#8f35ff]">
                          POSTIFLY
                        </h2>
                        <p className="mt-2 text-[clamp(1.15rem,3.6vw,2.25rem)] font-extrabold leading-tight tracking-tight text-[#8f35ff]">
                          როცა სისწრაფე მნიშვნელოვანია
                        </p>
                      </>
                    ) : idx === 1 ? (
                      <>
                        <h2 className="text-[clamp(2.35rem,7vw,5.25rem)] font-extrabold leading-none tracking-tight text-[#8f35ff]">
                          POSTIFLY
                        </h2>
                        <p className="mt-1 text-[clamp(1.55rem,4.6vw,2.9rem)] font-extrabold leading-[1.05] tracking-tight text-[#8f35ff]">
                          <span className="block">გლობალური მიწოდება</span>
                          <span className="block">ლოკალური სისწრაფით</span>
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold tracking-wide text-white/90 sm:text-base">
                          {slide.eyebrow}
                        </p>
                        <h2 className="mt-2 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                          {slide.title}
                        </h2>
                        <p className="mt-3 max-w-xl http://localhost:3000/ka md:mt-14 text-base text-white/90 sm:text-lg">
                          {slide.subtitle}
                        </p>
                      </>
                    )}
                    {idx === 0 ? (
                      <div className="mt-6 inline-flex md:mt-14 max-w-full flex-col rounded-full bg-[#8f35ff] px-6 py-3 text-white sm:px-7 sm:py-4">
                        <span className="text-[clamp(0.95rem,2.6vw,1.25rem)] md:text-[18px] text-[16px] font-extrabold leading-tight">
                          მიღება ამანათები საფრანგეთიდან
                        </span>
                        <span className="text-[clamp(1.6rem,4.8vw,2.75rem)] md:text-[18px] text-[16px] font-extrabold leading-none">
                          1-3 დღეში
                        </span>
                      </div>
                    ) : idx === 1 ? (
                      <div className="mt-6 inline-flex md:mt-14 max-w-full items-center justify-center rounded-full bg-[#2563eb] px-6 py-3 text-center text-white ring-2 ring-white/90 ring-offset-2 ring-offset-transparent sm:px-8 sm:py-4">
                        <span className="text-[clamp(1rem,3.4vw,1.6rem)]  md:text-[18px] text-[16px]font-extrabold leading-snug">
                          შეუკვეთე მარტივად მიიღე სწრაფად
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Middle;