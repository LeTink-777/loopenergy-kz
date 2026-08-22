'use client';

import { motion } from 'framer-motion';
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
          className="purple-ring grid grid-cols-2 gap-y-8 px-4 py-8 sm:px-8 md:grid-cols-4 md:gap-y-0"
        >
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.key}
              variants={fadeUp}
              className={`flex flex-col items-center gap-1.5 px-2 text-center md:px-6 ${
                index > 0 ? 'md:border-l md:border-w-10' : ''
              } ${index % 2 === 1 ? 'border-l border-w-10 md:border-l' : ''}`}
            >
              <span className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-[42px]">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.1em] text-w-50 sm:text-sm">
                {t(stat.key)}
              </span>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
