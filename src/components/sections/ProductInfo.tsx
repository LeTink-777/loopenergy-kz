'use client';

import { motion } from 'framer-motion';
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
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <RevealGroup className="order-2 lg:order-1">
            <SectionHeading badge={t('badge')} title={t('title')} align="left" />

            <motion.p variants={fadeUp} className="mt-6 text-base text-w-70">
              {t('p1')}
            </motion.p>
            <motion.p variants={fadeUp} className="mt-4 text-base text-w-70">
              {t('p2')}
            </motion.p>

            <motion.h3
              variants={fadeUp}
              className="mt-9 text-xs font-bold uppercase tracking-[0.2em] text-w-50"
            >
              {t('ingredientsTitle')}
            </motion.h3>

            <motion.ul variants={fadeUp} className="mt-4 flex flex-wrap gap-2.5">
              {ingredients.map((item) => (
                <motion.li
                  key={item}
                  whileHover={{ y: -3, borderColor: 'rgba(183, 141, 255, 0.6)' }}
                  transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  className="rounded-pill border border-accent/30 bg-accent/[0.08] px-4 py-2 text-sm font-medium text-w-80"
                >
                  {item}
                </motion.li>
              ))}
            </motion.ul>

            <motion.p variants={fadeUp} className="mt-7 text-xs leading-relaxed text-w-50">
              {t('note')}
            </motion.p>
          </RevealGroup>

          <Reveal variants={fromSide('right')} className="order-1 lg:order-2">
            <div className="relative mx-auto w-full max-w-[520px]">
              <div
                className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
                style={{
                  background: 'radial-gradient(circle at 50% 55%, rgba(149,97,233,0.3), transparent 66%)',
                }}
                aria-hidden="true"
              />
              <motion.div
                className="relative aspect-square w-full"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image
                  src={IMG.hero}
                  alt={t('title')}
                  fill
                  sizes="(max-width: 1024px) 88vw, 520px"
                  className="object-contain drop-shadow-[0_36px_64px_rgba(0,0,0,0.5)]"
                />
              </motion.div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
