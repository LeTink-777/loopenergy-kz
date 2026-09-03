'use client';

import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { EASE } from '@/components/ui/motion';
import { formatTenge } from '@/lib/constants';
import { visibleProducts as products } from '@/lib/products';
import { Link } from '@/i18n/navigation';

/**
 * Always-reachable CTA for screens too narrow to show the header nav.
 * Visibility is CSS-only (`.sticky-cta` hides itself at 700px), so there is no
 * device sniffing and no layout thrash on resize.
 */
export function StickyCta() {
  const t = useTranslations();
  const { scrollY } = useScroll();
  const [shown, setShown] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setShown(latest > 600);
  });

  const cheapest = products.reduce((low, item) => (item.price < low.price ? item : low), products[0]);

  return (
    <AnimatePresence>
      {shown ? (
        <m.div
          key="sticky-cta"
          className="sticky-cta"
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          exit={{ y: '110%' }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <div className="min-w-0">
            <p className="truncate text-fluid-xs uppercase tracking-[0.12em] text-w-50">
              {t('products.badge')}
            </p>
            <p className="whitespace-nowrap text-fluid-md font-extrabold leading-tight">
              {t('products.from_price', { price: formatTenge(cheapest.price) })}
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex min-h-[44px] max-w-[190px] flex-1 items-center justify-center gap-2 rounded-pill bg-accent-grad px-fluid-sm text-fluid-xs font-bold uppercase tracking-wide text-white shadow-glow-sm"
          >
            <span className="truncate">{t('header.nav.catalog')}</span>
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </Link>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
