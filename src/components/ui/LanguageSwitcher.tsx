'use client';

import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n/routing';

/** RU | KZ pill with a sliding indicator; switching keeps the current path. */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const t = useTranslations('languages');
  const active = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const select = (next: Locale) => {
    if (next === active) return;
    startTransition(() => {
      router.replace(
        // `params` carries any dynamic segments so the path survives the switch.
        { pathname, params: params as never },
        { locale: next, scroll: false },
      );
    });
  };

  return (
    <div
      className={`relative flex items-center rounded-pill border border-w-10 bg-white/[0.04] p-1 ${className}`}
      role="group"
      aria-label={t('switch')}
      data-pending={isPending || undefined}
    >
      {locales.map((locale) => {
        const isActive = locale === active;

        return (
          <button
            key={locale}
            type="button"
            onClick={() => select(locale)}
            aria-current={isActive ? 'true' : undefined}
            className={`relative z-10 rounded-pill px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] transition-colors duration-200 ${
              isActive ? 'text-white' : 'text-w-50 hover:text-w-80'
            }`}
          >
            {isActive ? (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 -z-10 rounded-pill bg-accent-grad shadow-glow-sm"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            ) : null}
            {t(locale)}
          </button>
        );
      })}
    </div>
  );
}
