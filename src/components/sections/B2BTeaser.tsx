'use client';

import { m } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { useUniversalMotion } from '@/hooks/useUniversalMotion';
import { Reveal, RevealGroup } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { springPop } from '@/components/ui/motion';

/** Homepage teaser — the full wholesale pitch and lead form live on /wholesale. */
export function B2BTeaser() {
  const t = useTranslations('b2b_teaser');
  const { hoverScale, tapPress } = useUniversalMotion();

  return (
    <section id="b2b" className="section-pad relative scroll-mt-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] opacity-70 blur-3xl"
        style={{ background: 'radial-gradient(45% 60% at 60% 30%, rgba(149,97,233,0.18), transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="container-content">
        <RevealGroup>
          <div className="purple-ring flex flex-col items-start gap-fluid-md p-fluid-lg lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <SectionHeading
                badge={t('badge')}
                title={t('h2')}
                accent={t('h2_accent')}
                subtitle={t('text')}
                align="left"
              />
            </div>

            <Reveal as="div" className="shrink-0">
              <m.div whileHover={hoverScale} whileTap={tapPress} transition={springPop}>
                <Link
                  href="/wholesale"
                  className="group inline-flex min-h-[52px] items-center gap-2 rounded-pill bg-accent-grad px-7 text-fluid-sm font-bold uppercase tracking-wide text-white shadow-glow"
                >
                  {t('cta')}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </m.div>
            </Reveal>
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}
