"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useLang, useT } from "@/lib/content/LangProvider";
import type { HariPerkiraan } from "@/lib/forecast";
import { KATEGORI_BG, KATEGORI_KEY } from "@/lib/kategori";
import { namaHariPendek, tanggalBulan } from "@/lib/tanggal";

/**
 * Perkiraan tujuh hari ke depan.
 *
 * Satu kartu berisi tujuh kolom yang dipisah garis rambut, bukan tujuh kartu
 * terpisah: bentuknya jadi sama dengan tabel Detail Siklus dan Profil, dan
 * ketujuh hari terbaca sebagai satu rentang, bukan tujuh benda lepas.
 *
 * Kategorinya ditulis dengan nama, bukan huruf tunggal. Huruf G/R/L/P menuntut
 * pembaca menghafal kodenya lebih dulu; namanya sendiri sudah cukup pendek.
 */
export function ForecastStrip({ perkiraan }: { perkiraan: HariPerkiraan[] }) {
  const t = useT();
  const { lang } = useLang();
  const mendatang = perkiraan.filter((h) => h.offset > 0);

  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:overflow-visible sm:px-0">
      <ul className="grid min-w-max grid-cols-7 gap-px overflow-hidden rounded-lg bg-border-soft hb-raise-1 sm:min-w-0">
        {mendatang.map((h) => {
          const w = h.wariga;
          const istimewa = w.hariRayaHindu?.[0] ?? w.hariLibur;
          const nama = t(`day.${KATEGORI_KEY[h.kategori]}`);

          return (
            <li key={h.date} className="w-[104px] sm:w-auto">
              <Link
                href={`/kalender?tanggal=${h.date}`}
                title={istimewa ? `${nama} · ${istimewa}` : nama}
                className="flex h-full flex-col items-center gap-2.5 bg-surface px-3 py-4 text-center transition-colors duration-150 hover:bg-surface-sunk/60"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  {namaHariPendek(h.date, lang)}
                </span>

                <span className="font-heading text-[26px] font-bold leading-none text-ink">
                  {tanggalBulan(h.date)}
                </span>

                {/* Garis warna, bukan pil berhuruf: warnanya menyampaikan
                    kategori dan namanya di bawah menjelaskan warnanya. */}
                <span
                  aria-hidden
                  className={cn("h-1 w-8 rounded-full", KATEGORI_BG[h.kategori])}
                />

                <span className="text-[11px] leading-tight text-ink-soft">{nama}</span>

                {istimewa ? (
                  <span className="mt-auto flex items-center gap-1 pt-1 text-[10px] leading-tight text-accent-deep">
                    <Sparkles className="h-2.5 w-2.5 shrink-0" aria-hidden />
                    <span className="line-clamp-2">{istimewa}</span>
                  </span>
                ) : (
                  <span className="mt-auto" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
