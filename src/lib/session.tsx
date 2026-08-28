// Сессия демо-стенда. Настоящий вход по email+паролю (раздел 11 проектного документа)
// появится вместе с реальным backend'ом; здесь пара логин/пароль сверяется на клиенте
// со списком из data/accounts.ts — этого достаточно, чтобы зайти в любую из трёх ролей.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useStore } from '../data/store';
import { resolveAccount } from '../data/accounts';
import type { UserRecord } from '../types';

const SESSION_KEY = 'vedomost-session';

interface SessionApi {
  user: UserRecord | null;
  /** Возвращает true при успешном входе; false — если пара логин/пароль неверна. */
  signIn: (login: string, password: string) => boolean;
  logout: () => void;
}

const SessionContext = createContext<SessionApi | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data } = useStore();
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem(SESSION_KEY));

  useEffect(() => {
    if (userId) localStorage.setItem(SESSION_KEY, userId);
    else localStorage.removeItem(SESSION_KEY);
  }, [userId]);

  const signIn = useCallback((login: string, password: string) => {
    const id = resolveAccount(login, password);
    if (!id) return false;
    setUserId(id);
    return true;
  }, []);

  const logout = useCallback(() => setUserId(null), []);

  const user = data.allUsers.find((u) => u.id === userId) ?? null;

  const value = useMemo(() => ({ user, signIn, logout }), [user, signIn, logout]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionApi {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession должен вызываться внутри <SessionProvider>');
  return ctx;
}
