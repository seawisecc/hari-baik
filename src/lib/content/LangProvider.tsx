"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { LANGS, type Lang, type MessageKey, translate } from "./i18n";

const STORAGE_KEY = "hb_lang";

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "id",
  setLang: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("id");

  // Dibaca setelah mount supaya HTML server dan klien cocok saat hidrasi.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (LANGS as readonly string[]).includes(stored)) {
        setLangState(stored as Lang);
      }
    } catch {
      // Storage diblokir — tetap pakai bahasa default.
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    document.documentElement.lang = l;
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* abaikan */
    }
  }, []);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

/** Hook penerjemah: `const t = useT(); t("day.guru")`. */
export function useT() {
  const { lang } = useLang();
  return useCallback((key: MessageKey | string) => translate(lang, key), [lang]);
}
