'use client';

import { motion } from 'framer-motion';

import { fadeUp } from './motion';

export function SectionHeading({
  badge,
  title,
  subtitle,
  align = 'center',
}: {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
}) {
  const alignment = align === 'center' ? 'items-center text-center' : 'items-start text-left';

  return (
    <div className={`flex flex-col gap-4 ${alignment}`}>
      {badge ? (
        <motion.span
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-pill border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-accent-light"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent-light" />
          {badge}
        </motion.span>
      ) : null}

      <motion.h2 variants={fadeUp} className="h2 max-w-3xl text-balance">
        {title}
      </motion.h2>

      {subtitle ? (
        <motion.p variants={fadeUp} className="max-w-2xl text-base text-w-70">
          {subtitle}
        </motion.p>
      ) : null}
    </div>
  );
}
