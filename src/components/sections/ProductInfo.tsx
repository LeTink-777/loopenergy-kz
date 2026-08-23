'use client';

import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { Reveal, RevealGroup } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { fadeUp, fromSide } from '@/components/ui/motion';
import { IMG } from '@/lib/constants';
import type { Content } from '@/lib/content';

export function ProductInfo() {
  const t = useTranslations('product_info');
  const ingredients = t.raw('ingredients') as Content['product_info']['ingredients'];

  return (
    <section id="product" className="section-pad relative scroll-mt-28">
      <div className="container-content">
        <div className="grid-2col">
          <RevealGroup className="order-2 min-w-0 lg:order-1">
            <SectionHeading badge={t('badge')} title={t('h2')} accent={t('h2_accent')} align="left" />

            <m.p variants={fadeUp} className="mt-6 text-fluid-base text-w-70">
              {t('paragraph_1')}
            </m.p>
            <m.p variants={fadeUp} className="mt-4 text-fluid-base text-w-70">
              {t('paragraph_2')}
            </m.p>

            <m.h3
              variants={fadeUp}
              className="mt-9 text-fluid-xs font-bold uppercase tracking-[0.2em] text-w-50"
            >
              {t('ingredients_title')}
            </m.h3>

            {/* A grid, not flex-wrap: as content-sized pills these ran one per
                row at every width above mobile, each a different length
                (608/583/569/485/554px) and the first taller than the rest.
                `auto-rows-fr` keeps every row the same height, and `h-full`
                makes each card fill the row it is in. */}
            <m.ul variants={fadeUp} className="mt-4 grid auto-rows-fr gap-2.5 sm:grid-cols-2">
              {ingredients.map((item) => (
                <m.li
                  key={item.name}
                  whileHover={{ y: -3, borderColor: 'rgba(183, 141, 255, 0.6)' }}
                  transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  className="flex h-full flex-col rounded-3xl border border-accent/30 bg-accent/[0.08] px-4 py-3"
                >
                  <span className="block text-fluid-sm font-semibold text-white">{item.name}</span>
                  <span className="mt-1 block text-fluid-xs leading-relaxed text-w-70">
                    {item.description}
                  </span>
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
                  alt={t('h2')}
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
