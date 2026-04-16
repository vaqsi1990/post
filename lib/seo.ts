import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.postifly.ge';

type Locale = 'ka' | 'en' | 'ru';

type SeoLocaleEntry = {
  title: string;
  description: string;
};

type SeoEntry = Record<Locale, SeoLocaleEntry>;

const seoByPath: Record<string, SeoEntry> = {
  '/': {
    ka: {
      title: 'Postifly',
      description: 'საერთაშორისო გზავნილების ტრანსპორტირება, დეკლარირება და ტრეკინგი ერთ პლატფორმაზე.',
    },
    en: {
      title: 'Postifly',
      description: 'International parcel forwarding, declaration, and package tracking in one platform.',
    },
    ru: {
      title: 'Postifly',
      description: 'Международная доставка, декларирование и отслеживание посылок на одной платформе.',
    },
  },
  '/about': {
    ka: { title: 'ჩვენ შესახებ', description: 'გაიგეთ მეტი Postifly-ს მისიისა და მომსახურების ხარისხის შესახებ.' },
    en: { title: 'About Us', description: 'Learn more about Postifly, our mission, and service quality standards.' },
    ru: { title: 'О нас', description: 'Узнайте больше о Postifly, нашей миссии и стандартах сервиса.' },
  },
  '/contact': {
    ka: { title: 'კონტაქტი', description: 'Postifly-ს საწყობების მისამართები, ტელეფონები და სამუშაო საათები.' },
    en: { title: 'Contact', description: 'Postifly warehouse addresses, contact numbers, and working hours.' },
    ru: { title: 'Контакты', description: 'Адреса складов Postifly, контактные номера и рабочие часы.' },
  },
  '/services': {
    ka: { title: 'სერვისები', description: 'ონლაინ შოპინგი, კომერციული გზავნილები, კურიერი და საბაჟო მომსახურებები.' },
    en: { title: 'Services', description: 'Online shopping support, commercial export, courier, and customs services.' },
    ru: { title: 'Услуги', description: 'Поддержка онлайн-покупок, коммерческий экспорт, курьер и таможенные услуги.' },
  },
  '/calculator': {
    ka: { title: 'კალკულატორი', description: 'გამოთვალეთ გზავნილის მიწოდების სავარაუდო ღირებულება სწრაფად და მარტივად.' },
    en: { title: 'Shipping Calculator', description: 'Estimate your parcel shipping price quickly and accurately.' },
    ru: { title: 'Калькулятор', description: 'Быстро рассчитайте ориентировочную стоимость доставки посылки.' },
  },
  '/tracking': {
    ka: { title: 'ტრეკინგი', description: 'რეალურ დროში გადაამოწმეთ თქვენი ამანათის სტატუსი და მოძრაობა.' },
    en: { title: 'Tracking', description: 'Track parcel status and shipment movement in real time.' },
    ru: { title: 'Отслеживание', description: 'Проверяйте статус и перемещение посылки в реальном времени.' },
  },
  '/dates': {
    ka: { title: 'რეისები და თარიღები', description: 'უახლოესი რეისების განრიგი, სტატუსები და მიმართულებები.' },
    en: { title: 'Flights and Dates', description: 'Upcoming flight schedules, statuses, and shipping directions.' },
    ru: { title: 'Рейсы и даты', description: 'Ближайшие рейсы, статусы и направления доставки.' },
  },
  '/stores': {
    ka: { title: 'მაღაზიები', description: 'პოპულარული საერთაშორისო ონლაინ მაღაზიები ერთ გვერდზე.' },
    en: { title: 'Stores', description: 'Popular international online stores in one place.' },
    ru: { title: 'Магазины', description: 'Популярные международные онлайн-магазины в одном месте.' },
  },
  '/conditions': {
    ka: { title: 'პირობები', description: 'გაეცანით მომსახურების პირობებს, წესებსა და შეზღუდვებს.' },
    en: { title: 'Terms and Conditions', description: 'Read service terms, declaration rules, and shipping restrictions.' },
    ru: { title: 'Условия', description: 'Ознакомьтесь с условиями сервиса, правилами и ограничениями.' },
  },
  '/faq': {
    ka: { title: 'ხშირად დასმული კითხვები', description: 'პასუხები ყველაზე ხშირად დასმულ კითხვებზე.' },
    en: { title: 'FAQ', description: 'Answers to the most frequently asked customer questions.' },
    ru: { title: 'Частые вопросы', description: 'Ответы на самые часто задаваемые вопросы клиентов.' },
  },
  '/help': {
    ka: { title: 'ონლაინ გიდი', description: 'მიიღეთ დახმარება ნივთების გამოწერაში ონლაინ გიდის მხარდაჭერით.' },
    en: { title: 'Online Guide', description: 'Get help with online ordering from the Postifly guide team.' },
    ru: { title: 'Онлайн-гид', description: 'Получите помощь с заказом товаров от команды онлайн-гида.' },
  },
};

function normalizeLocale(locale: string): Locale {
  if (locale === 'ka' || locale === 'en' || locale === 'ru') return locale;
  return routing.defaultLocale as Locale;
}

export function getSiteUrl(): string {
  return siteUrl;
}

export function getPageSeoMetadata(locale: string, path: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const entry = seoByPath[path] ?? seoByPath['/'];
  const localized = entry[normalizedLocale];
  const canonical = `/${normalizedLocale}${path === '/' ? '' : path}`;
  const languages = routing.locales.reduce<Record<string, string>>((acc, lng) => {
    acc[lng] = `/${lng}${path === '/' ? '' : path}`;
    return acc;
  }, {});

  return {
    metadataBase: new URL(siteUrl),
    title: localized.title,
    description: localized.description,
    alternates: {
      canonical,
      languages: {
        ...languages,
        'x-default': `/${routing.defaultLocale}${path === '/' ? '' : path}`,
      },
    },
    openGraph: {
      title: localized.title,
      description: localized.description,
      url: canonical,
      siteName: 'Postifly',
      locale: normalizedLocale,
      type: 'website',
      images: [
        {
          url: '/logo2.jpg',
          width: 1200,
          height: 630,
          alt: 'Postifly',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: localized.title,
      description: localized.description,
      images: ['/logo2.jpg'],
    },
  };
}
