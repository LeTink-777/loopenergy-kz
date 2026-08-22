'use client';

import { m, type Variants } from 'framer-motion';
import type { ReactNode, Ref } from 'react';

import { useUniversalMotion } from '@/hooks/useUniversalMotion';
import { staggerContainer } from './motion';

/** Only the elements we actually reveal — keeps motion components stable across renders. */
const TAGS = {
  div: m.div,
  section: m.section,
  ul: m.ul,
  li: m.li,
  dl: m.dl,
  p: m.p,
  span: m.span,
} as const;

export type RevealTag = keyof typeof TAGS;

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Extra delay before the reveal starts, in seconds. */
  delay?: number;
  as?: RevealTag;
  variants?: Variants;
  amount?: number;
  id?: string;
};

/** Scroll-triggered reveal used by every section on the page. */
export function Reveal({
  children,
  className,
  delay = 0,
  as = 'div',
  variants,
  amount = 0.2,
  id,
}: RevealProps) {
  const Component = TAGS[as];
  const { revealVariants } = useUniversalMotion();

  return (
    <Component
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={variants ?? (revealVariants as Variants)}
      transition={{ delay }}
    >
      {children}
    </Component>
  );
}

/** Wrapper that reveals its children one after another. */
export function RevealGroup({
  children,
  className,
  stagger = 0.1,
  delayChildren = 0,
  amount = 0.15,
  as = 'div',
  id,
  innerRef,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  amount?: number;
  as?: RevealTag;
  id?: string;
  /** Escape hatch for callers that need the underlying node (e.g. scroll rails). */
  innerRef?: Ref<HTMLDivElement>;
}) {
  const Component = TAGS[as];
  const { reducedMotion } = useUniversalMotion();

  return (
    <Component
      ref={innerRef as never}
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={staggerContainer(reducedMotion ? 0 : stagger, delayChildren)}
    >
      {children}
    </Component>
  );
}
