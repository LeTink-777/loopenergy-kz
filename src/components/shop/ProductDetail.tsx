'use client';

import { m } from 'framer-motion';
import { ArrowLeft, ChevronDown, FileDown, ShieldAlert, ShoppingBag, Truck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { ProductImage } from '@/components/ui/ProductImage';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Link, useRouter } from '@/i18n/navigation';
import { useUniversalMotion } from '@/hooks/useUniversalMotion';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { VariantPicker } from './VariantPicker';
import { ProductGridCard } from './ProductGridCard';
import { RevealGroup } from '@/components/ui/Reveal';
import { springPop } from '@/components/ui/motion';
import { formatTenge } from '@/lib/constants';
import type { Locale } from '@/lib/content';
import { relatedProducts, t as pick, type Product } from '@/lib/products';
import { useCartStore } from '@/store/cartStore';

function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="purple-ring overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-[56px] w-full items-center justify-between gap-4 px-fluid-sm text-left"
      >
        <span className="text-fluid-base font-semibold">{title}</span>
        <m.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 22 }}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-pill border border-accent/25 bg-accent/10 text-accent-light"
        >
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </m.span>
      </button>

      <m.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div className="px-fluid-sm pb-fluid-sm text-fluid-sm leading-relaxed text-w-70">{children}</div>
      </m.div>
    </div>
  );
}

