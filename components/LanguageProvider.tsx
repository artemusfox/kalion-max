"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { LANGUAGES, T, type Lang } from "@/lib/i18n";

const KEY = "kalion-lang";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof T) => string;
};

const LanguageCtx = createContext<Ctx>({
  lang: "de",
  setLang: () => {},
  t: (k) => String(k),
});

export function useLanguage() {
  return useContext(LanguageCtx);
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("de");

  useEffect(() => {
    const stored = localStorage.getItem(KEY) as Lang | null;
    if (stored && LANGUAGES.some((l) => l.id === stored)) {
      setLangState(stored);
      document.documentElement.setAttribute("lang", stored);
      return;
    }
    // Falls kein gespeicherter Wert: Browser-Sprache prüfen
    const browser = (typeof navigator !== "undefined" ? navigator.language.slice(0, 2) : "de") as Lang;
    if (LANGUAGES.some((l) => l.id === browser)) {
      setLangState(browser);
      document.documentElement.setAttribute("lang", browser);
    }
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem(KEY, l);
    document.documentElement.setAttribute("lang", l);
  }

  const tFn = useCallback(
    (key: keyof typeof T) => {
      const entry = T[key];
      if (!entry) return String(key);
      return entry[lang] ?? entry.de;
    },
    [lang]
  );

  return (
    <LanguageCtx.Provider value={{ lang, setLang, t: tFn }}>
      {children}
    </LanguageCtx.Provider>
  );
}
