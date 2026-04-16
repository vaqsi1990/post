import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.postifly.ge';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Postifly',
    short_name: 'Postifly',
    description: 'International parcel forwarding, declaration, and shipment tracking.',
    start_url: '/ka',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    lang: 'ka',
    icons: [
      {
        src: `${siteUrl}/logo.jpg`,
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: `${siteUrl}/logo2.jpg`,
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  };
}
