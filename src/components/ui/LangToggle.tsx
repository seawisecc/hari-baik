"use client";

import { cn } from "@/lib/cn";
import { LANGS, LANG_LABELS } from "@/lib/content/i18n";
import { useLang } from "@/lib/content/LangProvider";

export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div
      role="radiogroup"
      aria-label="Bahasa"
      className={cn("inline-flex gap-1 rounded-pill bg-surface-sunk p-1 hb-sink", className)}
    >
      {LANGS.map((l) => (
        <button
          key={l}
          role="radio"
          aria-checked={lang === l}
          onClick={() => setLang(l)}
          className={cn(
            "rounded-pill px-3 py-1.5 text-xs font-medium transition-[box-shadow,background-color] duration-150",
            lang === l ? "bg-surface text-ink hb-raise-1" : "text-ink-faint hover:text-ink-soft",
          )}
        >
          {LANG_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
