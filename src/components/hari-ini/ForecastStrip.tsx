"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { useLang, useT } from "@/lib/content/LangProvider";
import type { HariPerkiraan } from "@/lib/forecast";
import { KATEGORI_BG, KATEGORI_HURUF, KATEGORI_KEY } from "@/lib/kategori";
import { namaHariPendek, tanggalBulan } from "@/lib/tanggal";

/** Tiga huruf pertama Saptawara, cukup untuk dikenali tanpa memakan lebar. */
function singkatSapta(nama: string) {
  return nama.slice(0, 3);
}

/**
 * Perkiraan tujuh hari ke depan, tidak termasuk hari ini yang sudah punya
 * kartu sendiri. Di mobile digulir mendatar; mulai sm jadi grid tujuh kolom.
 */
export function ForecastStrip({ perkiraan }: { perkiraan: HariPerkiraan[] }) {
  const t = useT();
  const { lang } = useLang();
  const mendatang = perkiraan.filter((h) => h.offset > 0);

  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
      <ul className="flex min-w-max gap-2.5 sm:grid sm:min-w-0 sm:grid-cols-7">
        {mendatang.map((h) => {
          const w = h.wariga;
          const istimewa = w.hariRayaHindu?.[0] ?? w.hariLibur;

          return (
            <li key={h.date} className="w-[92px] sm:w-auto">
              <Link
                href={`/kalender?tanggal=${h.date}`}
                title={`${t(`day.${KATEGORI_KEY[h.kategori]}`)}${istimewa ? ` · ${istimewa}` : ""}`}
                className="flex h-full flex-col items-center gap-2 rounded-lg bg-surface px-2.5 py-4 text-center hb-raise-1 transition-shadow duration-150 hover:hb-raise-2"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  {namaHariPendek(h.date, lang)}
                </span>

                <span className="font-heading text-2xl font-bold leading-none text-ink">
                  {tanggalBulan(h.date)}
                </span>

                {/* Pil berhuruf: warna sekaligus label, terbaca juga bagi yang
                    sulit membedakan warna. */}
                <span
                  className={cn(
                    "flex h-5 w-full items-center justify-center rounded-pill text-[11px] font-bold text-white",
                    KATEGORI_BG[h.kategori],
                  )}
                >
                  {KATEGORI_HURUF[h.kategori]}
                </span>

                <span className="text-[11px] leading-none text-ink-soft">
                  {singkatSapta(w.saptaWara)}
                </span>

                {istimewa && (
                  <span
                    aria-hidden
                    className="h-1 w-1 rounded-full bg-accent-deep"
                    title={istimewa}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
