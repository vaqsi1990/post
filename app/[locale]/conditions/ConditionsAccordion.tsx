"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  isKa: boolean;
};

type SectionItem = {
  id: string;
  title: string;
  content: string;
};

export default function ConditionsAccordion({ isKa }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const sections: SectionItem[] = isKa
    ? [
        {
          id: "provider-duties",
          title: "შემსრულებლის უფლება-მოვალეობები",
          content:
            "კომპანია Postify-ის  მიერ ამანათების ტრანსპორტირება ხდეა 9 ქვეყნიდან საქართველოში; კომპანია პასუხს არ აგებს რეგისტრაციისას მომხმარებლის მიერ შევსებული ინფორმაციის სისწორეზე; თუ მომხმარებლის მიერ შეკვეთილი პროდუქცია არ მივა ჩვენს ოფისებამდე „ონლაინ მაღაზიის“ შეცდომის გამო ან „ონლაინ მაღაზია“ გააუქმებს შეკვეთას, კომპანია არ აგებს პასუხს ზარალის ანაზღაურებაზე; კომპანია Postify იღებს ვალდებულებას ამანათების უვნებლად ტრანსპორტირებაზე, დაკარგვის შემთხვევაში ზარალი იქნება ანაზღაურებული; კომპანია Postify არის პასუხისმგებელი ისეთ ნივთზე, რომელიც გარეგნულად იქნება დაზიანებული (დახეული, გახნსილი, შეჭყლეტილი). ნივთის შემოწმება ხდება ადგილზე, სხვა შემთხვევაში პრეტენზია არ მიიღება. ანაზღაურება არ ვრცელდება მტვრევად ნივთებზე. კომპანია Postify   არ აგებს პასუხს პროდუქციის ვარგისიანობაზე, ხარისხზე და მათ რაოდენობაზე; მომხმარებელი ვალდებულია წარმოადგინოს ყველა საბუთი, რაც კავშირში იქნება შეძენილ ნივთთან; კომპენსაციის შემთხვევაში შემსრულებელი იტოვებს საწყობში დაზიანებულ ნივთს;   კომპანია Postify  მოკვლევის მიზნით ზარალის ანაზღაურებამდე ითხოვს მაქსიმუმ 30 სამუშაო დღეს, ხოლო ზარალის თანხას უნაზღაურებს დამკვეთს 5 სამუშაო დღეში, მიღება ჩაბარების აქტის საფუძველზე.",
        },
        {
          id: "customer-duties",
          title: "დამკვეთის უფლება-მოვალეობები",
          content:
            'დამკვეთი ვალდებულია შემსრულებლის ვებ გვერდზე ( www.....) მოახდინოს ამანათის სწორად დეკლარირება, დამკვეთის პირად კაბინეტში ამანათის თრექინგ კოდის ასახვიდან არაუგვიანეს 3 კალენდარულ დღეში; დამკვეთი ვალდებულია დაფაროს ამანათის ტრანსპორტირების საფასური ნივთის გატანის წინ; დამკვეთი ვალდებულია ამანათის გატანამდე შეამოწმოს ნივთი, წინააღმდეგ შემთხვევაში, ამანათის გატანის შემდეგ პრეტენზიები არ მიიღება.',
        },
        {
          id: "calculation-rules",
          title: "დაანგარიშების წესი",
          content:
            "ამანათის ტრანსპორტირების ღირებულება გამოითვლება ამანათის რეალური წონის მიხედვით. წონის დამრგვალება ხდება 100 გრამამდე, მინიმალური წონა შეადგენს 100 გრამს.კომპანია Postify მოცულობით ითვლის მხოლოდ განსაკუთრებული გაბარიტების მქონე ნივთებს და ღირებულების განსაზღვრა მოხდება შეთანხმებით.",
        },
        {
          id: "declaration-service",
          title: "დეკლარირება და განბაჟების მომსახურება",
          content:
            "დამკვეთი ვალდებულია მოახდინოს მისი კუთვნილი ნივთის დეკლარირება. დეკლარაციაში მითითებულ ნებისმიერ ინფორმაციაზე პასუხისმგებელია დამკვეთი. შემსრულბელი დამკვეთს უბის მხოლოდ საბაჟოზე მომსახურებას. ამანათების დეკლარიება სავალდებულოა, დაუდეკლარირებელი ამანათები შეჩერდება საბაჟოზე. ტვირთის განბაჟებაზე და დღგ-ეს დროულ გადახდაზე პასუხისმგებელია დამკვეთი. შემსრულებელი დამკვეთს გაუწევს მხოლოდ სადეკლარანტო სერვისს, რაც გულისხმობს დეკლარაციის ფორმის შევსებას. იმ შემთხვევაში თუ დამკვეთმა არ გადაიხადა ბაჟი, ვერ ჩაეტია შესაბამის ვადებში (ბაჟის გადახდის) მიუთითა არასწორი ინფორმაცია დეკლარაციაში, პასუხისმგებელი არის დამკვეთი. დამკვეთის მიერ არასწორი ინფორმაციის საფუძველზე თუ დაზარალდა კომპანია Postify, დამკვეთი ზარალს აუნაზღაურებს კომპანიას სრულად.",
        },
        {
          id: "third-party-pickup",
          title: "ამანათის გაცემა მესამე პირზე",
          content:
            "ამანათის გაცემა მესამე პირზე ხდება შემდეგი დოკუმენტაციის წარმოდგენის შემთხვევაში: პირადობის მოწმობა, პირადობის მოწმობის ასლი, პიროვნების დამადასტურებელი სხვა დოკუმენტი, მინდობილობა.",
        },
        {
          id: "confidentiality",
          title: "კონფიდენციალურობა",
          content:
            "მომხმარებლის შესახებ, ნებისმიერი სახის ინფორმაცია, რომელიც ინახება კომპანია Postify-ის ბაზაში წარმოადგენს კონფიდენციალურ მასალას. კომპანია Postify აღნიშნულ ინფორმაციას არ გადასცემს მესამე პირს, თუ ამას არ მოითხოვს სახელმწიფოს წარმომადგენელი ორგანო, შესაბამისი მოთხოვნის საფუძველზე. აღნიშნული ინფორმაცია ინახება ბაზებში და დაცულია უცხო პირებისგან. თავის მხრივ, მომხმარებელი ვალდებულია არ გადასცეს მესამე პირს ისეთი ინფორმაცია როგორიცაა: ა) ტრანსპორტირების ანაზღაურების ტარიფი, რომელიც შეთანხმებულია მხოლოდ დამკვეთთან; ბ) ფინანსური დოკუმენტები, როგორიცაა ინვოისი. მადლობა რომ სარგებლობთ ჩვენი მომსახურებით 💚",
        },
        {
          id: "declarant-service",
          title: "დეკლარანტის მომსახურება",
          content:
            "კომპანია Postify მომხმარებლებს სადეკლარანტო მომსახურებას გაუწევს უფასოდ. დეკლარაციის დაბეჭდვა უფასოა როგორც ფიზიკურ, ასევე იურიდიული პირებისთვის.",
        },
      ]
    : [
        {
          id: "provider-duties",
          title: "Provider rights and obligations",
          content:
            "Postify transports parcels from 9 countries to Georgia. The company is not responsible for the accuracy of information provided by the customer during registration. If the product ordered by the customer does not arrive at our office due to an error by the online store, or if the online store cancels the order, the company is not liable for any resulting loss. Postify undertakes to transport parcels safely, and in case of loss, the damage will be compensated. Postify is responsible only for items that are visibly damaged (torn, opened, crushed). The item must be inspected on-site; otherwise, claims will not be accepted. Compensation does not apply to fragile items. Postify is not responsible for the validity period, quality, or quantity of the products. The customer is obliged to provide all documents related to the purchased item. In the event of compensation, the provider retains the damaged item in the warehouse. For investigation purposes, before reimbursing the loss, Postify may take up to 30 working days and will reimburse the customer within 5 working days on the basis of a delivery-acceptance act.",
        },
        {
          id: "customer-duties",
          title: "Customer's Rights and Obligations",
          content:
            "The customer is obliged to correctly declare the parcel on the provider’s website (www.....) in their personal account no later than 3 calendar days after the parcel’s tracking code appears; the customer must pay the parcel transportation fee before collecting the item; the customer must check the item before collecting the parcel, otherwise no claims will be accepted after collection.",
        },
        {
          id: "calculation-rules",
          title: "Calculation Rules",
          content:
            "The cost of parcel transportation is calculated based on the actual weight of the parcel. The weight is rounded to 100 grams, and the minimum chargeable weight is 100 grams. Postify calculates by volumetric weight only for items with especially large dimensions, and the price will be determined by mutual agreement.",
        },
        {
          id: "declaration-service",
          title: "Declaration and Customs Clearance Service",
          content:
            "The customer is obliged to declare their item. The customer is responsible for any information indicated in the declaration. The provider only offers services at customs to the customer. Declaring parcels is mandatory; undeclared parcels will be held at customs. The customer is responsible for customs clearance and timely payment of VAT. The provider will only offer declarant services to the customer, which means filling out the declaration form. If the customer does not pay the customs duty, fails to meet the relevant deadlines for payment, or provides incorrect information in the declaration, the customer bears responsibility. If Postify suffers damage due to incorrect information provided by the customer, the customer will fully compensate the company for the loss.",
        },
        {
          id: "third-party-pickup",
          title: "Parcel Release to a Third Party",
          content:
            "A parcel may be released to a third party upon presentation of the following documents: identity card, copy of the identity card, another identity document, and a power of attorney.",
        },
        {
          id: "confidentiality",
          title: "Confidentiality",
          content:
            "Any information about the customer stored in Postify’s database is confidential material. Postify does not disclose this information to third parties unless this is required by a state authority on the basis of an appropriate request. This information is stored in databases and protected from unauthorized persons. In turn, the customer is obliged not to disclose to third parties such information as: (a) the transportation tariff, which is agreed only with the customer; (b) financial documents such as an invoice. Thank you for using our service.",
        },
        {
          id: "declarant-service",
          title: "Declarant Service",
          content:
            "Postify provides declarant services to customers free of charge. Printing the declaration is free for both individuals and legal entities.",
        },
      ];

  const pageTitle = isKa ? "მომსახურების პირობები" : "Service conditions";

  const handleToggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0">
      

      <div className="space-y-3 md:space-y-4">
        {sections.map((section, index) => {
          const isOpen = openIndex === index;

          return (
            <motion.div
              key={section.id}
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
                    {section.title}
                  </span>
                </div>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition-all duration-200 ${
                    isOpen
                      ? "bg-black text-white rotate-180 border-black"
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
                    <div className="px-4 md:px-6 pb-4 md:pb-5 pt-0 md:pt-2 text-center text-black md:text-[16px] text-[14px] leading-relaxed border-t border-gray-100 bg-gradient-to-b from-white to-purple-50/40">
                      {section.content}
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

