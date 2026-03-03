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
            "Postify გთავაზობთ სწრაფ, უსაფრთხო და გამჭვირვალე სერვისს: კომფორტულ ონლაინ კაბინეტს, მრავალ ქვეყანაზე განთავსებულ მისამართებს, ამანათების სტატუსების მუდმივ განახლებას და უფასო საკურიერო მიტანას საქართველოს მასშტაბით განსაზღვრულ პირობებში.",
        },
        {
          question: "როგორ გამოვიწეროთ?",
          answer: <How isKa={isKa} />,
        },
        {
          question: "როგორ ითვლება ამანათის წონა?",
          answer:
            "ამანათის საფოსტო ტარიფი, როგორც წესი, ითვლება ფაქტიური ან მოცულობითი წონის მიხედვით — გამოიყენება ის მნიშვნელობა, რომელიც მეტია. მოცულობითი წონა გამოითვლება ამანათის სიგრძე, სიგანე და სიმაღლე სანტიმეტრებში ნამრავლის სპეციალურ კოეფიციენტზე გაყოფით.",
        },
        {
          question: "რა შემთხვევაში ექვემდებარება განბაჟებას გზავნილი?",
          answer:
            "გზავნილი განბაჟებას ექვემდებარება, როდესაც მისი ღირებულება ან/და წონა აღემატება კანონით დადგენილ შეღავათურ ლიმიტებს, ან ტვირთი მიიჩნევა კომერციულად. ზუსტი ზღვარი და წესები რეგულირდება საბაჟო კოდექსით და შესაძლოა იცვლებოდეს, ამიტომ რეკომენდებულია წინასწარ გაეცნოთ მოქმედ რეგულაციებს.",
        },
        {
          question: "რატომ არის მნიშვნელოვანი ამანათის დეკლარირება?",
          answer:
            "დეკლარირება უზრუნველყოფს, რომ თქვენი ამანათი გაივლის საბაჟო კონტროლს სწორად, თავიდან აიცილებს დაყოვნებებსა და ჯარიმებს, საშუალებას იძლევა სწორად განისაზღვროს გადასახადი (თუ არსებობს) და ამავდროულად պաշտულობს როგორც თქვენი, ისე კომპანიის კანონიერ ინტერესებს.",
        },
      ]
    : [
        {
          question: "Why Postify?",
          answer:
            "Postify offers fast, secure and transparent service: a convenient online cabinet, shipping addresses in multiple countries, live parcel status updates and free courier delivery within Georgia under defined conditions.",
        },
        {
          question: "How to subscribe/order?",
          answer:
            "Choose the online shop you prefer, register on our website and copy the address of the corresponding country from your cabinet. Use that address when placing your order, receive the tracking code, add the parcel in our system and wait for a notification when it arrives.",
        },
        {
          question: "How is parcel weight calculated?",
          answer:
            "Shipping tariffs are usually based on either actual or volumetric weight – whichever is higher. Volumetric weight is calculated using the parcel’s length, width and height in centimeters divided by a specific coefficient.",
        },
        {
          question: "When is a shipment subject to customs duties?",
          answer:
            "A shipment becomes subject to customs clearance when its value and/or weight exceed the legal exemption thresholds or when the goods are considered commercial. Exact limits and rules are defined by customs regulations and may change over time.",
        },
        {
          question: "Why is parcel declaration important?",
          answer:
            "Proper declaration ensures that your parcel passes customs control correctly, helps avoid delays and penalties, allows correct calculation of any applicable duties, and protects both your rights and the company’s legal obligations.",
        },
      ];

  const handleToggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  const pageTitle = isKa ? "ხშირად დასმული კითხვები" : "Frequently Asked Questions";

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-center text-black md:text-[32px] text-[22px] font-bold mb-8 md:mb-10">
        {pageTitle}
      </h1>

      <div className="space-y-3 md:space-y-4">
        {faqs.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <motion.div
              key={item.question}
              className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={() => handleToggle(index)}
                className="w-full flex items-center justify-between gap-3 px-4 md:px-5 py-3 md:py-4 text-left"
              >
                <span className="text-black md:text-[18px] text-[15px] font-semibold">
                  {item.question}
                </span>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition-transform duration-200 ${
                    isOpen ? "bg-black text-white rotate-180" : "bg-white text-black"
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
                    <div className="px-4 md:px-5 pb-4 md:pb-5 pt-0 md:pt-1 text-black/80 md:text-[16px] text-[14px] leading-relaxed border-t border-gray-100">
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

