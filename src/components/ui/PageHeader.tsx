"use client";

import { LangToggle } from "./LangToggle";
import { ThemeToggle } from "./ThemeToggle";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="space-y-4">
      <div className="flex justify-end gap-2">
        <LangToggle />
        <ThemeToggle />
      </div>
      <div>
        <h1 className="font-heading text-3xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-ink-soft">{subtitle}</p>}
      </div>
    </header>
  );
}

/** Kutipan penyeimbang — mengingatkan bahwa hasil hitungan bukan vonis. */
export function Wisdom({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md bg-surface-sunk px-5 py-4 hb-sink">
      <p className="text-[13px] italic leading-relaxed text-ink-soft">{children}</p>
    </div>
  );
}
