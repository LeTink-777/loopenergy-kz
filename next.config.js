const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    // Tree-shakes icon imports so only the glyphs we use reach the bundle.
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'loopenergy.ru' }],
    formats: ['image/avif', 'image/webp'],
    // Ladder covers 280px foldables through 4K desktops.
    deviceSizes: [320, 375, 414, 500, 640, 750, 828, 1080, 1200, 1920, 2048, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2678400,
  },
};

module.exports = withNextIntl(nextConfig);
