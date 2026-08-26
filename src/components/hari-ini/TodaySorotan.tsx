"use client";

import { ArrowUpRight, TrendingUp, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useLang, useT } from "@/lib/content/LangProvider";
import type { HariPerkiraan } from "@/lib/forecast";
import { KATEGORI_BG, KATEGORI_KEY } from "@/lib/kategori";
import { labelRelatif, tanggalPendek } from "@/lib/tanggal";

/**
 * Dua sorotan dari tujuh hari ke depan: hari paling mendukung dan hari yang
 * paling menuntut kehati-hatian. Ini yang membuat halaman berguna untuk
 * merencanakan, bukan sekadar melihat hari ini.
 */
export function Sorotan({
  terbaik,
  terberat,
}: {
  terbaik: HariPerkiraan | null;
  terberat: HariPerkiraan | null;
}) {
  const t = useT();
  if (!terbaik && !terberat) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {terbaik && (
        <Kartu
          judul={t("today.mostSupportive")}
          icon={TrendingUp}
          hari={terbaik}
          catatan={t("today.supportiveNote")}
        />
      )}
      {terberat && terberat.date !== terbaik?.date && (
        <Kartu
          judul={t("today.mostCareful")}
          icon={TriangleAlert}
          hari={terberat}
          catatan={t("today.carefulNote")}
        />
      )}
    </div>
  );
}

function Kartu({
  judul,
  icon: Icon,
  hari,
  catatan,
}: {
  judul: string;
  icon: React.ComponentType<{ className?: string }>;
  hari: HariPerkiraan;
  catatan: string;
}) {
  const t = useT();
  const { lang } = useLang();

  return (
    <Link
      href={`/kalender?tanggal=${hari.date}`}
      className="group flex flex-col rounded-lg bg-surface px-6 py-5 hb-raise-1 transition-shadow duration-150 hover:hb-raise-2"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {judul}
        </p>
        <ArrowUpRight
          className="h-4 w-4 text-ink-faint transition-colors group-hover:text-ink-soft"
          aria-hidden
        />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span
          aria-hidden
          className={cn("h-8 w-8 shrink-0 rounded-pill hb-raise-1", KATEGORI_BG[hari.kategori])}
        />
        <div className="min-w-0">
          <p className="font-heading text-lg font-semibold leading-tight text-ink">
            {t(`day.${KATEGORI_KEY[hari.kategori]}`)}
          </p>
          <p className="text-xs text-ink-faint">
            {labelRelatif(hari.offset, hari.date, lang)} · {tanggalPendek(hari.date, lang)}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{catatan}</p>
    </Link>
  );
}
