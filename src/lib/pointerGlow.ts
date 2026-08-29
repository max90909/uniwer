/**
 * Подсветка основной кнопки идёт за курсором.
 *
 * CSS сам не знает, где указатель внутри элемента, поэтому позиция пишется в
 * переменные `--px`/`--py`, а градиент в `.btn.primary::after` их читает.
 * Слушатель один на весь документ (делегирование): вешать обработчик на каждую
 * кнопку не нужно, и он переживает перерисовки React без переподписки.
 */
export function initPointerGlow() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // На тач-устройствах курсора нет — эффект только тратил бы кадры.
  if (!window.matchMedia('(hover: hover)').matches) return;

  document.addEventListener(
    'pointermove',
    (e) => {
      const target = e.target as Element | null;
      const btn = target?.closest?.('.btn.primary') as HTMLElement | null;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--px', `${((e.clientX - r.left) / r.width) * 100}%`);
      btn.style.setProperty('--py', `${((e.clientY - r.top) / r.height) * 100}%`);
    },
    { passive: true }
  );
}
