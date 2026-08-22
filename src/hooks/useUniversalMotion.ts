'use client';

import { useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { EASE } from '@/components/ui/motion';

/**
 * Tunes every animation to the device rather than to a breakpoint.
 *
 * Touch devices get shorter travel and no hover states (there is no hover to
 * respond to), and `prefers-reduced-motion` collapses movement entirely.
 * The touch check runs in an effect so server and client markup agree.
 */
export function useUniversalMotion() {
  const reducedMotion = useReducedMotion() ?? false;
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(hover: none) and (pointer: coarse)');
    const sync = () => setIsTouch(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const travel = reducedMotion ? 0 : isTouch ? 12 : 30;

  return {
    isTouch,
    reducedMotion,
    revealVariants: {
      hidden: { opacity: 0, y: travel },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: reducedMotion ? 0 : 0.6, ease: EASE },
      },
    },
    /** Spread onto `whileHover` — resolves to nothing on touch screens. */
    hoverScale: isTouch || reducedMotion ? undefined : { scale: 1.03, y: -2 },
    hoverLift: isTouch || reducedMotion ? undefined : { y: -6 },
    hoverLiftSoft: isTouch || reducedMotion ? undefined : { y: -4 },
    tapPress: reducedMotion ? undefined : { scale: 0.96 },
    /** Continuous float — shorter and slower on phones to save battery. */
    floatAnimation: reducedMotion
      ? undefined
      : { y: isTouch ? [0, -6, 0] : [0, -12, 0] },
    floatTransition: {
      duration: isTouch ? 4 : 6,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  };
}
