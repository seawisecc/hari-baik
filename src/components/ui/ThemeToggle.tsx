"use client";

import { cn } from "@/lib/cn";
import { useT } from "@/lib/content/LangProvider";
import { THEMES, THEME_LABELS, useTheme } from "@/lib/theme/ThemeProvider";

const CONTOH: Record<(typeof THEMES)[number], string> = {
  mint: "#6fbf95",
  senja: "#e0975a",
};

/**
 * Pemilih tema.
 *
 * `compact` menampilkan titik warnanya saja, tanpa nama tema. Di layar sempit
 * nama seperti "Mint" dan "Senja" memakan ruang tanpa menjelaskan apa pun yang
 * tidak sudah dijelaskan warnanya sendiri; nama tetap ada sebagai label bagi
 * pembaca layar dan tooltip.
 */
export function ThemeToggle({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const t = useT();

  return (
    <div
      role="radiogroup"
      aria-label={t("settings.theme")}
      className={cn("inline-flex gap-1 rounded-pill bg-surface-sunk p-1 hb-sink", className)}
    >
      {THEMES.map((nama) => {
        const aktif = theme === nama;
        return (
          <button
            key={nama}
            role="radio"
            aria-checked={aktif}
            aria-label={THEME_LABELS[nama]}
            title={THEME_LABELS[nama]}
            onClick={() => setTheme(nama)}
            className={cn(
              "flex items-center justify-center rounded-pill transition-[box-shadow,background-color] duration-150",
              compact ? "h-7 w-7" : "gap-1.5 px-3 py-1.5",
              aktif ? "bg-surface text-ink hb-raise-1" : "text-ink-faint hover:text-ink-soft",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "rounded-full transition-transform duration-150",
                compact ? "h-3.5 w-3.5" : "h-2.5 w-2.5",
                aktif && compact && "scale-100",
              )}
              style={{ background: CONTOH[nama] }}
            />
            {!compact && <span className="text-xs font-medium">{THEME_LABELS[nama]}</span>}
          </button>
        );
      })}
    </div>
  );
}
