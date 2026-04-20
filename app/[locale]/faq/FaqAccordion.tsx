"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import How from "./how";

type Props = {
  locale: string;
};

type FaqItem = {
  question: string;
  answer: React.ReactNode;
};

const FAQ_QUESTIONS = {
  ka: [
    "რატომ Postifly?",
    "როგორ გამოვიწეროთ?",
    "როგორ ითვლება ამანათის წონა?",
    "რა შემთხვევაში ექვემდებარება განბაჟებას გზავნილი?",
    "რატომ არის მნიშვნელოვანი ამანათის დეკლარირება?",
  ],
  en: [
    "Why Postifly?",
    "How to order?",
    "How is the parcel weight calculated?",
    "When is a shipment subject to customs clearance?",
    "Why is it important to declare a parcel?",
  ],
  ru: [
    "Почему Postifly?",
    "Как оформить заказ?",
    "Как рассчитывается вес посылки?",
    "В каких случаях отправление проходит таможенное оформление?",
    "Почему важно декларировать посылку?",
  ],
} as const;

const FAQ_ANSWERS = {
  ka: [
    "გთავაზობთ სწრაფ, უსაფრთხო და გამჭირვალე მომსახურებას; კომფორტულ ონლაინ კაბინეტს; 9 ქვეყანაში შოპინგის შესაძლებლობას; ამანათების სტატუსების მუდმივ განახლებას; ონლაინ გიდის დახმარებას, რომელიც გაგიმარტივებთ შოპინგს; სწრაფი და უსაფრთხო საკურიერო მომსახურება მთელი საქართველოს მასშტაბით.",
    "",
    "ამანათის ტრანსპორტირების ღირებულება გამოითვლება ამანათის რეალური წონის მიხედვით. წონის დამრგვალება ხდება 1 კილომდე, მინიმალური წონა შეადგენს 1 კილოს.კომპანია Postifly მოცულობით ითვლის მხოლოდ განსაკუთრებული გაბარიტების მქონე ნივთებს და ღირებულების განსაზღვრა მოხდება შეთანხმებით.",
    "საქართველოს მოქმედი კანონმდებლობით, განბაჟებას ექვემდებარება თუ ამანათის ღირებულება შეადგენს ან აღემატება 300 ლარს; ერთ რეისზე, ერთი ონლაინ მაღაზიიდან გამოგზავნილი ამანათები, რომელთა ჯამური ღირებულება შეადგენს ან აღემატება 300 ლარს;  ამანათები, რომელთა ფასი არაა 300 ლარზე მეტი, მაგრამ რეალური წონა 29 კილოზე მეტია. დეკლარირების დროს ატვირთული ინვოისის საფუძველზე, ამანათის ჩამოსვლის შემდეგ ავტომატურად იბეჭდება საბაჟო დეკლარაცია (ფორმა 4). დეკლარაციის დასრულების შემდეგ შესაძლებელია ამანათის გატანა.",
    "წინასწარი დეკლარირება აუცილებელია ამანათის საქართველოში ჩამოსვლამდე. დაუდეკლარირებელი ამანათი შეფერხდება საბაჟოზე. დეკლარაციაში მითითებულ ნებისმიერ ინფორმაციაზე პასუხისმგებელი პირი არის მომხმარებელი. გთხოვთ, სწორად დაადეკლარიროთ ამანათი, შემდგომი გაუგებრობის თავიდან აცილების მიზნით.",
  ],
  en: [
    "We offer fast, safe and transparent service; a convenient online cabinet; the opportunity to shop in 9 countries; constant updates of parcel statuses; the help of an online guide that makes shopping easier; and fast and safe courier service throughout Georgia.",
    "",
    "The transportation cost of a parcel is calculated according to its actual weight. The weight is rounded to the nearest 1 kilogram, with a minimum chargeable weight of 1 kilogram. Postifly calculates volumetric weight only for items with exceptional dimensions, and in such cases the price is determined by mutual agreement.",
    "According to Georgian legislation, a shipment is subject to customs clearance if its value is equal to or exceeds 300 GEL; if, within a single flight, several parcels from the same online shop have a total value equal to or exceeding 300 GEL; or if the parcel’s value is under 300 GEL but its actual weight exceeds 29 kilograms. Based on the invoice uploaded during declaration, a customs declaration (Form 4) is printed automatically after the parcel arrives, and once the declaration is completed, the parcel can be released.",
    "Pre‑declaration of the parcel before its arrival in Georgia is mandatory. An undeclared parcel will be delayed at customs. The customer is responsible for all information indicated in the declaration, so please declare your parcel correctly to avoid any misunderstandings later.",
  ],
  ru: [
    "Мы предлагаем быстрый, надёжный и прозрачный сервис; удобный онлайн-кабинет; возможность делать покупки в 9 странах; постоянное обновление статусов посылок; помощь онлайн-гида, который упростит вам шопинг; а также быструю и безопасную курьерскую доставку по всей Грузии.",
    "",
    "Стоимость перевозки рассчитывается по фактическому весу посылки. Вес округляется до 1 килограмма, минимальный тарифицируемый вес — 1 кг. Postifly учитывает объёмный вес только для негабаритных отправлений; в таких случаях стоимость определяется по соглашению сторон.",
    "Согласно действующему законодательству Грузии, таможенному оформлению подлежит посылка, если её стоимость составляет или превышает 300 лари; если в одном рейсе несколько посылок из одного интернет-магазина в сумме на 300 лари и более; либо если стоимость ниже 300 лари, но фактический вес превышает 29 кг. На основании счёта, загруженного при декларировании, после прибытия посылки автоматически печатается таможенная декларация (форма 4); после её оформления посылку можно получить.",
    "Предварительное декларирование до прибытия посылки в Грузию обязательно. Недекларированная посылка задерживается на таможне. За сведения в декларации отвечает клиент; пожалуйста, указывайте данные корректно, чтобы избежать недоразумений.",
  ],
} as const;

type LangKey = keyof typeof FAQ_QUESTIONS;

function langKey(locale: string): LangKey {
  if (locale === "ka") return "ka";
  if (locale === "ru") return "ru";
  return "en";
}

function faqsForLocale(locale: string): FaqItem[] {
  const lang = langKey(locale);
  const questions = [...FAQ_QUESTIONS[lang]];
  const answers = [...FAQ_ANSWERS[lang]];
  return questions.map((question, i) => ({
    question,
    answer: i === 1 ? <How locale={locale} /> : answers[i],
  }));
}

export default function FaqAccordion({ locale }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = faqsForLocale(locale);

  const handleToggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0">
      <div className="space-y-3 md:space-y-4">
        {faqs.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <motion.div
              key={item.question}
              className="relative overflow-hidden rounded-3xl  bg-white shadow-xl p-5 md:p-8"
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
                    {item.question}
                  </span>
                </div>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition-all duration-200 ${
                    isOpen
                      ? "bg-[#3A5BFF] text-white rotate-180 border-black"
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
                    <div className="px-4 md:px-6 pb-4 md:pb-5 pt-0 md:pt-2 text-left  text-black md:text-[16px] text-[14px]  border-t border-gray-100 bg-gradient-to-b from-white to-purple-50/40">
                      {item.answer}
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
