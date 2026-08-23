import type { MetadataRoute } from 'next';

import { routing } from '@/i18n/routing';
import { SITE } from '@/lib/constants';
import { products } from '@/lib/products';

/** Cart, checkout and order pages are personal and stay out of the index. */
const PATHS = ['', '/about', '/faq', '/shop', '/delivery', '/wholesale', '/certificates'];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const paths = [...PATHS, ...products.map((product) => `/shop/${product.slug}`)];

  return routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${SITE.url}/${locale}${path}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : path === '/shop' ? 0.9 : 0.7,
      alternates: {
        languages: { ru: `${SITE.url}/ru${path}`, kk: `${SITE.url}/kz${path}` },
      },
    })),
  );
}
