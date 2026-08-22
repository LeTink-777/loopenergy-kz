'use client';

import { m } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Link } from '@/i18n/navigation';
import { useUniversalMotion } from '@/hooks/useUniversalMotion';
import { PurpleBorderCard } from '@/components/ui/PurpleBorderCard';
import { fadeUp, springPop } from '@/components/ui/motion';
import { VariantPicker } from './VariantPicker';
import { formatTenge } from '@/lib/constants';
import type { Locale } from '@/lib/content';
import { t as pick, type Product } from '@/lib/products';
import { useCartStore } from '@/store/cartStore';

export function ProductGridCard({
  product,
  priority = false,
  headingLevel = 'h3',
}: {
  product: Product;
  priority?: boolean;
  /** `h2` where the cards sit directly under the page `h1`. */
  headingLevel?: 'h2' | 'h3';
}) {
  const Heading = headingLevel;
  const locale = useLocale() as Locale;
  const t = useTranslations('shop');
  const addItem = useCartStore((s) => s.addItem);
  const { hoverScale, tapPress, isTouch } = useUniversalMotion();

  const [strength, setStrength] = useState(product.strength[1]?.id ?? product.strength[0]?.id ?? '');

  const name = pick(product.name, locale);
  const selected = product.strength.find((s) => s.id === strength);

  const add = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name,
      image: product.image,
      price: product.price,
      strength: selected?.id,
      strengthLabel: selected ? pick(selected.label, locale) : undefined,
    });
    toast.success(t('toast_added', { name }));
  };

  return (
    <m.div variants={fadeUp} className="h-full">
      <PurpleBorderCard className="group flex h-full flex-col overflow-hidden p-fluid-sm">
        <Link
          href={`/shop/${product.slug}`}
          className="relative mb-fluid-sm block aspect-square overflow-hidden rounded-[26px] bg-gradient-to-b from-white/[0.06] to-transparent"
        >
          <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-1.5">
            {product.badge ? (
              <span className="rounded-pill bg-accent-grad px-3 py-1 text-fluid-xs font-bold uppercase tracking-wider text-white">
                {pick(product.badge, locale)}
              </span>
            ) : null}
            {!product.inStock ? (
              <span className="rounded-pill border border-w-15 bg-black/50 px-3 py-1 text-fluid-xs font-bold uppercase tracking-wider text-w-70">
                {t('out_of_stock')}
              </span>
            ) : null}
          </div>

          <m.div
            className="relative h-full w-full"
            whileHover={isTouch ? undefined : { scale: 1.06 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={product.image}
              alt={name}
              fill
              priority={priority}
              sizes="(max-width: 400px) 82vw, (max-width: 640px) 300px, (max-width: 1024px) 45vw, 300px"
              className="object-contain p-4 drop-shadow-[0_18px_36px_rgba(0,0,0,0.45)]"
            />
          </m.div>
        </Link>

        <div className="flex flex-1 flex-col">
          <Heading className="text-fluid-md font-bold uppercase tracking-tight">
            <Link href={`/shop/${product.slug}`} className="transition-colors hover:text-accent-light">
              {name}
            </Link>
          </Heading>
          <p className="mt-1 flex-1 text-fluid-sm leading-relaxed text-w-70">
            {pick(product.tagline, locale)}
          </p>

          {product.strength.length > 0 ? (
            <div className="mt-fluid-sm">
              <VariantPicker
                name={`strength-${product.id}`}
                label={t('strength_label')}
                value={strength}
                onChange={setStrength}
                options={product.strength.map((s) => ({ id: s.id, label: pick(s.label, locale) }))}
              />
            </div>
          ) : null}

          <div className="mt-fluid-sm flex flex-wrap items-end justify-between gap-3">
            <div className="shrink-0">
              {product.oldPrice ? (
                <p className="whitespace-nowrap text-fluid-sm text-w-50 line-through">
                  {formatTenge(product.oldPrice)}
                </p>
              ) : null}
              <p className="whitespace-nowrap text-fluid-xl font-extrabold tracking-tight">
                {formatTenge(product.price)}
              </p>
            </div>

            <m.button
              type="button"
              onClick={add}
              disabled={!product.inStock}
              whileHover={product.inStock ? hoverScale : undefined}
              whileTap={product.inStock ? tapPress : undefined}
              transition={springPop}
              className="inline-flex min-h-[44px] min-w-[132px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-pill bg-accent-grad px-5 text-fluid-xs font-bold uppercase tracking-wide text-white shadow-glow-sm disabled:opacity-40 disabled:shadow-none"
            >
              <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
              {product.inStock ? t('add_to_cart') : t('out_of_stock')}
            </m.button>
          </div>
        </div>
      </PurpleBorderCard>
    </m.div>
  );
}
