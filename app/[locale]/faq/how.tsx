'use client';

import React from "react";
import HowToSubscribeSection from "./HowToSubscribeSection";

type Props = {
  locale: string;
};

const STEPS = {
  ka: [
    " დარეგისტრირდით საიტზე, საიდანაც გსურთ სასურველი ნივთის გამოწერა;",
    " დარეგისტრირდით ჩვენს საიტზე www.postifly.ge;",
    ' www.postifly.ge/-ზე ავტორიზაციის გავლის შემდეგ, მისამართების ველში გამოჩნდება თქვენთვის მინიჭებული ყველა ქვეყნის მისამართი, რომლიდანაც "დააკოპირებთ" სასურველ მისამართს და ჩასვამთ ონლაინ მაღაზიის საიტზე შესაბამის ველებში.',
    " გაითვალისწინეთ, რომელი ქვეყნის საიტიდანაც გსურთ გამოწერა იმ ქვეყნის მისამართი უნდა შეარჩიოთ თქვენი კაბინეტიდან.",
    " გამოწერიდან რამოდენიმე დღეში კურიერი მაღაზიიდან მიიტანს თქვენს ნივთს ჩვენს ოფისში.",
    ' თქვენ ელ-ფოსტაზე მიიღებთ თქვენი ამანათის "თრექინგ კოდს", რის შემდეგაც თქვენ უნდა დაადეკლარიროთ ამანათი ჩვენს საიტზე;',
    " დეკლარირების შემდეგ დაელოდოთ თქვენს ამანათს, როგორც ჩამოვა მიიღებთ შეტყობინებას.",
    " ჩამოსულ ამანათს მისამართზე კურიერი სწრაფად და უსაფრთხოდ მოგიტანთ.",
  ],
  en: [
    " Register on the website from which you want to order the desired item;",
    " Register on our website www.postifly.ge;",
    " After logging in on www.postifly.ge, all country addresses assigned to you will appear in the addresses section; copy the desired address and paste it into the corresponding fields on the online store’s website.",
    " Please note that you must select, from your cabinet, the address of the same country from which you want to order.",
    " A few days after placing the order, the courier from the shop will deliver your item to our office.",
    " You will receive your parcel’s tracking code by email, after which you must declare the parcel on our website;",
    " After declaration, wait for your parcel; once it arrives, you will receive a notification.",
    " The courier will deliver the arrived parcel to your address quickly and safely.",
  ],
  ru: [
    " Зарегистрируйтесь на сайте интернет-магазина, с которого хотите заказать товар;",
    " Зарегистрируйтесь на нашем сайте www.postifly.ge;",
    " После входа на www.postifly.ge в разделе адресов отобразятся все назначенные вам адреса по странам; скопируйте нужный и вставьте в соответствующие поля на сайте магазина.",
    " Выбирайте в кабинете адрес той же страны, из магазина которой оформляете заказ.",
    " Через несколько дней после заказа курьер магазина доставит посылку в наш офис.",
    " На электронную почту вы получите трекинг-код посылки; после этого оформите декларацию на нашем сайте;",
    " После декларирования дождитесь прибытия посылки; по прибытии вы получите уведомление.",
    " Курьер быстро и безопасно доставит посылку по вашему адресу.",
  ],
} as const;

export default function How({ locale }: Props) {
  const lang = locale === "ka" ? "ka" : locale === "ru" ? "ru" : "en";
  const steps = [...STEPS[lang]];

  return (
    <div className="min-h-screen bg-gray-50">
      <section id="subscribe" className="w-full  pb-16 md:pb-24 px-4">
        <HowToSubscribeSection locale={locale} steps={steps} />
      </section>
    </div>
  );
}
