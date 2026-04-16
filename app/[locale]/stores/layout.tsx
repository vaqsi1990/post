import type { Metadata } from 'next';
import { getPageSeoMetadata } from '@/lib/seo';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params;
  return getPageSeoMetadata(locale, '/stores');
}

export default function StoresLayout({ children }: Props) {
  return children;
}
