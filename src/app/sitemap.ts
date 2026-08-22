import type { MetadataRoute } from 'next';

import { routing } from '@/i18n/routing';
import { SITE } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routing.locales.map((locale) => ({
    url: `${SITE.url}/${locale}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: locale === routing.defaultLocale ? 1 : 0.9,
    alternates: {
      languages: {
        ru: `${SITE.url}/ru`,
        kk: `${SITE.url}/kz`,
      },
    },
  }));
}
