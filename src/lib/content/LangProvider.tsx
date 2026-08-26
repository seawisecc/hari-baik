"use client";

import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useStoredValue } from "@/lib/useStoredValue";
import { LANGS, type Lang, type MessageKey, translate } from "./i18n";

const STORAGE_KEY = "hb_lang";
const DEFAULT: Lang = "id";

function normalize(value: string | null): Lang {
  return (LANGS as readonly string[]).includes(value ?? "") ? (value as Lang) : DEFAULT;
}

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: DEFAULT,
  setLang: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useStoredValue(STORAGE_KEY);
  const lang = normalize(stored);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => setStored(l), [setStored]);
  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

/** Hook penerjemah: `const t = useT(); t("day.guru")`. */
export function useT() {
  const { lang } = useLang();
  return useCallback((key: MessageKey | string) => translate(lang, key), [lang]);
}
