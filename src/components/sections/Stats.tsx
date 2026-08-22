'use client';

import { m } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { RevealGroup } from '@/components/ui/Reveal';
import { fadeUp } from '@/components/ui/motion';

export function Stats() {
  const t = useTranslations('stats');
  const stats = ([1, 2, 3, 4] as const).map((n) => ({
    n,
    value: Number(t(`stat_${n}_value`)),
    suffix: t(`stat_${n}_suffix`),
    label: t(`stat_${n}_label`),
  }));

  return (
    <section aria-label="LOOP Energy" className="relative py-10 md:py-14">
      <div className="container-content">
        <RevealGroup
          stagger={0.15}
          className="purple-ring grid-stats"
        >
          {stats.map((stat) => (
            <m.div
              key={stat.n}
              variants={fadeUp}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <span className="text-fluid-3xl font-extrabold tracking-tight text-white">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </span>
              <span className="text-fluid-xs font-medium uppercase tracking-[0.1em] text-w-50 ">
                {stat.label}
              </span>
            </m.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
