"use client";

import { THEMES, THEME_LABELS, useTheme } from "@/lib/theme/ThemeProvider";
import { cn } from "@/lib/cn";

/** Pemilih tema aksen. Segmented control tertekan ala styleguide. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Tema warna"
      className={cn(
        "inline-flex gap-1 rounded-pill bg-surface-sunk p-1 hb-sink",
        className,
      )}
    >
      {THEMES.map((t) => (
        <button
          key={t}
          role="radio"
          aria-checked={theme === t}
          onClick={() => setTheme(t)}
          className={cn(
            "flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-medium",
            "transition-[box-shadow,background-color] duration-150",
            theme === t
              ? "bg-surface text-ink hb-raise-1"
              : "text-ink-faint hover:text-ink-soft",
          )}
        >
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: t === "mint" ? "#6fbf95" : "#e0975a" }}
          />
          {THEME_LABELS[t]}
        </button>
      ))}
    </div>
  );
}
