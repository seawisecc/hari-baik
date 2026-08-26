"use client";

import { useT } from "@/lib/content/LangProvider";

const ITEMS = [
  { key: "guru", cls: "bg-guru" },
  { key: "ratu", cls: "bg-ratu" },
  { key: "lara", cls: "bg-lara" },
  { key: "pati", cls: "bg-pati" },
] as const;

export function Legend() {
  const t = useT();
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2.5">
      {ITEMS.map((i) => (
        <span key={i.key} className="flex items-center gap-2 text-xs text-ink-soft">
          <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${i.cls}`} />
          {t(`day.${i.key}`)}
        </span>
      ))}
      <span className="flex items-center gap-2 text-xs text-ink-soft">
        <span
          aria-hidden
          className="h-2.5 w-2.5 rounded-full border border-ink-faint bg-surface"
        />
        Purnama
      </span>
      <span className="flex items-center gap-2 text-xs text-ink-soft">
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-ink-faint" />
        Tilem
      </span>
      <span className="flex items-center gap-2 text-xs text-ink-soft">
        <span aria-hidden className="h-0.5 w-3.5 rounded-full bg-accent-strong" />
        Hari raya
      </span>
    </div>
  );
}
