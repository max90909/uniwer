import { motion } from 'framer-motion';
import React from 'react';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Entrance for the three top-level shells (landing → login → app).
 *
 * Deliberately enter-only. An exit animation here would be a lie: logging in flips
 * `user`, so the auth gates swap the outgoing shell for a <Navigate/> — the tree
 * AnimatePresence would hold back renders as null, and the reader gets a blank
 * screen for the length of the exit instead of the page fading away. Animating the
 * arrival alone stays truthful and leaves no dead frame.
 */
export function ShellTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      style={{ minHeight: '100vh' }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Transition for switching pages inside the app shell — the sidebar stays put,
 * only the main column moves, so this one is quicker and travels less.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
