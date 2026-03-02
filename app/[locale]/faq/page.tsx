import React from 'react';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function FaqSubscribePage({ params }: Props) {
  const { locale } = await params;
  const isKa = locale === 'ka';

  const title = isKa ? 'როგორ გამოვიწერო?' : 'How to subscribe?';

  const steps = isKa
    ? [
        '1. დარეგისტრირდით საიტზე, საიდანაც გსურთ სასურველი ნივთის გამოწერა;',
        '2. დარეგისტრირდით ჩვენს საიტზე www:;',
        '3. Www...ge-ზე ავტორიზაციის გავლის შემდეგ, მისამართების ველში გამოჩნდება თქვენთვის მინიჭებული ყველა ქვეყნის მისამართი, რომლიდანაც "დააკოპირებთ" სასურველ მისამართს და ჩასვამთ ონლაინ მაღაზიის საიტზე შესაბამის ველებში.',
        '4. გაითვალისწინეთ, რომელი ქვეყნის საიტიდანაც გსურთ გამოწერა იმ ქვეყნის მისამართი უნდა შეარჩიოთ თქვენი კაბინეტიდან.',
        '5. გამოწერიდან რამოდენიმე დღეში კურიერი მაღაზიიდან მიიტანს თქვენს ნივთს ჩვენს ოფისში.',
        '6. თქვენ ელ-ფოსტაზე მიიღებთ თქვენი ამანათის "თრექინგ კოდს", რის შემდეგაც თქვენ უნდა დაადეკლარიროთ ამანათი ჩვენს საიტზე;',
        '7. დეკლარირების შემდეგ დაელოდოთ თქვენს ამანათს, როგორც ჩამოვა მიიღებთ შეტყობინებას.',
      ]
    : [
        '1. Register on the website from which you want to order the desired item;',
        '2. Register on our website www:;',
        '3. After logging in on Www...ge, all country addresses assigned to you will appear in the addresses section; copy the desired address and paste it into the corresponding fields on the online store’s website.',
        '4. Please note that you must select, from your cabinet, the address of the same country from which you want to order.',
        '5. A few days after placing the order, the courier from the shop will deliver your item to our office.',
        '6. You will receive your parcel’s tracking code by email, after which you must declare the parcel on our website;',
        '7. After declaration, wait for your parcel; once it arrives, you will receive a notification.',
      ];

  const thanks = isKa ? 'მადლობა ნდობისთვის💜' : 'Thank you for your trust💜';

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        id="subscribe"
        className="w-full pt-14 mt-14 md:pt-20 pb-16 md:pb-24 px-4"
      >
        <div className="max-w-3xl mx-auto">
          <h1 className="text-center text-black md:text-[32px] text-[22px] font-bold mb-8">
            {title}
          </h1>
          <ol className="space-y-3 text-black md:text-[16px] text-[14px] leading-relaxed list-decimal list-inside">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="mt-6 text-center text-black md:text-[16px] text-[14px]">
            {thanks}
          </p>
        </div>
      </section>
    </div>
  );
}

