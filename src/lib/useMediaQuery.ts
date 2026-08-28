import { useEffect, useState } from 'react';

/**
 * Подписка на медиазапрос.
 *
 * Нужна там, где мало спрятать элемент через CSS. Сайдбар и мобильная шторка
 * рисуют один и тот же список ссылок с общим `layoutId`; если обе разметки
 * висят в DOM одновременно, framer-motion считает их одним элементом и
 * подсветка активного пункта начинает прыгать. Поэтому лишнюю ветку не прячем,
 * а вовсе не монтируем.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Единая точка перелома: ниже неё сайдбар прячется в шторку. */
export const MOBILE_QUERY = '(max-width: 900px)';
