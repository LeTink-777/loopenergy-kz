'use client';

import { m } from 'framer-motion';

import { useUniversalMotion } from '@/hooks/useUniversalMotion';
import { EASE } from '@/components/ui/motion';

/** Shared masthead for the sub-pages, matching the homepage section rhythm. */
export function PageHeader({
  badge,
  title,
  accent,
  subline,
}: {
  badge?: string;
  title: string;
  accent?: string;
  subline?: string;
}) {
  const { reducedMotion } = useUniversalMotion();
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reducedMotion ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: EASE, delay },
  });

  return (
    <header className="flex flex-col gap-fluid-xs">
      {badge ? (
        <m.span
          {...rise(0)}
          className="inline-flex w-fit items-center gap-2 rounded-pill border border-accent/30 bg-accent/10 px-4 py-1.5 text-fluid-xs font-bold uppercase tracking-[0.18em] text-accent-light"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent-light" />
          {badge}
        </m.span>
      ) : null}

      <m.h1 {...rise(0.06)} className="h2 max-w-3xl text-balance">
        {title}
        {accent ? (
          <>
            {' '}
            <span className="text-gradient">{accent}</span>
          </>
        ) : null}
      </m.h1>

      {subline ? (
        <m.p {...rise(0.12)} className="max-w-2xl text-fluid-base text-w-70">
          {subline}
        </m.p>
      ) : null}
    </header>
  );
}
