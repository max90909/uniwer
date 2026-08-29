/**
 * Ручная публикация сайта.
 *
 * Собирает приложение в папку `docs/`, которую вы коммитите и пушите. GitHub
 * Pages настроен отдавать эту папку, поэтому сайт обновляется ровно тогда,
 * когда вы этого захотели, — автоматической пересборки нет.
 *
 * Запуск:  npm run build:site
 */

import { execSync } from 'node:child_process';
import { copyFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'docs';

// Имя репозитория в адресе: сайт живёт на username.github.io/<repo>/, поэтому
// без base ссылки на скрипты и стили ушли бы в корень домена и не нашлись бы.
const REPO = process.env.SITE_BASE ?? 'uniwer';
const base = `/${REPO}/`;

console.log(`Сборка сайта в ${OUT}/ (base: ${base})`);
execSync('npx tsc --noEmit', { stdio: 'inherit' });
execSync(`npx vite build --base=${base} --outDir ${OUT} --emptyOutDir`, { stdio: 'inherit' });

const index = join(OUT, 'index.html');
if (!existsSync(index)) {
  console.error(`Не найден ${index} — сборка не удалась.`);
  process.exit(1);
}

// Pages отдаёт только статические файлы и не умеет перезаписывать пути: прямой
// заход на /login или обновление /student/progress вернули бы 404, работали бы
// лишь переходы внутри приложения. Для ненайденного пути Pages показывает
// 404.html; если это копия index.html, загружается то же приложение, а
// react-router разбирает адрес уже на клиенте.
copyFileSync(index, join(OUT, '404.html'));

// Без этого файла Pages прогоняет папку через Jekyll и выбрасывает всё,
// что начинается с подчёркивания.
writeFileSync(join(OUT, '.nojekyll'), '');

console.log(`\nГотово. Осталось выложить:\n  git add ${OUT}\n  git commit -m "Обновление сайта"\n  git push\n`);
