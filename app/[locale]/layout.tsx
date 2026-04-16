import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import Header from '../Components/Header';
import Footer from '../Components/Footer';

import { Metadata } from 'next';
import ChatWidget from '../Components/ChatWidget';
import { getPageSeoMetadata, getSiteUrl } from '@/lib/seo';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params;
  const baseMeta = getPageSeoMetadata(locale, '/');

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: 'Postifly',
      template: '%s | Postifly',
    },
    description: baseMeta.description,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    icons: {
      icon: [
        { url: '/logo.jpg', type: 'image/jpeg' },
        { url: '/logo.jpg', sizes: '32x32', type: 'image/jpeg' },
        { url: '/logo.jpg', sizes: '32x32', type: 'image/jpeg' },
        { url: '/logo.jpg', sizes: '48x48', type: 'image/jpeg' },
      ],
      shortcut: '/logo2.jpg',
      apple: '/logo.jpg',
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const siteUrl = getSiteUrl();
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Postifly',
    url: siteUrl,
    logo: `${siteUrl}/logo2.jpg`,
    sameAs: [],
  };
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Postifly',
    url: `${siteUrl}/${locale}`,
    inLanguage: locale,
  };

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Header />
      <div className="flex min-h-[100vh] flex-col">
        <main className="flex flex-1 flex-col">   <ChatWidget />  {children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
