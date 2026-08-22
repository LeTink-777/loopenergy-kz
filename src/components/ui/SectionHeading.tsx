'use client';

import { m } from 'framer-motion';

import { fadeUp } from './motion';

export function SectionHeading({
  badge,
  title,
  accent,
  subtitle,
  align = 'center',
}: {
  badge?: string;
  title: string;
  /** Second half of the heading, rendered in the brand gradient. */
  accent?: string;
  subtitle?: string;
  align?: 'center' | 'left';
}) {
  const alignment = align === 'center' ? 'items-center text-center' : 'items-start text-left';

  return (
    <div className={`flex flex-col gap-4 ${alignment}`}>
      {badge ? (
        <m.span
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-pill border border-accent/30 bg-accent/10 px-4 py-1.5 text-fluid-xs font-bold uppercase tracking-[0.18em] text-accent-light"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent-light" />
          {badge}
        </m.span>
      ) : null}

      <m.h2 variants={fadeUp} className="h2 max-w-3xl text-balance">
        {title}
        {accent ? (
          <>
            {' '}
            <span className="text-gradient">{accent}</span>
          </>
        ) : null}
      </m.h2>

      {subtitle ? (
        <m.p variants={fadeUp} className="max-w-2xl text-fluid-base text-w-70">
          {subtitle}
        </m.p>
      ) : null}
    </div>
  );
}
