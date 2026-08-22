'use client';

import { m } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n/routing';

/**
 * RU | KZ pill with a sliding indicator. The indicator is driven by a transform
 * rather than a shared layout animation so the page can stay on Framer Motion's
 * lighter `domAnimation` feature set.
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const t = useTranslations('languages');
  const active = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const activeIndex = Math.max(0, locales.indexOf(active));

  const select = (next: Locale) => {
    if (next === active) return;
    startTransition(() => {
      // `pathname` is locale-free here, so the same path is kept under the new locale.
      router.replace(pathname, { locale: next, scroll: false });
    });
  };

  return (
    <div
      className={`relative flex items-center rounded-pill border border-w-10 bg-white/[0.04] p-1 ${className}`}
      role="group"
      aria-label={t('switch')}
      data-pending={isPending || undefined}
    >
      <m.span
        aria-hidden="true"
        className="absolute left-1 top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-pill bg-accent-grad shadow-glow-sm"
        animate={{ x: `${activeIndex * 100}%` }}
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      />

      {locales.map((locale) => {
        const isActive = locale === active;

        return (
          <button
            key={locale}
            type="button"
            onClick={() => select(locale)}
            aria-current={isActive ? 'true' : undefined}
            className={`relative z-10 flex-1 rounded-pill px-3 py-1 text-fluid-xs font-bold uppercase tracking-[0.1em] transition-colors duration-200 ${
              isActive ? 'text-white' : 'text-w-50 hover:text-w-80'
            }`}
          >
            {t(locale)}
          </button>
        );
      })}
    </div>
  );
}
