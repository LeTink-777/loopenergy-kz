'use client';

import { m } from 'framer-motion';
import { TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Reveal, RevealGroup } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useUniversalMotion } from '@/hooks/useUniversalMotion';
import { EASE } from '@/components/ui/motion';
import type { Content } from '@/lib/content';

export function HowToUse() {
  const t = useTranslations('how_to_use');
  const steps = t.raw('steps') as Content['how_to_use']['steps'];
  const { isTouch, reducedMotion, hoverLift } = useUniversalMotion();
  // Keep the entrance inside the container so cards never sweep past the edge.
  const drift = reducedMotion ? 0 : isTouch ? 10 : 24;

  return (
    <section id="how" className="section-pad relative scroll-mt-28">
      <div className="container-content">
        <RevealGroup>
          <SectionHeading badge={t('badge')} title={t('h2')} accent={t('h2_accent')} />
        </RevealGroup>

        <RevealGroup stagger={0.14} className="grid-steps mt-fluid-xl">
          {steps.map((step, index) => (
            <m.div
              key={step.num}
              className="relative"
              variants={{
                // Odd cards drift in from the left, even ones from the right.
                hidden: { opacity: 0, x: index % 2 === 0 ? -drift : drift, y: reducedMotion ? 0 : 14 },
                visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.7, ease: EASE } },
              }}
            >
              <span
                className="pointer-events-none absolute -top-7 right-3 select-none text-[clamp(72px,12vw,116px)] font-black leading-[0.8] tracking-tighter text-white/[0.07]"
                aria-hidden="true"
              >
                {step.num}
              </span>

              <m.div
                whileHover={
                  hoverLift && { ...hoverLift, boxShadow: '0 24px 60px -20px rgba(149, 97, 233, 0.2)' }
                }
                transition={{ duration: 0.35, ease: EASE }}
                className="purple-ring relative h-full p-6"
              >
                <span className="inline-grid h-10 w-10 place-items-center rounded-pill bg-accent-grad text-fluid-sm font-extrabold text-white shadow-glow-sm">
                  {step.num}
                </span>
                <h3 className="mt-5 text-fluid-md font-bold uppercase tracking-tight">{step.title}</h3>
                <p className="mt-2 text-fluid-sm leading-relaxed text-w-70">{step.description}</p>
              </m.div>
            </m.div>
          ))}
        </RevealGroup>

        {/* Straight from the manufacturer's leaflet — dosage guidance must be
            visible on the page, not buried in the FAQ. */}
        <RevealGroup className="mt-fluid-lg">
          <Reveal as="div" className="purple-ring mx-auto flex max-w-3xl items-start gap-3 p-fluid-md">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-accent-light" aria-hidden="true" />
            <div>
              <p className="text-fluid-sm font-bold text-white">{t('max_daily')}</p>
              <p className="mt-1 text-fluid-sm leading-relaxed text-w-70">{t('warning')}</p>
            </div>
          </Reveal>
        </RevealGroup>
      </div>
    </section>
  );
}
