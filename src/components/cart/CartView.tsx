'use client';

import { AnimatePresence, m } from 'framer-motion';
import { ShoppingCart, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import toast from 'react-hot-toast';

import { Link } from '@/i18n/navigation';
import { useHydrated } from '@/hooks/useHydrated';
import { useUniversalMotion } from '@/hooks/useUniversalMotion';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { EASE, springPop } from '@/components/ui/motion';
import { formatTenge } from '@/lib/constants';
import { useCartStore } from '@/store/cartStore';

export function CartView() {
  const t = useTranslations('cart');
  const tProduct = useTranslations('product_page');
  const hydrated = useHydrated();
  const { hoverScale, tapPress } = useUniversalMotion();

  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Before hydration the persisted cart is unknown; render the shell only.
  if (!hydrated) {
    return <div className="purple-ring min-h-[320px] animate-pulse" aria-hidden="true" />;
  }

  if (items.length === 0) {
    return (
      <div className="purple-ring flex flex-col items-center gap-fluid-xs px-fluid-md py-fluid-2xl text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full border border-accent/25 bg-accent/10 text-accent-light">
          <ShoppingCart className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="mt-fluid-xs text-fluid-lg font-bold uppercase tracking-tight">{t('empty_title')}</p>
        <p className="max-w-sm text-fluid-sm text-w-70">{t('empty_text')}</p>
        <Link
          href="/shop"
          className="mt-fluid-xs inline-flex min-h-[48px] items-center rounded-pill bg-accent-grad px-7 text-fluid-xs font-bold uppercase tracking-wide text-white shadow-glow"
        >
          {t('empty_cta')}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-fluid-lg lg:grid-cols-[1.7fr_1fr] lg:items-start">
      <ul className="flex flex-col gap-fluid-xs">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const lineKey = `${item.productId}-${item.flavor ?? ''}-${item.strength ?? ''}`;
            const variant = [item.strengthLabel, item.flavorLabel].filter(Boolean).join(' · ');

            return (
              <m.li
                key={lineKey}
                layout={false}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -24, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="purple-ring overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-fluid-sm p-fluid-sm">
                  <Link
                    href={`/shop/${item.slug}`}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-white/[0.05]"
                  >
                    <Image src={item.image} alt={item.name} fill sizes="96px" className="object-contain p-2" />
                  </Link>

                  <div className="min-w-[9rem] flex-1">
                    <Link
                      href={`/shop/${item.slug}`}
                      className="text-fluid-base font-bold uppercase tracking-tight transition-colors hover:text-accent-light"
                    >
                      {item.name}
                    </Link>
                    {variant ? <p className="mt-1 text-fluid-xs text-w-50">{variant}</p> : null}
                    <p className="mt-1 text-fluid-sm text-w-70">{formatTenge(item.price)}</p>
                  </div>

                  <QuantityStepper
                    size="sm"
                    value={item.quantity}
                    onChange={(next) => updateQuantity(item.productId, next, item.flavor, item.strength)}
                    min={1}
                    labels={{ less: tProduct('quantity_less'), more: tProduct('quantity_more') }}
                  />

                  <p className="min-w-[6rem] whitespace-nowrap text-right text-fluid-md font-extrabold tabular-nums">
                    {formatTenge(item.price * item.quantity)}
                  </p>

                  <m.button
                    type="button"
                    aria-label={t('remove')}
                    onClick={() => {
                      removeItem(item.productId, item.flavor, item.strength);
                      toast(t('toast_removed'));
                    }}
                    whileTap={{ scale: 0.9 }}
                    transition={springPop}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-pill border border-w-10 text-w-50 transition-colors hover:border-rose-400/40 hover:text-rose-300"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </m.button>
                </div>
              </m.li>
            );
          })}
        </AnimatePresence>
      </ul>

      <aside className="purple-ring p-fluid-md lg:sticky lg:top-[calc(var(--header-h)+24px)]">
        <p className="text-fluid-md font-bold uppercase tracking-tight">{t('summary_title')}</p>

        <dl className="mt-fluid-sm flex flex-col gap-fluid-xs text-fluid-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-w-70">{t('subtotal')}</dt>
            <dd className="font-semibold tabular-nums">{formatTenge(subtotal)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-w-70">{t('delivery')}</dt>
            <dd className="text-right text-fluid-xs text-w-50">{t('delivery_note')}</dd>
          </div>
        </dl>

        <div className="mt-fluid-sm flex items-baseline justify-between gap-4 border-t border-w-10 pt-fluid-sm">
          <span className="text-fluid-sm uppercase tracking-wide text-w-70">{t('total')}</span>
          <span className="text-fluid-xl font-extrabold tabular-nums">{formatTenge(subtotal)}</span>
        </div>

        <m.div whileHover={hoverScale} whileTap={tapPress} transition={springPop} className="mt-fluid-md">
          <Link
            href="/checkout"
            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-pill bg-accent-grad px-6 text-fluid-sm font-bold uppercase tracking-wide text-white shadow-glow"
          >
            {t('checkout')}
          </Link>
        </m.div>

        <Link
          href="/shop"
          className="mt-fluid-xs inline-flex min-h-[48px] w-full items-center justify-center rounded-pill border border-w-15 px-6 text-fluid-xs font-bold uppercase tracking-wide text-w-70 transition-colors hover:border-accent/45 hover:text-white"
        >
          {t('continue')}
        </Link>
      </aside>
    </div>
  );
}
