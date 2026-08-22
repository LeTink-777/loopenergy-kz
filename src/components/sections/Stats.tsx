'use client';

import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { RevealGroup } from '@/components/ui/Reveal';
import { fadeUp } from '@/components/ui/motion';
import { STATS } from '@/lib/constants';

export function Stats() {
  const t = useTranslations('stats');

  return (
    <section aria-label="LOOP Energy" className="relative py-10 md:py-14">
      <div className="container-content">
        <RevealGroup
          stagger={0.15}
          className="purple-ring grid-stats"
        >
          {STATS.map((stat) => (
            <m.div
              key={stat.key}
              variants={fadeUp}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <span className="text-fluid-3xl font-extrabold tracking-tight text-white">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </span>
              <span className="text-fluid-xs font-medium uppercase tracking-[0.1em] text-w-50 ">
                {t(stat.key)}
              </span>
            </m.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
