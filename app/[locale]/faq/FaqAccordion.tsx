"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import How from "./how";

type Props = {
  isKa: boolean;
};

type FaqItem = {
  question: string;
  answer: React.ReactNode;
};

export default function FaqAccordion({ isKa }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FaqItem[] = isKa
    ? [
        {
          question: "რატომ Postify?",
          answer:
            "გთავაზობთ სწრაფ, უსაფრთხო და გამჭირვალე მომსახურებას; კომფორტულ ონლაინ კაბინეტს; 9 ქვეყანაში შოპინგის შესაძლებლობას; ამანათების სტატუსების მუდმივ განახლებას; ონლაინ გიდის დახმარებას, რომელიც გაგიმარტივებთ შოპინგს; უფასო საკურიერო მომსახურებას მთელი საქართველოს მასშტაბით.",
        },
        {
          question: "როგორ გამოვიწეროთ?",
          answer: <How isKa={isKa} />,
        },
        {
          question: "როგორ ითვლება ამანათის წონა?",
          answer:
            "ამანათის ტრანსპორტირების ღირებულება გამოითვლება ამანათის რეალური წონის მიხედვით. წონის დამრგვალება ხდება 100 გრამამდე, მინიმალური წონა შეადგენს 100 გრამს.კომპანია Postify მოცულობით ითვლის მხოლოდ განსაკუთრებული გაბარიტების მქონე ნივთებს და ღირებულების განსაზღვრა მოხდება შეთანხმებით."
        },
        {
          question: "რა შემთხვევაში ექვემდებარება განბაჟებას გზავნილი?",
          answer:
            "საქართველოს მოქმედი კანონმდებლობით, განბაჟებას ექვემდებარება თუ ამანათის ღირებულება შეადგენს ან აღემატება 300 ლარს; ერთ რეისზე, ერთი ონლაინ მაღაზიიდან გამოგზავნილი ამანათები, რომელთა ჯამური ღირებულება შეადგენს ან აღემატება 300 ლარს;  ამანათები, რომელთა ფასი არაა 300 ლარზე მეტი, მაგრამ რეალური წონა 29 კილოზე მეტია. დეკლარირების დროს ატვირთული ინვოისის საფუძველზე, ამანათის ჩამოსვლის შემდეგ ავტომატურად იბეჭდება საბაჟო დეკლარაცია (ფორმა 4). დეკლარაციის დასრულების შემდეგ შესაძლებელია ამანათის გატანა.",
        },
        {
          question: "რატომ არის მნიშვნელოვანი ამანათის დეკლარირება?",
          answer:
            "წინასწარი დეკლარირება აუცილებელია ამანათის საქართველოში ჩამოსვლამდე. დაუდეკლარირებელი ამანათი შეფერხდება საბაჟოზე. დეკლარაციაში მითითებულ ნებისმიერ ინფორმაციაზე პასუხისმგებელი პირი არის მომხმარებელი. გთხოვთ, სწორად დაადეკლარიროთ ამანათი, შემდგომი გაუგებრობის თავიდან აცილების მიზნით.",
        },
      ]
    : [
        {
          question: "Why Postify?",
          answer:
            "We offer fast, safe and transparent service; a convenient online cabinet; the opportunity to shop in 9 countries; constant updates of parcel statuses; the help of an online guide that makes shopping easier; and free courier service throughout Georgia.",
        },
        {
          question: "How to order?",
          answer: <How isKa={isKa} />,
        },
        {
          question: "How is the parcel weight calculated?",
          answer:
            "The transportation cost of a parcel is calculated according to its actual weight. The weight is rounded to the nearest 100 grams, with a minimum chargeable weight of 100 grams. Postify calculates volumetric weight only for items with exceptional dimensions, and in such cases the price is determined by mutual agreement.",
        },
        {
          question: "When is a shipment subject to customs clearance?",
          answer:
            "According to Georgian legislation, a shipment is subject to customs clearance if its value is equal to or exceeds 300 GEL; if, within a single flight, several parcels from the same online shop have a total value equal to or exceeding 300 GEL; or if the parcel’s value is under 300 GEL but its actual weight exceeds 29 kilograms. Based on the invoice uploaded during declaration, a customs declaration (Form 4) is printed automatically after the parcel arrives, and once the declaration is completed, the parcel can be released.",
        },
        {
          question: "Why is it important to declare a parcel?",
          answer:
            "Pre‑declaration of the parcel before its arrival in Georgia is mandatory. An undeclared parcel will be delayed at customs. The customer is responsible for all information indicated in the declaration, so please declare your parcel correctly to avoid any misunderstandings later.",
        },
      ];

  const handleToggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  const pageTitle = isKa ? "ხშირად დასმული კითხვები" : "Frequently Asked Questions";

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
        {faqs.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <motion.div
              key={item.question}
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
                    <div className="px-4 md:px-6 pb-4 md:pb-5 pt-0 md:pt-2 text-black/80 md:text-[16px] text-[14px] leading-relaxed border-t border-gray-100 bg-gradient-to-b from-white to-purple-50/40">
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

