import type { MetadataRoute } from 'next';
import { routing } from '../i18n/routing';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.postifly.ge';
const privatePaths = [
  '/admin',
  '/dashboard',
  '/employee',
  '/support',
  '/login',
  '/register',
  '/reset-password',
];

export default function robots(): MetadataRoute.Robots {
  const disallow = routing.locales.flatMap((locale) =>
    privatePaths.map((path) => `/${locale}${path}`)
  );

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow,
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
