import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import Header from '../Components/Header';
import Footer from '../Components/Footer';

import { Metadata } from 'next';
import ChatWidget from '../Components/ChatWidget';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Postifly',
  description: 'Postifly',
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

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Header />
      <div className="flex min-h-[100vh] flex-col">
        <main className="flex flex-1 flex-col">   <ChatWidget />  {children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
