'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { fadeUp, springPop } from './motion';
import { PurpleBorderCard } from './PurpleBorderCard';
import { formatTenge, type Product } from '@/lib/constants';

const badgeTone: Record<string, string> = {
  hit: 'bg-accent-grad text-white',
  new: 'bg-emerald-400/15 text-emerald-200 border border-emerald-300/30',
  profit: 'bg-amber-400/15 text-amber-200 border border-amber-300/30',
};

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const t = useTranslations('products');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const id = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(id);
  }, [added]);

  const name = t(`items.${product.key}.name`);

  return (
    <motion.div variants={fadeUp} className="h-full">
      <PurpleBorderCard className="group flex h-full flex-col overflow-hidden p-5 sm:p-6">
        <div className="relative mb-5 flex aspect-square items-center justify-center overflow-hidden rounded-[26px] bg-gradient-to-b from-white/[0.06] to-transparent">
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: 'radial-gradient(circle at 50% 60%, rgba(149,97,233,0.28), transparent 68%)',
            }}
          />

          {product.badge ? (
            <span
              className={`absolute left-4 top-4 z-10 rounded-pill px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${badgeTone[product.badge]}`}
            >
              {t(`badges.${product.badge}`)}
            </span>
          ) : null}

          <motion.div
            className="relative h-full w-full"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={product.image}
              alt={name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, (max-width: 1280px) 30vw, 22vw"
              className="object-contain p-4 drop-shadow-[0_18px_36px_rgba(0,0,0,0.45)]"
            />
          </motion.div>
        </div>

        <div className="flex flex-1 flex-col">
          <h3 className="text-lg font-bold uppercase tracking-tight">{name}</h3>

          <p className="mt-2 flex-1 text-sm leading-relaxed text-w-70">
            {t(`items.${product.key}.desc`)}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-pill border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-semibold text-accent-light">
              {product.caffeine} {t('caffeine')}
            </span>
            <span className="rounded-pill border border-w-10 px-3 py-1 text-[11px] font-semibold text-w-70">
              {product.portions} {t('perPack')}
            </span>
          </div>

          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              {product.oldPrice ? (
                <p className="text-sm text-w-50 line-through">{formatTenge(product.oldPrice)}</p>
              ) : null}
              <p className="text-2xl font-extrabold tracking-tight">{formatTenge(product.price)}</p>
            </div>

            <motion.button
              type="button"
              onClick={() => setAdded(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              transition={springPop}
              aria-live="polite"
              className={`inline-flex min-w-[132px] items-center justify-center gap-2 rounded-pill px-5 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${
                added ? 'bg-emerald-400/90 text-[#10231a]' : 'bg-accent-grad text-white shadow-glow-sm'
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span
                    key="added"
                    className="inline-flex items-center gap-2"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={springPop}
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    className="inline-flex items-center gap-2"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={springPop}
                  >
                    <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                    {t('addToCart')}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </PurpleBorderCard>
    </motion.div>
  );
}
