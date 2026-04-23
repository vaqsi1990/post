import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Enable HTTP compression at the Next.js server layer where applicable.
  compress: true,
  turbopack: {
    // Avoid incorrect root inference when multiple lockfiles exist on disk.
    root: __dirname,
  },
  images: {
    qualities: [75, 85],
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
      // Baseline security headers (safe defaults; keep CSP out unless we audit all integrations).
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
          },
          // HSTS is meaningful only on HTTPS (Vercel serves HTTPS in production).
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-site" },
        ],
      },
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
      // Never cache authenticated/private areas (avoid leaking user-specific content via shared caches).
      {
        source: "/:locale(ka|en|ru)/(admin|dashboard|employee|support)/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      },
      {
        source: "/(admin|dashboard|employee|support)/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      },
      // Auth endpoints must never be cached.
      {
        source: "/api/auth/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      },
      // Other sensitive APIs
      {
        source: "/api/(admin|dashboard|employee|support)/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
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
