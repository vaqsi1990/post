import type { MetadataRoute } from 'next';
import { routing } from '../i18n/routing';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.postifly.ge';

const publicRoutes = [
  '',
  '/about',
  '/contact',
  '/services',
  '/calculator',
  '/tracking',
  '/dates',
  '/stores',
  '/conditions',
  '/faq',
  '/help',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routing.locales.flatMap((locale) =>
    publicRoutes.map((route) => ({
      url: `${siteUrl}/${locale}${route}`,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((lng) => [lng, `${siteUrl}/${lng}${route}`])
        ),
      },
      lastModified: now,
      changeFrequency: route === '' ? 'daily' : 'weekly',
      priority: route === '' ? 1 : 0.7,
    }))
  );
}
