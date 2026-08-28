import { motion, type Variants } from 'framer-motion';
import React from 'react';

const EASE = [0.16, 1, 0.3, 1] as const;

/** Parent: releases its children one after another instead of all at once. */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

/** Child: the standard "rise and fade in" used by every card in the app. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/** Child variant for things that should grow rather than rise (gauges, medallions). */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: EASE } },
};

interface StaggerProps extends React.ComponentProps<typeof motion.div> {
  /** Hold off until the block scrolls into view — used on the long landing page. */
  whenVisible?: boolean;
}

/**
 * Wraps a group of `<Item>`s so they animate in sequence.
 * Pass `className="grid cols-3"` etc. — it renders a plain div, layout is unchanged.
 */
export function Stagger({ whenVisible = false, children, ...rest }: StaggerProps) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      {...(whenVisible
        ? { whileInView: 'show', viewport: { once: true, amount: 0.15 } }
        : { animate: 'show' })}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface ItemProps extends React.ComponentProps<typeof motion.div> {
  variant?: 'rise' | 'scale';
}

/** A single staggered child. Must live inside a `<Stagger>` to pick up the sequence. */
export function Item({ variant = 'rise', children, ...rest }: ItemProps) {
  return (
    <motion.div variants={variant === 'scale' ? scaleIn : riseIn} {...rest}>
      {children}
    </motion.div>
  );
}
