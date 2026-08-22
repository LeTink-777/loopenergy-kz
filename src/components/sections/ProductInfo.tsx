'use client';

import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { Reveal, RevealGroup } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { fadeUp, fromSide } from '@/components/ui/motion';
import { IMG } from '@/lib/constants';

export function ProductInfo() {
  const t = useTranslations('productInfo');
  const ingredients = t.raw('ingredients') as string[];

  return (
    <section id="product" className="section-pad relative scroll-mt-28">
      <div className="container-content">
        <div className="grid-2col">
          <RevealGroup className="order-2 min-w-0 lg:order-1">
            <SectionHeading badge={t('badge')} title={t('title')} align="left" />

            <m.p variants={fadeUp} className="mt-6 text-fluid-base text-w-70">
              {t('p1')}
            </m.p>
            <m.p variants={fadeUp} className="mt-4 text-fluid-base text-w-70">
              {t('p2')}
            </m.p>

            <m.h3
              variants={fadeUp}
              className="mt-9 text-fluid-xs font-bold uppercase tracking-[0.2em] text-w-50"
            >
              {t('ingredientsTitle')}
            </m.h3>

            <m.ul variants={fadeUp} className="mt-4 flex flex-wrap gap-2.5">
              {ingredients.map((item) => (
                <m.li
                  key={item}
                  whileHover={{ y: -3, borderColor: 'rgba(183, 141, 255, 0.6)' }}
                  transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  className="rounded-pill border border-accent/30 bg-accent/[0.08] px-4 py-2 text-fluid-sm font-medium text-w-80"
                >
                  {item}
                </m.li>
              ))}
            </m.ul>

            <m.p variants={fadeUp} className="mt-7 text-fluid-xs leading-relaxed text-w-50">
              {t('note')}
            </m.p>
          </RevealGroup>

          <Reveal variants={fromSide('right')} className="order-1 min-w-0 lg:order-2">
            <div className="relative mx-auto w-full max-w-[520px]">
              <div
                className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
                style={{
                  background: 'radial-gradient(circle at 50% 55%, rgba(149,97,233,0.3), transparent 66%)',
                }}
                aria-hidden="true"
              />
              <m.div
                className="relative aspect-square w-full"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image
                  src={IMG.hero}
                  alt={t('title')}
                  fill
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 60vw, 480px"
                  className="object-contain drop-shadow-[0_36px_64px_rgba(0,0,0,0.5)]"
                />
              </m.div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
