"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export const THEMES = ["mint", "senja"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_LABELS: Record<Theme, string> = {
  mint: "Mint",
  senja: "Senja",
};

const STORAGE_KEY = "hb_theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "mint",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Nilai awal harus cocok dengan yang dipasang script anti-flash di <head>,
  // jadi kita mulai dari default lalu sinkron setelah mount.
  const [theme, setThemeState] = useState<Theme>("mint");

  useEffect(() => {
    const stored = document.documentElement.getAttribute("data-theme");
    if (stored && (THEMES as readonly string[]).includes(stored)) {
      setThemeState(stored as Theme);
    }
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // Private mode / storage diblokir — tema tetap jalan untuk sesi ini.
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
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
