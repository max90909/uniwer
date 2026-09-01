/**
 * Учётные записи демо-стенда.
 *
 * ВАЖНО: это НЕ настоящая авторизация. Пароли лежат открытым текстом и
 * проверяются в браузере, поэтому любой может их прочитать в исходниках. Так
 * сделано намеренно: пока нет backend'а, стенду нужен предсказуемый вход в три
 * роли. Когда появится Supabase (раздел 11 проектного документа), проверку
 * заменит серверный auth, а этот файл удаляется целиком.
 *
 * Роли берутся из самого пользователя (`UserRecord.role`), здесь только связка
 * «логин + пароль → id пользователя».
 */

import type { Role } from '../types';

export interface Account {
  login: string;
  password: string;
  userId: string;
  /** Дублирует роль пользователя — нужна только для подсказки на форме входа. */
  role: Role;
}

export const ACCOUNTS: Account[] = [
  { login: 'student', password: 'student123', userId: 'user-student-1', role: 'student' },
  { login: 'tleuov', password: 'Parahat#7412', userId: 'user-teacher-1', role: 'teacher' },
  { login: 'admin', password: 'Vedomost#9350', userId: 'user-admin-1', role: 'admin' },
];

/** Возвращает id пользователя или null, если пары логин/пароль нет. */
export function resolveAccount(login: string, password: string): string | null {
  const normalized = login.trim().toLowerCase();
  const found = ACCOUNTS.find((a) => a.login === normalized && a.password === password);
  return found ? found.userId : null;
}
