`use client`;

import React from "react";
import HowToSubscribeSection from "./HowToSubscribeSection";

type Props = {
  isKa: boolean;
};

export default function How({ isKa }: Props) {



  const steps = isKa
    ? [
        " დარეგისტრირდით საიტზე, საიდანაც გსურთ სასურველი ნივთის გამოწერა;",
        " დარეგისტრირდით ჩვენს საიტზე www:;",
        ' Www...ge-ზე ავტორიზაციის გავლის შემდეგ, მისამართების ველში გამოჩნდება თქვენთვის მინიჭებული ყველა ქვეყნის მისამართი, რომლიდანაც "დააკოპირებთ" სასურველ მისამართს და ჩასვამთ ონლაინ მაღაზიის საიტზე შესაბამის ველებში.',
        " გაითვალისწინეთ, რომელი ქვეყნის საიტიდანაც გსურთ გამოწერა იმ ქვეყნის მისამართი უნდა შეარჩიოთ თქვენი კაბინეტიდან.",
        " გამოწერიდან რამოდენიმე დღეში კურიერი მაღაზიიდან მიიტანს თქვენს ნივთს ჩვენს ოფისში.",
        ' თქვენ ელ-ფოსტაზე მიიღებთ თქვენი ამანათის "თრექინგ კოდს", რის შემდეგაც თქვენ უნდა დაადეკლარიროთ ამანათი ჩვენს საიტზე;',
        " დეკლარირების შემდეგ დაელოდოთ თქვენს ამანათს, როგორც ჩამოვა მიიღებთ შეტყობინებას.",
        " ჩამოსულ ამანათს მისამართზე კურიერი უფასოდ მოგიტანთ.",
      ]
    : [
        " Register on the website from which you want to order the desired item;",
        " Register on our website www:;",
        " After logging in on Www...ge, all country addresses assigned to you will appear in the addresses section; copy the desired address and paste it into the corresponding fields on the online store’s website.",
        " Please note that you must select, from your cabinet, the address of the same country from which you want to order.",
        " A few days after placing the order, the courier from the shop will deliver your item to our office.",
        " You will receive your parcel’s tracking code by email, after which you must declare the parcel on our website;",
        " After declaration, wait for your parcel; once it arrives, you will receive a notification.",
        " The courier will deliver the arrived parcel to your address free of charge.",
      ];

  const thanks = isKa ? "მადლობა ნდობისთვის💜" : "Thank you for your trust💜";

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        id="subscribe"
        className="w-full pt-14  md:pt-20 pb-16 md:pb-24 px-4"
      >
        <HowToSubscribeSection
          isKa={isKa}
         
          steps={steps}
          thanks={thanks}
        />
      </section>
    </div>
  );
}

