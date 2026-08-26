"use client";

import { Moon, Sparkles, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLang, useT } from "@/lib/content/LangProvider";
import { KATEGORI_BG, KATEGORI_KEY, KATEGORI_WASH } from "@/lib/kategori";
import { tanggalPanjang } from "@/lib/tanggal";
import type { WarigaDay } from "@/lib/wariga";

/** Kartu utama: kategori hari ini, ditulis besar dan tanpa perlu digulir. */
export function TodayHero({ hari, nama }: { hari: WarigaDay; nama?: string | null }) {
  const t = useT();
  const { lang } = useLang();
  const kategori = hari.kategori!.name;
  const key = KATEGORI_KEY[kategori];

  const salam = nama ? `Halo, ${nama.split(" ")[0]}` : "Hari ini";

  return (
    <section className={cn("overflow-hidden rounded-xl hb-raise-3", KATEGORI_WASH[kategori])}>
      <div className="px-6 py-7 sm:px-9 sm:py-9">
        <p className="text-sm text-ink-soft">{salam}</p>
        <p className="mt-0.5 text-sm text-ink-faint">{tanggalPanjang(hari.date, lang)}</p>

        <div className="mt-6 flex items-start gap-4">
          <span
            aria-hidden
            className={cn(
              "mt-1.5 h-12 w-12 shrink-0 rounded-pill hb-raise-2 sm:h-14 sm:w-14",
              KATEGORI_BG[kategori],
            )}
          />
          <div className="min-w-0">
            <h1 className="font-heading text-3xl font-bold leading-tight text-ink sm:text-4xl">
              {t(`day.${key}`)}
            </h1>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">
              {t(`day.${key}.tagline`)}
            </p>
          </div>
        </div>

        <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink-soft">
          {t(`day.${key}.desc`)}
        </p>

        {/* Penanda khusus hari ini — hanya muncul kalau memang ada. */}
        {(hari.hariRayaHindu || hari.hariLibur || hari.isPurnama || hari.isTilem) && (
          <div className="mt-6 flex flex-wrap gap-2">
            {hari.hariLibur && <Penanda icon={Sparkles}>{hari.hariLibur}</Penanda>}
            {hari.hariRayaHindu?.map((r) => (
              <Penanda key={r} icon={Sparkles}>
                {r}
              </Penanda>
            ))}
            {hari.isPurnama && <Penanda icon={Sun}>Purnama {hari.sasih}</Penanda>}
            {hari.isTilem && <Penanda icon={Moon}>Tilem {hari.sasih}</Penanda>}
          </div>
        )}
      </div>

      {/* Baris wariga ringkas — konteks Bali tanpa mengalahkan pesan utama. */}
      <dl className="grid grid-cols-2 gap-px border-t border-border-soft bg-border-soft sm:grid-cols-4">
        {(
          [
            ["Weton", `${hari.saptaWara} ${hari.pancaWara}`],
            ["Wuku", hari.wuku],
            ["Sasih", hari.sasih],
            ["Penanggal", hari.lunarDay],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="bg-surface px-5 py-4">
            <dt className="text-[11px] uppercase tracking-wide text-ink-faint">{k}</dt>
            <dd className="mt-0.5 text-sm font-medium text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Penanda({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-surface px-3 py-1.5 text-xs font-medium text-ink hb-raise-1">
      <Icon className="h-3.5 w-3.5 text-accent-deep" aria-hidden />
      {children}
    </span>
  );
}
