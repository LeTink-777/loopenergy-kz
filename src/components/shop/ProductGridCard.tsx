'use client';

import { m } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

import { ProductImage } from '@/components/ui/ProductImage';
import { PurpleBorderCard } from '@/components/ui/PurpleBorderCard';
import { fadeUp, springPop } from '@/components/ui/motion';
import { useUniversalMotion } from '@/hooks/useUniversalMotion';
import { Link } from '@/i18n/navigation';
import { formatTenge } from '@/lib/constants';
import type { Locale } from '@/lib/content';
import { t as pick, type Product } from '@/lib/products';
import { useCartStore } from '@/store/cartStore';

/**
 * Deliberately spare: image, NEW flag, name, one line of flavour, price, one
 * button. The strength picker, the caffeine and pouch-count chips and the
 * secondary badges all moved to the product page — in a four-across grid they
 * competed with the thing the card is for, which is getting a tin into the
 * cart or getting you to the detail page.
 */
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

  const name = pick(product.name, locale);
  // No picker on the card any more, so the cart gets the default strength and
  // the product page stays the place to choose another.
  const preset = product.strength[1] ?? product.strength[0];

  const add = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name,
      image: product.image,
      price: product.price,
      strength: preset?.id,
      strengthLabel: preset ? pick(preset.label, locale) : undefined,
    });
    toast.success(t('toast_added', { name }));
  };

  return (
    <m.div variants={fadeUp} className="h-full">
      <PurpleBorderCard className="product-card p-3">
        <Link href={`/shop/${product.slug}`} className="product-card-media group overflow-hidden">
          {product.isNew ? (
            <span className="absolute left-3 top-3 z-10 rounded-pill bg-accent-grad px-2.5 py-1 text-fluid-xs font-bold uppercase tracking-wider text-white">
              NEW
            </span>
          ) : null}

          <m.div
            className="relative h-full w-full"
            whileHover={isTouch ? undefined : { scale: 1.06 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductImage
              src={product.image}
              alt={name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px"
              className="object-contain p-4 drop-shadow-[0_18px_36px_rgba(0,0,0,0.45)]"
            />
          </m.div>
        </Link>

        <div className="product-card-body">
          <Heading className="product-card-name">
            <Link href={`/shop/${product.slug}`} className="transition-colors hover:text-accent-light">
              {name}
            </Link>
          </Heading>
          <p className="product-card-tagline">{pick(product.tagline, locale)}</p>

          <div className="product-card-footer">
            <p className="whitespace-nowrap text-fluid-md font-extrabold tracking-tight text-accent-light">
              {formatTenge(product.price)}
            </p>

            <m.button
              type="button"
              onClick={add}
              disabled={!product.inStock}
              whileHover={product.inStock ? hoverScale : undefined}
              whileTap={product.inStock ? tapPress : undefined}
              transition={springPop}
              className="btn-glass w-full"
            >
              {product.inStock ? t('add_to_cart') : t('out_of_stock')}
            </m.button>
          </div>
        </div>
      </PurpleBorderCard>
    </m.div>
  );
}
