import React from 'react';
import type { Metadata } from 'next';
import GuideSection from './GuideSection';
import { getPageSeoMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
};

const GUIDE_COPY = {
  ka: {
    title: 'ონლაინ გიდი',
    text: 'ონლაინ გიდი დაგეხმარებათ თქვენთვის სასურველი ნებისმიერი ნივთის გამოწერაში. სერვისით სარგებლობა უფასოა. ნივთის გამოსაწერად საჭირო თანხა კი უნდა გადაიხადოთ გამოსაწერად საჭირო ვალუტაში, თქვენი პირადი კაბინეტიდან ან ჩარიცხოთ კომპანიის ანგარიშზე. სერვისის სარგებლობისთვის მოგვწერეთ ჩატში "გამოწერაში დახმარება" და თქვენი საკონტაქტო. ონლაინ გიდი დაგიკავშირდებათ ერთი საათის განმავლობაში და გაგიწევთ დახმარებას. სასიამოვნო შოპინგს გისურვებთ.',
  },
  en: {
    title: 'Online guide',
    text: 'Our online guide will help you order any item you want. The service is free of charge. To order an item, you only need to pay its cost in the required currency from your personal cabinet or transfer the amount to the company’s bank account. To use the service, write to us in the chat with the message “Help with ordering” and your contact details. Our online guide will contact you within one hour and assist you. We wish you pleasant shopping.',
  },
  ru: {
    title: 'Онлайн-гид',
    text: 'Онлайн-гид поможет вам заказать любой товар, который вам нужен. Пользование сервисом бесплатно. Сумму за товар необходимо оплатить в требуемой валюте из личного кабинета или перевести на расчётный счёт компании. Чтобы воспользоваться сервисом, напишите нам в чате «Помощь с заказом» и укажите свои контактные данные. Онлайн-гид свяжется с вами в течение одного часа и поможет. Приятных покупок.',
  },
} as const;

export default async function HelpGuidePage({ params }: Props) {
  const { locale } = await params;
  const bundle =
    locale === 'ka' || locale === 'en' || locale === 'ru'
      ? GUIDE_COPY[locale]
      : GUIDE_COPY.en;

  const { title, text } = bundle;

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        id="guide"
        className="w-full pt-14 mt-14 md:pt-20 pb-16 md:pb-24 px-4"
      >
        <GuideSection title={title} text={text} />
      </section>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPageSeoMetadata(locale, '/help');
}

