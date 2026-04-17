import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.postifly.ge';

type Locale = 'ka' | 'en' | 'ru';

type SeoLocaleEntry = {
  title: string;
  description: string;
  keywords: string[];
};

type SeoEntry = Record<Locale, SeoLocaleEntry>;

const seoByPath: Record<string, SeoEntry> = {
  '/': {
    ka: {
      title: 'Postifly',
      description: 'საერთაშორისო გზავნილების ტრანსპორტირება, დეკლარირება და ტრეკინგი ერთ პლატფორმაზე.',
      keywords: [
        'Postifly',
        'ამანათის გადაზიდვა',
        'ფორვარდინგი',
        'ტრეკინგი',
        'დეკლარაცია',
        'საერთაშორისო გზავნილები',
        'საწყობის მისამართი',
      ],
    },
    en: {
      title: 'Postifly',
      description: 'International parcel forwarding, declaration, and package tracking in one platform.',
      keywords: [
        'Postifly',
        'parcel forwarding',
        'international shipping',
        'package tracking',
        'customs declaration',
        'warehouse address',
      ],
    },
    ru: {
      title: 'Postifly',
      description: 'Международная доставка, декларирование и отслеживание посылок на одной платформе.',
      keywords: [
        'Postifly',
        'международная доставка',
        'форвардинг',
        'отслеживание посылки',
        'декларация',
        'адрес склада',
      ],
    },
  },
  '/about': {
    ka: {
      title: 'ჩვენ შესახებ',
      description: 'გაიგეთ მეტი Postifly-ს მისიისა და მომსახურების ხარისხის შესახებ.',
      keywords: ['Postifly', 'ჩვენ შესახებ', 'ლოგისტიკა', 'გადაზიდვა', 'მომსახურება', 'მისია'],
    },
    en: {
      title: 'About Us',
      description: 'Learn more about Postifly, our mission, and service quality standards.',
      keywords: ['Postifly', 'about', 'logistics', 'shipping', 'service quality', 'mission'],
    },
    ru: {
      title: 'О нас',
      description: 'Узнайте больше о Postifly, нашей миссии и стандартах сервиса.',
      keywords: ['Postifly', 'о нас', 'логистика', 'доставка', 'качество сервиса', 'миссия'],
    },
  },
  '/contact': {
    ka: {
      title: 'კონტაქტი',
      description: 'Postifly-ს საწყობების მისამართები, ტელეფონები და სამუშაო საათები.',
      keywords: ['Postifly', 'კონტაქტი', 'საწყობი', 'მისამართი', 'ტელეფონი', 'სამუშაო საათები'],
    },
    en: {
      title: 'Contact',
      description: 'Postifly warehouse addresses, contact numbers, and working hours.',
      keywords: ['Postifly', 'contact', 'warehouse', 'address', 'phone', 'working hours'],
    },
    ru: {
      title: 'Контакты',
      description: 'Адреса складов Postifly, контактные номера и рабочие часы.',
      keywords: ['Postifly', 'контакты', 'склад', 'адрес', 'телефон', 'часы работы'],
    },
  },
  '/services': {
    ka: {
      title: 'სერვისები',
      description: 'ონლაინ შოპინგი, კომერციული გზავნილები, კურიერი და საბაჟო მომსახურებები.',
      keywords: ['Postifly', 'სერვისები', 'ონლაინ შოპინგი', 'კურიერი', 'საბაჟო', 'კომერციული ტვირთი'],
    },
    en: {
      title: 'Services',
      description: 'Online shopping support, commercial export, courier, and customs services.',
      keywords: ['Postifly', 'services', 'online shopping', 'courier', 'customs', 'commercial export'],
    },
    ru: {
      title: 'Услуги',
      description: 'Поддержка онлайн-покупок, коммерческий экспорт, курьер и таможенные услуги.',
      keywords: ['Postifly', 'услуги', 'онлайн покупки', 'курьер', 'таможня', 'коммерческий экспорт'],
    },
  },
  '/calculator': {
    ka: {
      title: 'კალკულატორი',
      description: 'გამოთვალეთ გზავნილის მიწოდების სავარაუდო ღირებულება სწრაფად და მარტივად.',
      keywords: ['Postifly', 'კალკულატორი', 'ტარიფი', 'მიტანა', 'ფასი', 'წონა', 'მოცულობითი წონა'],
    },
    en: {
      title: 'Shipping Calculator',
      description: 'Estimate your parcel shipping price quickly and accurately.',
      keywords: ['Postifly', 'shipping calculator', 'rates', 'price estimate', 'weight', 'volumetric weight'],
    },
    ru: {
      title: 'Калькулятор',
      description: 'Быстро рассчитайте ориентировочную стоимость доставки посылки.',
      keywords: ['Postifly', 'калькулятор', 'тариф', 'стоимость', 'вес', 'объемный вес'],
    },
  },
  '/tracking': {
    ka: {
      title: 'ტრეკინგი',
      description: 'რეალურ დროში გადაამოწმეთ თქვენი ამანათის სტატუსი და მოძრაობა.',
      keywords: ['Postifly', 'ტრეკინგი', 'ამანათის სტატუსი', 'თრექინგ კოდი', 'მოძრაობა', 'tracking'],
    },
    en: {
      title: 'Tracking',
      description: 'Track parcel status and shipment movement in real time.',
      keywords: ['Postifly', 'tracking', 'track parcel', 'tracking number', 'shipment status'],
    },
    ru: {
      title: 'Отслеживание',
      description: 'Проверяйте статус и перемещение посылки в реальном времени.',
      keywords: ['Postifly', 'отслеживание', 'трек-номер', 'статус посылки', 'движение отправления'],
    },
  },
  '/dates': {
    ka: {
      title: 'რეისები და თარიღები',
      description: 'უახლოესი რეისების განრიგი, სტატუსები და მიმართულებები.',
      keywords: ['Postifly', 'რეისები', 'თარიღები', 'განრიგი', 'მიმართულებები', 'სტატუსი'],
    },
    en: {
      title: 'Flights and Dates',
      description: 'Upcoming flight schedules, statuses, and shipping directions.',
      keywords: ['Postifly', 'flights', 'shipping dates', 'schedule', 'status', 'routes'],
    },
    ru: {
      title: 'Рейсы и даты',
      description: 'Ближайшие рейсы, статусы и направления доставки.',
      keywords: ['Postifly', 'рейсы', 'даты доставки', 'расписание', 'статус', 'направления'],
    },
  },
  '/stores': {
    ka: {
      title: 'მაღაზიები',
      description: 'პოპულარული საერთაშორისო ონლაინ მაღაზიები ერთ გვერდზე.',
      keywords: ['Postifly', 'მაღაზიები', 'ონლაინ მაღაზიები', 'Amazon', 'eBay', 'shopping'],
    },
    en: {
      title: 'Stores',
      description: 'Popular international online stores in one place.',
      keywords: ['Postifly', 'stores', 'online stores', 'Amazon', 'eBay', 'shopping'],
    },
    ru: {
      title: 'Магазины',
      description: 'Популярные международные онлайн-магазины в одном месте.',
      keywords: ['Postifly', 'магазины', 'онлайн магазины', 'Amazon', 'eBay', 'покупки'],
    },
  },
  '/conditions': {
    ka: {
      title: 'პირობები',
      description: 'გაეცანით მომსახურების პირობებს, წესებსა და შეზღუდვებს.',
      keywords: ['Postifly', 'პირობები', 'წესები', 'შეზღუდვები', 'დეკლარირება', 'აკრძალული ნივთები'],
    },
    en: {
      title: 'Terms and Conditions',
      description: 'Read service terms, declaration rules, and shipping restrictions.',
      keywords: ['Postifly', 'terms', 'conditions', 'declaration rules', 'shipping restrictions'],
    },
    ru: {
      title: 'Условия',
      description: 'Ознакомьтесь с условиями сервиса, правилами и ограничениями.',
      keywords: ['Postifly', 'условия', 'правила', 'ограничения', 'декларация', 'запрещенные товары'],
    },
  },
  '/faq': {
    ka: {
      title: 'ხშირად დასმული კითხვები',
      description: 'პასუხები ყველაზე ხშირად დასმულ კითხვებზე.',
      keywords: ['Postifly', 'FAQ', 'კითხვები', 'პასუხები', 'მიწოდება', 'ტარიფები', 'დეკლარაცია'],
    },
    en: {
      title: 'FAQ',
      description: 'Answers to the most frequently asked customer questions.',
      keywords: ['Postifly', 'FAQ', 'questions', 'shipping', 'rates', 'tracking', 'declaration'],
    },
    ru: {
      title: 'Частые вопросы',
      description: 'Ответы на самые часто задаваемые вопросы клиентов.',
      keywords: ['Postifly', 'FAQ', 'вопросы', 'ответы', 'доставка', 'тарифы', 'отслеживание'],
    },
  },
  '/help': {
    ka: {
      title: 'ონლაინ გიდი',
      description: 'მიიღეთ დახმარება ნივთების გამოწერაში ონლაინ გიდის მხარდაჭერით.',
      keywords: ['Postifly', 'ონლაინ გიდი', 'დახმარება გამოწერაში', 'ონლაინ შოპინგი', 'ჩათი'],
    },
    en: {
      title: 'Online Guide',
      description: 'Get help with online ordering from the Postifly guide team.',
      keywords: ['Postifly', 'online guide', 'help with ordering', 'online shopping', 'support'],
    },
    ru: {
      title: 'Онлайн-гид',
      description: 'Получите помощь с заказом товаров от команды онлайн-гида.',
      keywords: ['Postifly', 'онлайн-гид', 'помощь с заказом', 'онлайн покупки', 'поддержка'],
    },
  },
};

function normalizeLocale(locale: string): Locale {
  if (locale === 'ka' || locale === 'en' || locale === 'ru') return locale;
  return routing.defaultLocale as Locale;
}

export function getSiteUrl(): string {
  return siteUrl;
}

export function getPageSeoCopy(locale: string, path: string): SeoLocaleEntry {
  const normalizedLocale = normalizeLocale(locale);
  const entry = seoByPath[path] ?? seoByPath['/'];
  return entry[normalizedLocale];
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
    keywords: localized.keywords,
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
