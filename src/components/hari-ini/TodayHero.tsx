"use client";

import { Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/content/LangProvider";
import { KATEGORI_KEY, KATEGORI_SOLID } from "@/lib/kategori";
import type { WarigaDay } from "@/lib/wariga";

/**
 * Kartu utama hari ini: satu blok warna kategori, teks putih, tanpa hal lain
 * yang bersaing. Ini yang pertama dilihat pengguna tiap membuka aplikasi.
 */
export function TodayHero({
  hari,
  onLihatPanduan,
}: {
  hari: WarigaDay;
  onLihatPanduan: () => void;
}) {
  const t = useT();
  const kategori = hari.kategori!.name;
  const key = KATEGORI_KEY[kategori];

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl px-7 py-8 hb-raise-3 sm:px-10 sm:py-10",
        KATEGORI_SOLID[kategori],
      )}
    >
      {/* Bintang besar sebagai tekstur latar, sengaja terpotong di tepi. */}
      <Star
        className="pointer-events-none absolute -right-8 -top-6 h-56 w-56 text-white/10"
        strokeWidth={1.5}
        aria-hidden
      />

      <div className="relative max-w-xl">
        <p className="flex items-center gap-2 text-sm font-medium text-white/85">
          <Star className="h-4 w-4" aria-hidden />
          {t("energy")}
        </p>

        <h1 className="mt-3 font-heading text-4xl font-bold italic leading-tight sm:text-5xl">
          {t(`day.${key}`)}
        </h1>

        <p className="mt-2 text-[15px] leading-relaxed text-white/85 sm:text-base">
          {t(`day.${key}.tagline`)}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Pil>
            {hari.saptaWara} {hari.pancaWara}
          </Pil>
          <Pil>Wuku {hari.wuku}</Pil>
          {hari.isPurnama && <Pil>Purnama {hari.sasih}</Pil>}
          {hari.isTilem && <Pil>Tilem {hari.sasih}</Pil>}
        </div>

        <p className="mt-6 text-[15px] leading-relaxed text-white/90">{t(`day.${key}.desc`)}</p>

        <button
          type="button"
          onClick={onLihatPanduan}
          className={cn(
            "mt-7 inline-flex items-center gap-2 rounded-pill bg-white/20 px-5 py-3",
            "text-[15px] font-medium text-white backdrop-blur-sm",
            "transition-colors duration-150 hover:bg-white/30",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70",
          )}
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          {t("assist.btn")}
        </button>
      </div>
    </section>
  );
}

function Pil({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-pill bg-white/20 px-3.5 py-1.5 text-[13px] font-medium text-white">
      {children}
    </span>
  );
}
