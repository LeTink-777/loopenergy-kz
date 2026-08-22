'use client';

import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { RevealGroup } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EASE, fadeUp } from '@/components/ui/motion';
import type { Content } from '@/lib/content';

export function Answers() {
  const t = useTranslations('answers');
  const items = t.raw('items') as Content['answers']['items'];

  return (
    <section id="answers" className="section-pad relative scroll-mt-28">
      <div className="container-content">
        <RevealGroup>
          <SectionHeading badge={t('badge')} title={t('h2')} accent={t('h2_accent')} subtitle={t('subline')} />
        </RevealGroup>

        <RevealGroup stagger={0.1} className="grid-auto-md mt-fluid-xl">
          {items.map((item) => (
            <m.div key={item.question} variants={fadeUp}>
              <m.dl
                whileHover={{ y: -5, boxShadow: '0 22px 56px -22px rgba(149,97,233,0.32)' }}
                transition={{ duration: 0.35, ease: EASE }}
                className="purple-ring h-full p-6 sm:p-7"
              >
                <dt className="text-fluid-base font-bold uppercase tracking-tight text-white">
                  {item.question}
                </dt>
                <dd className="mt-2.5 text-fluid-sm leading-relaxed text-w-70">{item.answer}</dd>
              </m.dl>
            </m.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
