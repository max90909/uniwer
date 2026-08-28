import { useEffect, useRef, useState } from 'react';

/** True when the OS asks for reduced motion — checked lazily so SSR/tests stay safe. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

/**
 * Eases a number toward `target` with requestAnimationFrame.
 *
 * On first mount it counts up from 0 so every score/percentage animates in rather than
 * popping. On later changes (filter switch, new demo data) it eases from whatever was
 * already on screen instead of snapping back to 0, which would read as a glitch.
 * Under `prefers-reduced-motion` it returns the target immediately.
 */
export function useAnimatedNumber(target: number, duration = 900): number {
  const to = Number.isFinite(target) ? target : 0;
  const [value, setValue] = useState(() => (prefersReducedMotion() ? to : 0));
  const rafRef = useRef<number | undefined>(undefined);
  const currentRef = useRef(prefersReducedMotion() ? to : 0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      currentRef.current = to;
      setValue(to);
      return;
    }

    const from = currentRef.current;
    if (from === to) return;

    const start = performance.now();
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const next = from + (to - from) * eased;
      currentRef.current = next;
      setValue(next);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [to, duration]);

  return value;
}