export function ProductDetail({ product }: { product: Product }) {
  const locale = useLocale() as Locale;
  const t = useTranslations('product_page');
  const tInfo = useTranslations('product_info');
  const tHow = useTranslations('how_to_use');
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const { hoverScale, tapPress } = useUniversalMotion();

  const [flavor, setFlavor] = useState(product.flavors[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const name = pick(product.name, locale);
  const selectedFlavor = product.flavors.find((f) => f.id === flavor);
  const ingredients = tInfo.raw('ingredients') as { name: string; description: string }[];
  const steps = tHow.raw('steps') as { num: string; title: string; description: string }[];

  const add = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name,
      image: product.image,
      price: product.price,
      quantity,
      flavor: product.flavors.length > 1 ? selectedFlavor?.id : undefined,
      flavorLabel:
        product.flavors.length > 1 && selectedFlavor ? pick(selectedFlavor.name, locale) : undefined,
    });
    toast.success(t('toast_added', { name }));
  };

  const buyNow = () => {
    add();
    router.push('/checkout');
  };

  const related = relatedProducts(product.slug);

  return (
    <div className="container-content">
      <Link
        href="/shop"
        className="inline-flex min-h-[44px] items-center gap-2 text-fluid-sm font-semibold text-w-70 transition-colors hover:text-accent-light"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('back')}
      </Link>

      <div className="mt-fluid-md grid-2col !items-start">
        <div className="min-w-0">
          <div className="purple-ring relative aspect-square overflow-hidden">
            <ProductImage
              src={product.images[activeImage] ?? product.image}
              alt={name}
              fill
              priority
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 60vw, 520px"
              className="object-contain p-fluid-lg drop-shadow-[0_28px_48px_rgba(0,0,0,0.5)]"
            />
          </div>

          {product.images.length > 1 ? (
            <div className="mt-fluid-xs flex flex-wrap gap-2">
              {product.images.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`${name} ${index + 1}`}
                  className={`relative h-20 w-20 overflow-hidden rounded-2xl border transition-colors ${
                    index === activeImage ? 'border-accent/60' : 'border-w-10 hover:border-accent/35'
                  }`}
                >
                  <ProductImage src={src} alt="" fill sizes="80px" className="object-contain p-2" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="min-w-0">
          {product.badge ? (
            <span className="inline-flex rounded-pill bg-accent-grad px-3.5 py-1.5 text-fluid-xs font-bold uppercase tracking-wider text-white">
              {pick(product.badge, locale)}
            </span>
          ) : null}

          <h1 className="h2 mt-fluid-xs">{name}</h1>
          <p className="mt-fluid-2xs text-fluid-md text-accent-light">{pick(product.tagline, locale)}</p>

          <div className="mt-fluid-sm flex flex-wrap items-baseline gap-3">
            {product.oldPrice ? (
              <span className="text-fluid-md text-w-50 line-through">{formatTenge(product.oldPrice)}</span>
            ) : null}
            <span className="text-fluid-3xl font-extrabold tracking-tight">{formatTenge(product.price)}</span>
            <span className="text-fluid-sm text-w-50">
              {formatTenge(Math.round(product.price / product.pouches))} {t('per_pouch')}
            </span>
          </div>

          <div className="mt-fluid-sm flex flex-wrap gap-2">
            <span className="rounded-pill border border-accent/25 bg-accent/10 px-3.5 py-1.5 text-fluid-xs font-semibold text-accent-light">
              {product.caffeine} {t('caffeine_unit')}
            </span>
            <span className="rounded-pill border border-w-10 px-3.5 py-1.5 text-fluid-xs font-semibold text-w-70">
              {product.pouches} {t('pouches_unit')}
            </span>
          </div>

          <div className="mt-fluid-md flex flex-col gap-fluid-sm">
            {product.flavors.length > 1 ? (
              <VariantPicker
                name={`detail-flavor-${product.id}`}
                label={t('flavor_title')}
                value={flavor}
                onChange={setFlavor}
                options={product.flavors.map((f) => ({
                  id: f.id,
                  label: pick(f.name, locale),
                  color: f.color,
                  disabled: !f.inStock,
                }))}
              />
            ) : null}

            <div>
              <p className="text-fluid-xs font-semibold uppercase tracking-[0.14em] text-w-50">
                {t('quantity_title')}
              </p>
              <div className="mt-fluid-xs">
                <QuantityStepper
                  value={quantity}
                  onChange={setQuantity}
                  labels={{ less: t('quantity_less'), more: t('quantity_more') }}
                />
              </div>
            </div>
          </div>

          <div className="mt-fluid-md flex flex-col gap-fluid-xs sm:flex-row">
            <m.button
              type="button"
              onClick={add}
              disabled={!product.inStock}
              whileHover={product.inStock ? hoverScale : undefined}
              whileTap={product.inStock ? tapPress : undefined}
              transition={springPop}
              className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2.5 rounded-pill bg-accent-grad px-6 text-fluid-sm font-bold uppercase tracking-wide text-white shadow-glow disabled:opacity-40 disabled:shadow-none"
            >
              <ShoppingBag className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              {product.inStock ? t('add_to_cart') : t('out_of_stock')}
            </m.button>

            <m.button
              type="button"
              onClick={buyNow}
              disabled={!product.inStock}
              whileHover={product.inStock ? hoverScale : undefined}
              whileTap={product.inStock ? tapPress : undefined}
              transition={springPop}
              className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-pill border border-w-15 px-6 text-fluid-sm font-bold uppercase tracking-wide text-w-80 transition-colors hover:border-accent/45 hover:text-white disabled:opacity-40"
            >
              {t('buy_now')}
            </m.button>
          </div>

          <div className="purple-ring mt-fluid-md flex items-start gap-3 p-fluid-sm">
            <Truck className="mt-0.5 h-5 w-5 shrink-0 text-accent-light" aria-hidden="true" />
            <div>
              <p className="text-fluid-sm font-semibold text-white">{t('delivery_note')}</p>
              <p className="text-fluid-xs text-w-50">{t('delivery_sub')}</p>
            </div>
          </div>

          <div className="mt-fluid-xs flex flex-col gap-fluid-2xs">
            <Collapsible title={t('composition_title')}>
              <ul className="flex flex-col gap-2">
                {ingredients.map((item) => (
                  <li key={item.name}>
                    <span className="font-semibold text-white">{item.name}</span> — {item.description}
                  </li>
                ))}
              </ul>
            </Collapsible>

            <Collapsible title={t('how_title')}>
              <ol className="flex flex-col gap-2">
                {steps.map((step) => (
                  <li key={step.num}>
                    <span className="font-semibold text-white">
                      {step.num}. {step.title}
                    </span>{' '}
                    — {step.description}
                  </li>
                ))}
              </ol>
            </Collapsible>
          </div>
        </div>
      </div>

      <section className="mt-fluid-xl">
        <h2 className="text-fluid-md font-bold uppercase tracking-tight">{t('description_title')}</h2>
        <p className="mt-fluid-xs max-w-3xl text-fluid-base leading-relaxed text-w-70">
          {pick(product.description, locale)}
        </p>

        <div className="purple-ring mt-fluid-md flex items-start gap-3 p-fluid-sm">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-accent-light" aria-hidden="true" />
          <div>
            <p className="text-fluid-sm font-semibold text-white">{t('contra_title')}</p>
            <p className="mt-1 text-fluid-sm leading-relaxed text-w-70">{t('contra_text')}</p>
          </div>
        </div>
      </section>

      <section className="mt-fluid-xl">
        <h2 className="text-fluid-md font-bold uppercase tracking-tight">{t('downloads_title')}</h2>
        <div className="mt-fluid-sm flex flex-wrap gap-fluid-xs">
          {[
            { href: '/assets/docs/consumer-leaflet.pdf', label: t('download_leaflet') },
            { href: '/assets/docs/declaration.pdf', label: t('download_declaration') },
          ].map((doc) => (
            <a
              key={doc.href}
              href={doc.href}
              download
              className="btn btn-sm btn-ghost uppercase tracking-wide"
            >
              <FileDown className="h-4 w-4 shrink-0" aria-hidden="true" />
              {doc.label}
            </a>
          ))}
        </div>
      </section>

      <section className="mt-fluid-2xl">
        <h2 className="h2">{t('related_title')}</h2>
        <RevealGroup stagger={0.08} className="grid-products mt-fluid-md">
          {related.map((item) => (
            <ProductGridCard key={item.id} product={item} />
          ))}
        </RevealGroup>
      </section>
    </div>
  );
}
