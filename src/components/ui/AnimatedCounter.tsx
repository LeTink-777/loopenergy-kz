'use client';

import { animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { EASE } from './motion';

/** Counts up from 0 to `value` the first time it scrolls into view. */
export function AnimatedCounter({
  value,
  suffix = '',
  duration = 1.6,
  className,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || value === 0) return;

    const controls = animate(0, value, {
      duration,
      ease: EASE,
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });

    return () => controls.stop();
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">
        {display}
        {suffix}
      </span>
      {/* Screen readers get the final value rather than the ticking one. */}
      <span className="sr-only">
        {value}
        {suffix}
      </span>
    </span>
  );
}
