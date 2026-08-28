import { useCallback } from 'react';
import { useT } from '../i18n';

interface Named {
  name: string;
  nameKey?: string;
  nameVars?: Record<string, string | number>;
}

interface Titled {
  title: string;
  titleKey?: string;
}

/**
 * Показывает переводимое имя сущности из данных (курс, группа, тема, месяц).
 *
 * Сиды несут `nameKey`, поэтому «Грамматика» становится Grammar / Grammatika при
 * смене языка. У групп, которые администратор завёл вручную, ключа нет — для них
 * остаётся введённое имя, переводить его нечем.
 */
export function useLabel() {
  const t = useT();
  return useCallback(
    (x: Named | undefined | null, fallback = '—') =>
      !x ? fallback : x.nameKey ? t(x.nameKey, x.nameVars) : x.name,
    [t]
  );
}

interface BookText {
  chapters: string;
  chaptersKey?: string;
  chaptersVars?: Record<string, string | number>;
  description: string;
  descriptionKey?: string;
  descriptionVars?: Record<string, string | number>;
}

/**
 * Главы и описание книги: «Главы 3–4» собираются из ключа и номеров, поэтому
 * в английском получается «Chapters 3–4», а не смесь языков.
 */
export function useBookText() {
  const t = useT();
  const chapters = useCallback(
    (b: BookText) => (b.chaptersKey ? t(b.chaptersKey, b.chaptersVars) : b.chapters),
    [t]
  );
  const description = useCallback(
    (b: BookText) => (b.descriptionKey ? t(b.descriptionKey, b.descriptionVars) : b.description),
    [t]
  );
  return { chapters, description };
}

/** То же для сущностей с полем `title` (материалы недели). */
export function useTitle() {
  const t = useT();
  return useCallback(
    (x: Titled | undefined | null, fallback = '—') =>
      !x ? fallback : x.titleKey ? t(x.titleKey) : x.title,
    [t]
  );
}
