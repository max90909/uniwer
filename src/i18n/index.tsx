import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DICTS, type Lang } from './translations';

const LANG_KEY = 'vedomost-lang';

interface I18nApi {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nApi | null>(null);

function detectInitial(): Lang {
  const saved = localStorage.getItem(LANG_KEY) as Lang | null;
  if (saved && DICTS[saved]) return saved;
  return 'ru';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitial);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = DICTS[lang];
      let str = dict[key] ?? DICTS.ru[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(`{${k}}`, String(v));
        });
      }
      return str;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nApi {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n должен вызываться внутри <I18nProvider>');
  return ctx;
}

/** Короткий алиас — большинство компонентов используют только функцию перевода. */
export function useT() {
  return useI18n().t;
}
