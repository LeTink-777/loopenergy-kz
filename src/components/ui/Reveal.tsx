'use client';

import { m, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

import { fadeUp, staggerContainer } from './motion';

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
  variants = fadeUp,
  amount = 0.25,
  id,
}: RevealProps) {
  const Component = TAGS[as];

  return (
    <Component
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={variants}
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
  amount = 0.2,
  as = 'div',
  id,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  amount?: number;
  as?: RevealTag;
  id?: string;
}) {
  const Component = TAGS[as];

  return (
    <Component
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={staggerContainer(stagger, delayChildren)}
    >
      {children}
    </Component>
  );
}
