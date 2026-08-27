// Демо-сессия. Настоящий вход по email+паролю (раздел 11 проектного документа) появится вместе
// с реальным backend'ом; здесь достаточно выбора пользователя из демо-набора, чтобы сразу увидеть
// все три роли не поднимая сервер.

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useStore } from '../data/store';
import type { UserRecord } from '../types';

const SESSION_KEY = 'vedomost-demo-session';

interface SessionApi {
  user: UserRecord | null;
  login: (userId: string) => void;
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

  const user = data.allUsers.find((u) => u.id === userId) ?? null;

  return (
    <SessionContext.Provider value={{ user, login: setUserId, logout: () => setUserId(null) }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionApi {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession должен вызываться внутри <SessionProvider>');
  return ctx;
}
