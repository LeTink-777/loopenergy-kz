'use client';

import { m } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { useUniversalMotion } from '@/hooks/useUniversalMotion';

import { ProductGridCard } from '@/components/shop/ProductGridCard';
import { RevealGroup } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { fadeUp, springPop } from '@/components/ui/motion';
import { visibleProducts as products } from '@/lib/products';

export function Products() {
  const t = useTranslations('products');
  const { hoverScale, tapPress } = useUniversalMotion();

  return (
    <section id="products" className="section-pad relative scroll-mt-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-1/4 -z-10 h-[420px] opacity-60 blur-3xl"
        style={{
          background: 'radial-gradient(50% 60% at 50% 50%, rgba(149,97,233,0.18), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="container-content">
        <RevealGroup>
          <SectionHeading badge={t('badge')} title={t('h2')} accent={t('h2_accent')} subtitle={t('subline')} />
        </RevealGroup>

        <RevealGroup
          stagger={0.12}
          className="grid-products mt-fluid-xl"
        >
          {products.map((product, index) => (
            <ProductGridCard key={product.id} product={product} priority={index < 2} />
          ))}
        </RevealGroup>

        <RevealGroup className="mt-fluid-lg flex justify-center">
          <m.div variants={fadeUp} whileHover={hoverScale} whileTap={tapPress} transition={springPop}>
            <Link
              href="/shop"
              className="group inline-flex min-h-[52px] items-center gap-2 rounded-pill border border-w-15 bg-white/[0.03] px-7 text-fluid-sm font-bold uppercase tracking-wide text-w-80 transition-colors hover:border-accent/45 hover:text-white"
            >
              {t('show_all')}
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </Link>
          </m.div>
        </RevealGroup>
      </div>
    </section>
  );
}
