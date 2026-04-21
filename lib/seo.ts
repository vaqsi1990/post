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
      title: 'Postifly — ამანათების მიწოდება და თრექინგი საქართველოში',
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
      title: 'Postifly parcel delivery and tracking in Georgia',
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
      title: 'Postifly — доставка и трекинг посылок в Грузии',
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
      title: 'Postifly-ის შესახებ — კომპანია და სერვისის სტანდარტები',
      description: 'გაიგეთ მეტი Postifly-ს მისიისა და მომსახურების ხარისხის შესახებ.',
      keywords: ['Postifly', 'ჩვენ შესახებ', 'ლოგისტიკა', 'გადაზიდვა', 'მომსახურება', 'მისია'],
    },
    en: {
      title: 'About Postifly — company and service standards',
      description: 'Learn more about Postifly, our mission, and service quality standards.',
      keywords: ['Postifly', 'about', 'logistics', 'shipping', 'service quality', 'mission'],
    },
    ru: {
      title: 'О Postifly — компания и стандарты сервиса',
      description: 'Узнайте больше о Postifly, нашей миссии и стандартах сервиса.',
      keywords: ['Postifly', 'о нас', 'логистика', 'доставка', 'качество сервиса', 'миссия'],
    },
  },
  '/contact': {
    ka: {
      title: 'Postifly კონტაქტი — მისამართები, ტელეფონები და საათები',
      description: 'Postifly-ს საწყობების მისამართები, ტელეფონები და სამუშაო საათები.',
      keywords: ['Postifly', 'კონტაქტი', 'საწყობი', 'მისამართი', 'ტელეფონი', 'სამუშაო საათები'],
    },
    en: {
      title: 'Contact Postifly — addresses, phone numbers, and hours',
      description: 'Postifly warehouse addresses, contact numbers, and working hours.',
      keywords: ['Postifly', 'contact', 'warehouse', 'address', 'phone', 'working hours'],
    },
    ru: {
      title: 'Контакты Postifly — адреса, телефоны и часы работы',
      description: 'Адреса складов Postifly, контактные номера и рабочие часы.',
      keywords: ['Postifly', 'контакты', 'склад', 'адрес', 'телефон', 'часы работы'],
    },
  },
  '/services': {
    ka: {
      title: 'Postifly სერვისები — ონლაინ შოპინგი, კურიერი და საბაჟო',
      description: 'ონლაინ შოპინგი, კომერციული გზავნილები, კურიერი და საბაჟო მომსახურებები.',
      keywords: ['Postifly', 'სერვისები', 'ონლაინ შოპინგი', 'კურიერი', 'საბაჟო', 'კომერციული ტვირთი'],
    },
    en: {
      title: 'Postifly services — shopping, courier, and customs support',
      description: 'Online shopping support, commercial export, courier, and customs services.',
      keywords: ['Postifly', 'services', 'online shopping', 'courier', 'customs', 'commercial export'],
    },
    ru: {
      title: 'Услуги Postifly — онлайн-покупки, курьер и таможня',
      description: 'Поддержка онлайн-покупок, коммерческий экспорт, курьер и таможенные услуги.',
      keywords: ['Postifly', 'услуги', 'онлайн покупки', 'курьер', 'таможня', 'коммерческий экспорт'],
    },
  },
  '/calculator': {
    ka: {
      title: 'მიტანის კალკულატორი — ტარიფის გამოთვლა | Postifly',
      description: 'გამოთვალეთ გზავნილის მიწოდების სავარაუდო ღირებულება სწრაფად და მარტივად.',
      keywords: ['Postifly', 'კალკულატორი', 'ტარიფი', 'მიტანა', 'ფასი', 'წონა', 'მოცულობითი წონა'],
    },
    en: {
      title: 'Shipping Calculator',
      description: 'Estimate your parcel shipping price quickly and accurately.',
      keywords: ['Postifly', 'shipping calculator', 'rates', 'price estimate', 'weight', 'volumetric weight'],
    },
    ru: {
      title: 'Калькулятор доставки — расчёт тарифа | Postifly',
      description: 'Быстро рассчитайте ориентировочную стоимость доставки посылки.',
      keywords: ['Postifly', 'калькулятор', 'тариф', 'стоимость', 'вес', 'объемный вес'],
    },
  },
  '/tracking': {
    ka: {
      title: 'ამანათის თრექინგი Postifly-ზე — სტატუსი რეალურ დროში',
      description: 'რეალურ დროში გადაამოწმეთ თქვენი ამანათის სტატუსი და მოძრაობა.',
      keywords: ['Postifly', 'ტრეკინგი', 'ამანათის სტატუსი', 'თრექინგ კოდი', 'მოძრაობა', 'tracking'],
    },
    en: {
      title: 'Track your parcel with Postifly in real time',
      description: 'Track parcel status and shipment movement in real time.',
      keywords: ['Postifly', 'tracking', 'track parcel', 'tracking number', 'shipment status'],
    },
    ru: {
      title: 'Отслеживание посылки Postifly в реальном времени',
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
      title: 'ონლაინ მაღაზიები — პოპულარული ბრენდები და ბმულები | Postifly',
      description: 'პოპულარული საერთაშორისო ონლაინ მაღაზიები ერთ გვერდზე.',
      keywords: ['Postifly', 'მაღაზიები', 'ონლაინ მაღაზიები', 'Amazon', 'eBay', 'shopping'],
    },
    en: {
      title: 'Online stores — popular shops and links | Postifly',
      description: 'Popular international online stores in one place.',
      keywords: ['Postifly', 'stores', 'online stores', 'Amazon', 'eBay', 'shopping'],
    },
    ru: {
      title: 'Онлайн-магазины — популярные магазины и ссылки | Postifly',
      description: 'Популярные международные онлайн-магазины в одном месте.',
      keywords: ['Postifly', 'магазины', 'онлайн магазины', 'Amazon', 'eBay', 'покупки'],
    },
  },
  '/conditions': {
    ka: {
      title: 'მომსახურების პირობები Postifly-ზე — წესები და შეზღუდვები',
      description: 'გაეცანით მომსახურების პირობებს, წესებსა და შეზღუდვებს.',
      keywords: ['Postifly', 'პირობები', 'წესები', 'შეზღუდვები', 'დეკლარირება', 'აკრძალული ნივთები'],
    },
    en: {
      title: 'Postifly terms and conditions — rules and restrictions',
      description: 'Read service terms, declaration rules, and shipping restrictions.',
      keywords: ['Postifly', 'terms', 'conditions', 'declaration rules', 'shipping restrictions'],
    },
    ru: {
      title: 'Условия сервиса Postifly — правила и ограничения',
      description: 'Ознакомьтесь с условиями сервиса, правилами и ограничениями.',
      keywords: ['Postifly', 'условия', 'правила', 'ограничения', 'декларация', 'запрещенные товары'],
    },
  },
  '/faq': {
    ka: {
      title: 'Postifly FAQ — ხშირად დასმული კითხვები და პასუხები',
      description: 'პასუხები ყველაზე ხშირად დასმულ კითხვებზე.',
      keywords: ['Postifly', 'FAQ', 'კითხვები', 'პასუხები', 'მიწოდება', 'ტარიფები', 'დეკლარაცია'],
    },
    en: {
      title: 'Postifly FAQ — frequently asked questions and answers',
      description: 'Answers to the most frequently asked customer questions.',
      keywords: ['Postifly', 'FAQ', 'questions', 'shipping', 'rates', 'tracking', 'declaration'],
    },
    ru: {
      title: 'Postifly FAQ — частые вопросы и ответы',
      description: 'Ответы на самые часто задаваемые вопросы клиентов.',
      keywords: ['Postifly', 'FAQ', 'вопросы', 'ответы', 'доставка', 'тарифы', 'отслеживание'],
    },
  },
  '/help': {
    ka: {
      title: 'Postifly ონლაინ გიდი — დახმარება ონლაინ გამოწერაში',
      description: 'მიიღეთ დახმარება ნივთების გამოწერაში ონლაინ გიდის მხარდაჭერით.',
      keywords: ['Postifly', 'ონლაინ გიდი', 'დახმარება გამოწერაში', 'ონლაინ შოპინგი', 'ჩათი'],
    },
    en: {
      title: 'Postifly online guide — help with ordering and discounts',
      description: 'Get help with online ordering from the Postifly guide team.',
      keywords: ['Postifly', 'online guide', 'help with ordering', 'online shopping', 'support'],
    },
    ru: {
      title: 'Онлайн-гид Postifly — помощь с заказом и скидками',
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
