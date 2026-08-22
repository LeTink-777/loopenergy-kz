'use client';

import { AnimatePresence, m } from 'framer-motion';
import { Check, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { useUniversalMotion } from '@/hooks/useUniversalMotion';
import { fadeUp, springPop } from './motion';
import { PurpleBorderCard } from './PurpleBorderCard';
import { PRODUCT_IMAGES, formatTenge } from '@/lib/constants';
import type { Content } from '@/lib/content';

type Product = Content['products']['items'][number];

/** Badge colour is derived from position, not from a copy string, so a renamed
 *  label never silently loses its tone. */
const badgeTone = (index: number) =>
  [
    'bg-amber-400/15 text-amber-200 border border-amber-300/30',
    'bg-white/10 text-w-80 border border-w-15',
    'bg-accent-grad text-white',
    'bg-emerald-400/15 text-emerald-200 border border-emerald-300/30',
  ][index % 4];

export function ProductCard({
  product,
  index,
  units,
  priority = false,
}: {
  product: Product;
  index: number;
  units: { caffeine: string; portions: string };
  priority?: boolean;
}) {
  const [added, setAdded] = useState(false);
  const { hoverScale, tapPress, isTouch } = useUniversalMotion();

  useEffect(() => {
    if (!added) return;
    const id = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(id);
  }, [added]);

  const image = PRODUCT_IMAGES[product.id];
  const oldPrice = Number(product.old_price);

  return (
    <m.div variants={fadeUp} className="h-full">
      <PurpleBorderCard className="group flex h-full flex-col overflow-hidden p-fluid-sm">
        <div className="relative mb-fluid-sm flex aspect-square items-center justify-center overflow-hidden rounded-[26px] bg-gradient-to-b from-white/[0.06] to-transparent">
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: 'radial-gradient(circle at 50% 60%, rgba(149,97,233,0.28), transparent 68%)',
            }}
          />

          <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-1.5">
            {product.badge ? (
              <span
                className={`rounded-pill px-3 py-1 text-fluid-xs font-bold uppercase tracking-wider ${badgeTone(index)}`}
              >
                {product.badge}
              </span>
            ) : null}
            {product.badge_2 ? (
              <span className="rounded-pill border border-w-15 bg-black/30 px-3 py-1 text-fluid-xs font-bold uppercase tracking-wider text-w-80">
                {product.badge_2}
              </span>
            ) : null}
          </div>

          <m.div
            className="relative h-full w-full"
            whileHover={isTouch ? undefined : { scale: 1.05 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={image}
              alt={product.name}
              fill
              priority={priority}
              sizes="(max-width: 400px) 82vw, (max-width: 640px) 300px, (max-width: 1024px) 45vw, (max-width: 1280px) 30vw, 300px"
              className="object-contain p-4 drop-shadow-[0_18px_36px_rgba(0,0,0,0.45)]"
            />
          </m.div>
        </div>

        <div className="flex flex-1 flex-col">
          <h3 className="text-fluid-md font-bold uppercase tracking-tight">{product.name}</h3>
          <p className="mt-1 text-fluid-sm font-medium text-accent-light">{product.tagline}</p>

          <p className="mt-2 flex-1 text-fluid-sm leading-relaxed text-w-70">{product.description}</p>

          <div className="mt-fluid-xs flex flex-wrap gap-2">
            <span className="rounded-pill border border-accent/25 bg-accent/10 px-3 py-1 text-fluid-xs font-semibold text-accent-light">
              {product.caffeine} {units.caffeine}
            </span>
            <span className="rounded-pill border border-w-10 px-3 py-1 text-fluid-xs font-semibold text-w-70">
              {product.portions} {units.portions}
            </span>
          </div>

          {/* Wraps to a stacked layout when the card is too narrow for one row. */}
          <div className="mt-fluid-sm flex flex-wrap items-end justify-between gap-3">
            <div className="shrink-0">
              {oldPrice > 0 ? (
                <p className="whitespace-nowrap text-fluid-sm text-w-50 line-through">
                  {formatTenge(oldPrice)}
                </p>
              ) : null}
              <p className="whitespace-nowrap text-fluid-xl font-extrabold tracking-tight">
                {formatTenge(Number(product.price))}
              </p>
              {product.price_sub ? (
                <p className="whitespace-nowrap text-fluid-xs text-accent-light">{product.price_sub}</p>
              ) : null}
            </div>

            <m.button
              type="button"
              onClick={() => setAdded(true)}
              whileHover={hoverScale}
              whileTap={tapPress}
              transition={springPop}
              aria-live="polite"
              className={`inline-flex min-w-[132px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-pill px-5 py-3 text-fluid-xs font-bold uppercase tracking-wide transition-colors ${
                added ? 'bg-emerald-400/90 text-[#10231a]' : 'bg-accent-grad text-white shadow-glow-sm'
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <m.span
                    key="added"
                    className="inline-flex items-center gap-2"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={springPop}
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </m.span>
                ) : (
                  <m.span
                    key="idle"
                    className="inline-flex items-center gap-2"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={springPop}
                  >
                    <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                    {product.cta}
                  </m.span>
                )}
              </AnimatePresence>
            </m.button>
          </div>
        </div>
      </PurpleBorderCard>
    </m.div>
  );
}
