"use client";

import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useStoredValue } from "@/lib/useStoredValue";

export const THEMES = ["mint", "senja"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_LABELS: Record<Theme, string> = {
  mint: "Mint",
  senja: "Senja",
};

const STORAGE_KEY = "hb_theme";
const DEFAULT: Theme = "mint";

function normalize(value: string | null): Theme {
  return (THEMES as readonly string[]).includes(value ?? "") ? (value as Theme) : DEFAULT;
}

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: DEFAULT,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useStoredValue(STORAGE_KEY);
  const theme = normalize(stored);

  // Atribut sudah dipasang sebelum paint oleh themeInitScript; ini menjaganya
  // tetap sinkron kalau nilainya berubah (mis. dari tab lain).
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setStored(t), [setStored]);
  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Dijalankan sebelum paint pertama supaya tidak ada kedipan tema.
 * Di-inline sebagai <script> di layout.
 */
export const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    if (t !== "mint" && t !== "senja") t = "mint";
    document.documentElement.setAttribute("data-theme", t);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "mint");
  }
})();
`;
