const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'loopenergy.ru' }],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400,
  },
};

module.exports = withNextIntl(nextConfig);
