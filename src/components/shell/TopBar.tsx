"use client";

import { LangToggle } from "@/components/ui/LangToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/** Header mobile. Di desktop kontrol ini pindah ke sidebar. */
export function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border-soft bg-canvas/85 px-5 py-3 backdrop-blur lg:hidden">
      <p className="font-heading text-lg font-bold italic text-ink">Hari Baik</p>
      <div className="flex items-center gap-2">
        <LangToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
