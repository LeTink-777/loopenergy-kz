'use client';

import { m, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

import { EASE } from './motion';

type PurpleBorderCardProps = {
  children: ReactNode;
  className?: string;
  /** Lift + glow on pointer hover. */
  interactive?: boolean;
  /** Vertical lift distance in px when interactive. */
  lift?: number;
} & Omit<HTMLMotionProps<'div'>, 'children' | 'className'>;

/**
 * Glassmorphism card with the brand's masked gradient ring.
 * The ring itself lives in `.purple-ring::before` (globals.css); the hover
 * glow is animated here so it stays inside Framer Motion.
 */
export function PurpleBorderCard({
  children,
  className = '',
  interactive = true,
  lift = 6,
  ...rest
}: PurpleBorderCardProps) {
  return (
    <m.div
      className={`purple-ring ${className}`}
      initial={false}
      whileHover={
        interactive
          ? { y: -lift, boxShadow: '0 24px 60px -20px rgba(149, 97, 233, 0.2)' }
          : undefined
      }
      transition={{ duration: 0.35, ease: EASE }}
      {...rest}
    >
      {children}
    </m.div>
  );
}
