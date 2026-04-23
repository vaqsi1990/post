import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Enable HTTP compression at the Next.js server layer where applicable.
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/s2/favicons/**",
      },
    ],
  },
  async headers() {
    return [
      // CDN caching (Vercel): aggressively cache static assets from /public
      // and other file-type requests. Dynamic HTML/API caching should be
      // configured per-route where appropriate.
      {
        source:
          "/:path*\\.(svg|png|jpg|jpeg|webp|avif|gif|ico|css|js|map|woff|woff2|ttf|otf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, s-maxage=31536000, immutable",
          },
        ],
      },
      {
        source:
          '/:locale(ka|en|ru)/(admin|dashboard|employee|support|login|register|reset-password)/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet',
          },
        ],
      },
      {
        source: '/(admin|dashboard|employee|support|login|register|reset-password)/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
