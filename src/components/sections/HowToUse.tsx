'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { RevealGroup } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EASE } from '@/components/ui/motion';
import { HOW_STEPS } from '@/lib/constants';

export function HowToUse() {
  const t = useTranslations('how');

  return (
    <section id="how" className="section-pad relative scroll-mt-28">
      <div className="container-content">
        <RevealGroup>
          <SectionHeading badge={t('badge')} title={t('title')} subtitle={t('subtitle')} />
        </RevealGroup>

        <RevealGroup stagger={0.14} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_STEPS.map((step, index) => (
            <motion.div
              key={step}
              className="relative"
              variants={{
                // Odd cards drift in from the left, even ones from the right.
                hidden: { opacity: 0, x: index % 2 === 0 ? -44 : 44, y: 18 },
                visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.7, ease: EASE } },
              }}
            >
              <span
                className="pointer-events-none absolute -top-8 left-1 select-none text-[104px] font-black leading-none text-white/[0.05]"
                aria-hidden="true"
              >
                {index + 1}
              </span>

              <motion.div
                whileHover={{ y: -6, boxShadow: '0 24px 60px -20px rgba(149, 97, 233, 0.2)' }}
                transition={{ duration: 0.35, ease: EASE }}
                className="purple-ring relative h-full p-6"
              >
                <span className="inline-grid h-10 w-10 place-items-center rounded-pill bg-accent-grad text-sm font-extrabold text-white shadow-glow-sm">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-lg font-bold uppercase tracking-tight">
                  {t(`steps.${step}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-w-70">{t(`steps.${step}.desc`)}</p>
              </motion.div>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
