/**
 * Файлы, которые преподаватель кладёт вручную.
 *
 * Всё, что лежит в `src/materials/`, попадает сюда само: Vite находит файлы на
 * сборке через `import.meta.glob`, копирует их в `dist` и подставляет готовые
 * ссылки. Никакого списка вести не нужно — положили файл, закоммитили,
 * GitHub Pages пересобрал, файл появился у учеников.
 *
 * Почему именно `src/materials/`, а не `public/`: браузер не умеет читать
 * содержимое папки на статическом хостинге, а `public/` Vite не сканирует —
 * пришлось бы вручную дописывать каждый файл в список. Здесь список собирается
 * на сборке.
 *
 * Ограничение: файлы попадают в репозиторий, поэтому это для методичек и
 * заданий, а не для тяжёлых видео (GitHub не любит файлы больше ~100 МБ).
 */

// README — инструкция для преподавателя; исключаем прямо в шаблоне, иначе он
// тоже копировался бы в сборку.
const modules = import.meta.glob(['../materials/*', '!../materials/README.md'], {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export interface SharedFile {
  /** Имя файла как его назвали при загрузке — оно же предлагается при скачивании. */
  name: string;
  url: string;
  ext: string;
}

export const SHARED_FILES: SharedFile[] = Object.entries(modules)
  .map(([path, url]) => {
    const name = path.split('/').pop() ?? path;
    return { name, url, ext: (name.split('.').pop() ?? '').toLowerCase() };
  })
  .filter((f) => !f.name.startsWith('.'))
  .sort((a, b) => a.name.localeCompare(b.name));

/** Значок по расширению — чтобы список читался с одного взгляда. */
export function fileIcon(ext: string): string {
  if (['pdf'].includes(ext)) return '📕';
  if (['doc', 'docx', 'rtf', 'odt'].includes(ext)) return '📘';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '📗';
  if (['ppt', 'pptx'].includes(ext)) return '📙';
  if (['mp3', 'wav', 'm4a', 'ogg'].includes(ext)) return '🎧';
  if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return '🎬';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return '🖼';
  if (['zip', 'rar', '7z'].includes(ext)) return '🗜';
  return '📄';
}
