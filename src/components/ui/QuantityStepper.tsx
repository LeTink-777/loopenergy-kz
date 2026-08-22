'use client';

import { m } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

import { springPop } from './motion';

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  labels,
  size = 'md',
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  labels: { less: string; more: string };
  size?: 'sm' | 'md';
}) {
  const button =
    size === 'sm'
      ? 'h-11 w-11 text-w-70'
      : 'h-12 w-12 text-w-80';

  return (
    <div className="inline-flex items-center rounded-pill border border-w-15 bg-white/[0.04]">
      <m.button
        type="button"
        aria-label={labels.less}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        whileTap={{ scale: 0.9 }}
        transition={springPop}
        className={`grid ${button} place-items-center rounded-pill transition-colors hover:text-white disabled:opacity-30`}
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </m.button>

      <span
        aria-live="polite"
        className="min-w-[2.5ch] text-center text-fluid-base font-bold tabular-nums text-white"
      >
        {value}
      </span>

      <m.button
        type="button"
        aria-label={labels.more}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        whileTap={{ scale: 0.9 }}
        transition={springPop}
        className={`grid ${button} place-items-center rounded-pill transition-colors hover:text-white disabled:opacity-30`}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </m.button>
    </div>
  );
}
