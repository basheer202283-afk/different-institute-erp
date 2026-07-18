"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { type Locale, defaultLocale, localeConfig, t as translate } from "./index";

interface I18nContextType {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  t: (section: string, key: string) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const saved = localStorage.getItem("erp_locale") as Locale | null;
    if (saved && localeConfig[saved]) {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeConfig[locale].dir;
    document.documentElement.classList.toggle("rtl", localeConfig[locale].dir === "rtl");
    document.documentElement.classList.toggle("ltr", localeConfig[locale].dir === "ltr");
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("erp_locale", newLocale);
  }, []);

  const t = useCallback((section: string, key: string) => {
    return translate(locale, section as Parameters<typeof translate>[1], key);
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, dir: localeConfig[locale].dir, setLocale, t, isRTL: localeConfig[locale].dir === "rtl" }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
