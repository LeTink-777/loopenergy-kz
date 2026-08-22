import type { Content } from '@/lib/content';

/**
 * Teaches next-intl the shape of our messages, so `t('hero.h1')` is checked at
 * build time and a typo in a key becomes a compile error.
 */
declare module 'next-intl' {
  interface AppConfig {
    Messages: Content;
    Locale: 'ru' | 'kz';
  }
}
