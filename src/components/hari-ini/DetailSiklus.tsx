"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/content/LangProvider";
import type { WarigaDay } from "@/lib/wariga";

/**
 * Detail wariga lengkap, terlipat secara bawaan.
 *
 * Lima belas atribut sekaligus akan menenggelamkan pesan utama halaman;
 * yang butuh detail bisa membukanya, yang tidak tetap dapat halaman bersih.
 */
export function DetailSiklus({ hari }: { hari: WarigaDay }) {
  const t = useT();
  const [terbuka, setTerbuka] = useState(false);
  const panelId = useId();

  const baris: [string, string][] = [
    ["Saptawara", hari.saptaWara],
    ["Pancawara", hari.pancaWara],
    ["Triwara", hari.triWara],
    ["Caturwara", hari.caturWara],
    ["Sadwara", hari.sadWara],
    ["Astawara", hari.astaWara],
    ["Sangawara", hari.sangaWara],
    ["Dasawara", hari.dasaWara],
    ["Wuku", hari.wuku],
    ["Lintang", hari.lintang],
    ["Watek", hari.watek],
    ["Sasih", hari.sasih],
    ["Penanggal", hari.lunarDay],
    ["Pratima", hari.pratima],
    ["Urip", String(hari.uripTotal)],
  ];

  return (
    <div className="overflow-hidden rounded-lg bg-surface hb-raise-1">
      <button
        type="button"
        onClick={() => setTerbuka((v) => !v)}
        aria-expanded={terbuka}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-150 hover:bg-surface-sunk/40"
      >
        <span className="font-heading text-lg font-semibold text-ink">
          {t("detail.section")}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-ink-faint transition-transform duration-200",
            terbuka && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {terbuka && (
        <dl
          id={panelId}
          className="grid grid-cols-2 gap-px border-t border-border-soft bg-border-soft sm:grid-cols-3 lg:grid-cols-5"
        >
          {baris.map(([k, v]) => (
            <div key={k} className="bg-surface px-5 py-3.5">
              <dt className="text-[11px] uppercase tracking-wide text-ink-faint">{k}</dt>
              <dd className="mt-0.5 text-sm font-medium text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
