"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { useLang, useT } from "@/lib/content/LangProvider";
import type { HariPerkiraan } from "@/lib/forecast";
import { KATEGORI_BG, KATEGORI_KEY, KATEGORI_WASH } from "@/lib/kategori";
import { labelRelatif, tanggalBulan, tanggalPendek } from "@/lib/tanggal";

/**
 * Ringkasan tujuh hari. Di mobile digulir mendatar; mulai lg jadi grid
 * tujuh kolom supaya seluruh minggu terbaca sekaligus.
 */
export function ForecastStrip({ perkiraan }: { perkiraan: HariPerkiraan[] }) {
  const t = useT();
  const { lang } = useLang();

  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0 lg:overflow-visible">
      <ul className="flex min-w-max gap-2.5 lg:grid lg:min-w-0 lg:grid-cols-7">
        {perkiraan.map((h) => {
          const hariIni = h.offset === 0;
          const w = h.wariga;
          const istimewa = w.hariRayaHindu || w.hariLibur;

          return (
            <li key={h.date} className="w-[104px] lg:w-auto">
              <Link
                href={`/kalender?tanggal=${h.date}`}
                className={cn(
                  "flex h-full flex-col items-center gap-2 rounded-lg px-3 py-4 text-center",
                  "transition-shadow duration-150",
                  hariIni
                    ? `${KATEGORI_WASH[h.kategori]} hb-raise-2`
                    : "bg-surface hb-raise-1 hover:hb-raise-2",
                )}
              >
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    hariIni ? "text-ink" : "text-ink-faint",
                  )}
                >
                  {labelRelatif(h.offset, h.date, lang)}
                </span>

                <span className="font-heading text-2xl font-bold leading-none text-ink">
                  {tanggalBulan(h.date)}
                </span>

                <span
                  aria-hidden
                  className={cn("h-2 w-2 rounded-full", KATEGORI_BG[h.kategori])}
                />

                <span className="text-[11px] leading-tight text-ink-soft">
                  {t(`day.${KATEGORI_KEY[h.kategori]}`)}
                </span>

                {istimewa && (
                  <span className="mt-auto pt-1 text-[10px] leading-tight text-accent-deep">
                    {w.hariRayaHindu?.[0] ?? w.hariLibur}
                  </span>
                )}

                <span className="sr-only">{tanggalPendek(h.date, lang)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
