'use client';

import { m } from 'framer-motion';
import { Check, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { useUniversalMotion } from '@/hooks/useUniversalMotion';
import { EASE } from '@/components/ui/motion';
import { CONTACTS } from '@/lib/constants';

export function OrderSuccess({ orderId }: { orderId: string }) {
  const t = useTranslations('order');
  const { reducedMotion } = useUniversalMotion();

  return (
    <div className="purple-ring mx-auto flex max-w-2xl flex-col items-center px-fluid-md py-fluid-2xl text-center">
      <m.span
        className="grid h-20 w-20 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"
        initial={{ scale: reducedMotion ? 1 : 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 16 }}
      >
        <m.span
          initial={{ scale: reducedMotion ? 1 : 0, rotate: reducedMotion ? 0 : -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.15 }}
        >
          <Check className="h-10 w-10" aria-hidden="true" />
        </m.span>
      </m.span>

      <m.h1
        className="h2 mt-fluid-md"
        initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE, delay: 0.2 }}
      >
        {t('title', { id: orderId })}
      </m.h1>

      <m.p
        className="mt-fluid-xs max-w-md text-fluid-base text-w-70"
        initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE, delay: 0.3 }}
      >
        {t('subtitle')}
      </m.p>

      <m.div
        className="mt-fluid-lg flex flex-col gap-fluid-xs sm:flex-row"
        initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE, delay: 0.4 }}
      >
        <a
          href={CONTACTS.consumerTelegram.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-pill bg-accent-grad px-7 text-fluid-sm font-bold uppercase tracking-wide text-white shadow-glow"
        >
          <Send className="h-[18px] w-[18px]" aria-hidden="true" />
          {t('support')}
        </a>

        <Link
          href="/shop"
          className="inline-flex min-h-[52px] items-center justify-center rounded-pill border border-w-15 px-7 text-fluid-sm font-bold uppercase tracking-wide text-w-80 transition-colors hover:border-accent/45 hover:text-white"
        >
          {t('continue')}
        </Link>
      </m.div>
    </div>
  );
}
