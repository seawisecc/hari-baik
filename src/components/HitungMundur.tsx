"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/content/LangProvider";
import { pecahSisa, type SisaPromo } from "@/lib/promo";

/**
 * Jam mundur promo.
 *
 * Kenapa jam, bukan kalimat "berakhir 27 hari lagi": kalimat itu benar tapi
 * tidak menuntut apa-apa. Angka yang bergerak turun di depan mata mengubah
 * batas waktu dari keterangan jadi sesuatu yang sedang terjadi, dan itu satu-
 * satunya hal di halaman ini yang tidak bisa ditunda ke besok. Kalimatnya
 * tetap ada di sebelahnya untuk yang cuma memindai.
 *
 * Nilai awalnya WAJIB datang dari server lewat `awal`, bukan dihitung sendiri
 * di sini dengan `Date.now()`. Halaman depan dirender di server, dan detik
 * yang dihitung ulang saat hidrasi hampir pasti berbeda dari detik yang sudah
 * tertulis di HTML: React membuang seluruh pohonnya lalu menggambar ulang,
 * dan yang dilihat pengunjung adalah halaman yang berkedip. Setelah terpasang
 * barulah jamnya berdetak dengan waktu peramban, dan tikan pertama langsung
 * membetulkan selisih apa pun akibat halaman statis yang sudah tersimpan
 * beberapa menit.
 *
 * Seluruh angkanya `aria-hidden`. Pembaca layar yang membacakan ulang detik
 * yang berganti tiap detik tidak bisa dipakai; yang dibacakan satu kalimat
 * ringkas di sebelahnya, dan itu sudah cukup untuk tahu penawarannya berbatas
 * waktu.
 */

/** Dua digit, supaya lebarnya tidak melompat tiap kali angkanya turun. */
const dua = (n: number) => String(n).padStart(2, "0");

function Petak({ nilai, label }: { nilai: string; label: string }) {
  return (
    <div className="min-w-[3.25rem] rounded-md bg-surface px-2.5 py-2 text-center hb-raise-1">
      <span className="block font-heading text-xl font-bold tabular-nums leading-none text-ink">
        {nilai}
      </span>
      <span className="mt-1 block text-[10px] font-medium uppercase tracking-wide text-ink-faint">
        {label}
      </span>
    </div>
  );
}

export function HitungMundur({
  berakhirPada,
  awal,
  ringkas = false,
}: {
  /** ISO tanggal berakhirnya promo. */
  berakhirPada: string;
  /** Sisa waktu saat halaman dirender di server. Lihat catatan di atas. */
  awal: SisaPromo;
  /** Bentuk satu baris untuk bilah melayang, bukan deret petak. */
  ringkas?: boolean;
}) {
  const t = useT();
  const [sisa, setSisa] = useState<SisaPromo>(awal);

  useEffect(() => {
    const batas = Date.parse(berakhirPada);
    if (!Number.isFinite(batas)) return;
    const tik = () => setSisa(pecahSisa(batas - Date.now()));
    tik();
    const id = setInterval(tik, 1000);
    return () => clearInterval(id);
  }, [berakhirPada]);

  /* Satu kalimat untuk pembaca layar, menggantikan seluruh angka di atas.
     Harinya dibulatkan ke atas di sini supaya berbunyi sama dengan kalimat
     "berakhir N hari lagi" yang dipakai di tempat lain di halaman ini. */
  const hariBulat = Math.max(1, sisa.hari + (sisa.jam || sisa.menit || sisa.detik ? 1 : 0));

  if (ringkas) {
    return (
      <span className="inline-flex items-baseline gap-1 font-semibold tabular-nums text-ink">
        <span className="sr-only">{t("promo.srEnds", { n: hariBulat })}</span>
        <span aria-hidden>
          {sisa.hari}
          {t("promo.dShort")} {dua(sisa.jam)}
          {t("promo.hShort")} {dua(sisa.menit)}
          {t("promo.mShort")} {dua(sisa.detik)}
          {t("promo.sShort")}
        </span>
      </span>
    );
  }

  return (
    <div>
      <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-accent-deep">
        {t("promo.countdown")}
      </p>
      <span className="sr-only">{t("promo.srEnds", { n: hariBulat })}</span>
      <div className="flex items-stretch justify-center gap-2" aria-hidden>
        <Petak nilai={String(sisa.hari)} label={t("promo.d")} />
        <Petak nilai={dua(sisa.jam)} label={t("promo.h")} />
        <Petak nilai={dua(sisa.menit)} label={t("promo.m")} />
        <Petak nilai={dua(sisa.detik)} label={t("promo.s")} />
      </div>
    </div>
  );
}
