'use client';

import { LazyMotion, domAnimation } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Loads only Framer Motion's DOM animation features instead of the full bundle.
 * `strict` makes any stray `motion.*` component throw, so every animated element
 * has to go through the lighter `m.*` API.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
