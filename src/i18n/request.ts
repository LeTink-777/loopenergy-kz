import { getRequestConfig } from 'next-intl/server';

import { content } from '@/lib/content';
import { routing, type Locale } from './routing';

/**
 * Messages come straight from `src/lib/content.ts` — there is no message JSON
 * to keep in sync, so a copy edit lands everywhere at once.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = routing.locales.includes(requested as Locale)
    ? (requested as Locale)
    : routing.defaultLocale;

  return {
    locale,
    messages: content[locale] as unknown as Record<string, unknown>,
  };
});
