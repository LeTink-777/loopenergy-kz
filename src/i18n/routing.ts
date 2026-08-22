import { defineRouting } from 'next-intl/routing';

export const locales = ['ru', 'kz'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'ru',
  localePrefix: 'always',
  // next-intl would advertise hreflang="kz" (a country code, not a language) in its
  // Link headers. Correct ru/kk alternates come from `generateMetadata` instead.
  alternateLinks: false,
});
