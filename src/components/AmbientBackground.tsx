import { useMemo } from 'react';
import { prefersReducedMotion } from '../lib/useAnimatedNumber';

/** Сколько капель рисуем. Больше — плотнее дождь и дороже отрисовка. */
const DROPS = 34;

/**
 * Минималистичный дождь на заднем плане.
 *
 * Каждая капля — тонкая полоска, падающая сверху вниз по бесконечной CSS-анимации.
 * Позиция, длина, скорость и задержка у всех разные, поэтому повторяемость не
 * читается. Анимируется только `transform`, так что браузер обходится
 * композитингом и не пересчитывает раскладку.
 *
 * Слой очень бледный (капли ~6–14% непрозрачности) и не ловит указатель, чтобы
 * не мешать чтению. При `prefers-reduced-motion` дождь не рисуется вовсе.
 */
export function AmbientBackground() {
  const still = prefersReducedMotion();

  // Раскладка постоянна на всё время жизни компонента: пересчёт на каждый
  // рендер дёргал бы капли в новые места.
  const drops = useMemo(
    () =>
      Array.from({ length: DROPS }, (_, i) => {
        // Простое детерминированное псевдослучайное — одинаковая картина при
        // каждом заходе, без зависимости от Math.random.
        const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
        const duration = 3.4 + r(3) * 3.6;
        return {
          left: r(1) * 100,
          // Отрицательная задержка = анимация начинается с середины, поэтому
          // капли распределены по высоте с первого кадра. С положительной
          // экран первые секунды оставался пустым, а потом всё сыпалось разом.
          delay: -r(2) * duration,
          duration,
          height: 42 + r(4) * 68,
          opacity: 0.06 + r(5) * 0.08,
        };
      }),
    []
  );

  if (still) return null;

  return (
    <div className="rain" aria-hidden="true">
      {drops.map((d, i) => (
        <span
          key={i}
          className="drop"
          style={{
            left: `${d.left}%`,
            height: `${d.height}px`,
            opacity: d.opacity,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
