import { motion } from 'framer-motion';
import { prefersReducedMotion } from '../lib/useAnimatedNumber';

/**
 * Фоновое движение для страниц входа и приветствия.
 *
 * Три очень бледных пятна медленно дрейфуют и тонкая сетка поверх них. Смысл —
 * оживить пустой фон, не отвлекая от текста: контраст пятен около 3–4%, период
 * движения 18–26 секунд, поэтому глаз замечает их только боковым зрением.
 * Слой не ловит указатель и полностью выключается при prefers-reduced-motion.
 */
export function AmbientBackground() {
  const still = prefersReducedMotion();

  const blobs = [
    { className: 'blob blob-a', x: [0, 40, -20, 0], y: [0, -30, 20, 0], d: 26 },
    { className: 'blob blob-b', x: [0, -35, 25, 0], y: [0, 25, -20, 0], d: 22 },
    { className: 'blob blob-c', x: [0, 25, -30, 0], y: [0, 20, 30, 0], d: 30 },
  ];

  return (
    <div className="ambient" aria-hidden="true">
      {blobs.map((b) => (
        <motion.span
          key={b.className}
          className={b.className}
          animate={still ? undefined : { x: b.x, y: b.y }}
          transition={{ duration: b.d, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <span className="ambient-grid" />
    </div>
  );
}
