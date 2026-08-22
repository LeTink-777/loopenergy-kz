'use client';

import { m } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import { ProductCard } from '@/components/ui/ProductCard';
import { RevealGroup } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { fadeUp, springPop } from '@/components/ui/motion';
import { PRODUCTS } from '@/lib/constants';

export function Products() {
  const t = useTranslations('products');
  const rail = useRef<HTMLDivElement>(null);

  // Turn on scroll snapping the first time the visitor reaches for the rail.
  // Declaring it in CSS up front makes Chrome snap-scroll during layout, which
  // finalises Largest Contentful Paint before any element can be recorded.
  useEffect(() => {
    const node = rail.current;
    if (!node) return;

    const enable = () => node.setAttribute('data-snap', 'on');
    const events = ['pointerdown', 'touchstart', 'keydown', 'wheel'] as const;
    events.forEach((event) => node.addEventListener(event, enable, { once: true, passive: true }));

    return () => events.forEach((event) => node.removeEventListener(event, enable));
  }, []);

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
          <SectionHeading badge={t('badge')} title={t('title')} subtitle={t('subtitle')} />
        </RevealGroup>

        <RevealGroup
          stagger={0.12}
          innerRef={rail}
          className="products-rail mt-fluid-xl"
        >
          {PRODUCTS.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 2} />
          ))}
        </RevealGroup>

        <RevealGroup className="mt-fluid-lg flex justify-center">
          <m.a
            variants={fadeUp}
            href="#b2b"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={springPop}
            className="group inline-flex items-center gap-2 rounded-pill border border-w-15 bg-white/[0.03] px-7 py-4 text-fluid-sm font-bold uppercase tracking-wide text-w-80 transition-colors hover:border-accent/45 hover:text-white"
          >
            {t('showAll')}
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </m.a>
        </RevealGroup>
      </div>
    </section>
  );
}
