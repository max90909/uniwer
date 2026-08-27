# Подключение реального Supabase

Сейчас приложение работает на demo-данных из `src/data/seed.ts` (см. корневой `README.md`).
Когда будете готовы подключить настоящих учеников:

1. Создайте бесплатный проект на supabase.com.
2. В SQL Editor выполните по очереди `migrations/0001_init.sql` и `migrations/0002_rls.sql`.
3. Заполните `.env` (см. `.env.example` в корне) значениями `Project URL` и `anon public key` из настроек проекта.
4. Замените содержимое `src/data/store.tsx` на реализацию поверх `@supabase/supabase-js` — сигнатуры функций
   (`recordGrades`, `markAttendance`, `addBehaviorEvent`, `updateGradingConfig`, `addBook`) можно оставить такими же,
   чтобы не переписывать страницы в `src/pages/**`.
5. `src/lib/session.tsx` замените на реальный вход по email + паролю через `supabase.auth`.

Формулы в `src/lib/formulas.ts` менять не нужно — они уже написаны как чистые функции над обычными
объектами и одинаково работают что над demo-массивами, что над результатом запроса к Supabase.
