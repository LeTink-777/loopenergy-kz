import type { Transition, Variants } from 'framer-motion';

/** Shared easing so every reveal on the page moves with the same curve. */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const revealTransition: Transition = { duration: 0.6, ease: EASE };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: revealTransition },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: revealTransition },
};

/** Container that staggers its children by 0.1s, matching the spec's rhythm. */
export const staggerContainer = (stagger = 0.1, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

export const fromSide = (direction: 'left' | 'right'): Variants => ({
  hidden: { opacity: 0, x: direction === 'left' ? -40 : 40 },
  visible: { opacity: 1, x: 0, transition: revealTransition },
});

export const springPop: Transition = { type: 'spring', stiffness: 420, damping: 26 };
