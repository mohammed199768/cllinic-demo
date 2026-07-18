'use client';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { T, dir, DEFAULT_LOCALE, type Locale } from './dict';

interface Ctx { locale: Locale; setLocale: (l: Locale) => void; t: (k: keyof typeof T | string) => string; }
const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && (localStorage.getItem('our_clinic_locale') as Locale)) || DEFAULT_LOCALE;
    setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir(locale);
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem('our_clinic_locale', l); } catch { /* ignore */ }
  };

  const t = useMemo(() => (k: string) => (T[k]?.[locale] ?? k), [locale]);

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useI18n must be used within LocaleProvider');
  return ctx;
}

export function label(map: Record<string, { ar: string; en: string }>, key: string, locale: Locale): string {
  return map[key]?.[locale] ?? key;
}
