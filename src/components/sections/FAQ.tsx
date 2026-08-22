'use client';

import { AnimatePresence, m } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';

import { RevealGroup } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EASE, fadeUp } from '@/components/ui/motion';
import type { Content } from '@/lib/content';

export function FAQ() {
  const t = useTranslations('faq');
  const tAnswers = useTranslations('answers');
  // The short-answers block was folded in here, so the rendered list and the
  // FAQPage structured data describe exactly the same questions.
  const items = [
    ...(t.raw('items') as Content['faq']['items']),
    ...(tAnswers.raw('items') as Content['answers']['items']),
  ];
  const baseId = useId();
  // Accordion is single-open: opening one question closes the previous.
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <section id="faq" className="section-pad relative scroll-mt-28">
      <div className="container-content">
        <RevealGroup>
          <SectionHeading badge={t('badge')} title={t('h2')} subtitle={t('subline')} />
        </RevealGroup>

        <RevealGroup stagger={0.08} className="mx-auto mt-12 flex max-w-[860px] flex-col gap-3">
          {items.map((item, index) => {
            const key = String(index);
            const isOpen = openKey === key;
            const panelId = `${baseId}-${key}-panel`;
            const buttonId = `${baseId}-${key}-button`;

            return (
              <m.div key={item.question} variants={fadeUp} className="purple-ring overflow-hidden">
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenKey(isOpen ? null : key)}
                    className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-7"
                  >
                    <span className="text-fluid-base font-semibold text-white ">
                      {item.question}
                    </span>

                    <m.span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-pill border border-accent/25 bg-accent/10 text-accent-light"
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                    >
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    </m.span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <m.div
                      key="content"
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        height: { duration: 0.4, ease: EASE },
                        opacity: { duration: 0.25, ease: EASE },
                      }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-6 pr-14 text-fluid-sm leading-relaxed text-w-70 sm:px-7 sm:pr-20">
                        {item.answer}
                      </p>
                    </m.div>
                  ) : null}
                </AnimatePresence>
              </m.div>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
