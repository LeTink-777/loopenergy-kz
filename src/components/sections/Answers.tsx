'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { RevealGroup } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EASE, fadeUp } from '@/components/ui/motion';
import { ANSWER_KEYS } from '@/lib/constants';

export function Answers() {
  const t = useTranslations('answers');

  return (
    <section id="answers" className="section-pad relative scroll-mt-28">
      <div className="container-content">
        <RevealGroup>
          <SectionHeading badge={t('badge')} title={t('title')} />
        </RevealGroup>

        <RevealGroup stagger={0.1} className="mt-12 grid gap-5 md:grid-cols-2">
          {ANSWER_KEYS.map((key) => (
            <motion.div key={key} variants={fadeUp}>
              <motion.dl
                whileHover={{ y: -5, boxShadow: '0 22px 56px -22px rgba(149,97,233,0.32)' }}
                transition={{ duration: 0.35, ease: EASE }}
                className="purple-ring h-full p-6 sm:p-7"
              >
                <dt className="text-base font-bold uppercase tracking-tight text-white">
                  {t(`items.${key}.q`)}
                </dt>
                <dd className="mt-2.5 text-sm leading-relaxed text-w-70">{t(`items.${key}.a`)}</dd>
              </motion.dl>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
