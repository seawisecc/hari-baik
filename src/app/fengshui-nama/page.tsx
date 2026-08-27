"use client";

import { Plus, Store, X } from "lucide-react";
import { useState } from "react";
import { PageContainer } from "@/components/shell/AppShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { PageHeader, Wisdom } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";
import { useLang, useT } from "@/lib/content/LangProvider";
import {
  BATAS_HURUF,
  BATAS_KANDIDAT,
  NADA_TONE,
  UNSUR_LABEL,
  UNSUR_SIFAT,
  bandingkanNama,
  saranHuruf,
  saranKata,
  type HasilFengshui,
} from "@/lib/content/fengshui";
import { KATEGORI_SOLID, KATEGORI_TEKS, KATEGORI_WASH } from "@/lib/kategori";

/**
 * Fengshui nama usaha dan produk.
 *
 * Halaman ini dirancang untuk membandingkan, bukan untuk memeriksa satu nama.
 * Orang yang sedang menamai usaha hampir selalu punya beberapa kandidat yang
 * masih ditimbang, dan yang dicarinya adalah alasan untuk mencoret salah satu.
 * Karena itu isian namanya jamak sejak awal, dan hasilnya diurutkan.
 */
export default function FengshuiNamaPage() {
  const t = useT();
  const { lang } = useLang();

  const [kandidat, setKandidat] = useState<string[]>([""]);
  const [hasil, setHasil] = useState<HasilFengshui[] | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  const ubah = (i: number, nilai: string) =>
    setKandidat((k) => k.map((n, j) => (j === i ? nilai : n)));

  const tambah = () => setKandidat((k) => [...k, ""]);

  const buang = (i: number) => {
    setKandidat((k) => (k.length === 1 ? [""] : k.filter((_, j) => j !== i)));
    // Hasil lama menyebut nama yang barusan dihapus, jadi tidak lagi menjawab
    // pertanyaan yang sedang di layar.
    setHasil(null);
  };

  const timbang = () => {
    const keluar = bandingkanNama(kandidat);
    if (keluar.length === 0) {
      setGalat(t("fengshui.empty"));
      setHasil(null);
      return;
    }
    setGalat(null);
    setHasil(keluar);
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader title={t("fengshui.title")} subtitle={t("fengshui.subtitle")} />

        <Card elevation={2}>
          <CardBody className="space-y-5 pt-6">
            <div className="space-y-3">
              <Label htmlFor="nama-0">{t("fengshui.label")}</Label>
              {kandidat.map((nama, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    id={`nama-${i}`}
                    value={nama}
                    maxLength={BATAS_HURUF + 20}
                    placeholder={t("fengshui.placeholder")}
                    onChange={(e) => ubah(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") timbang();
                    }}
                  />
                  {kandidat.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("fengshui.remove")}
                      onClick={() => buang(i)}
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {kandidat.length < BATAS_KANDIDAT && (
              <Button variant="surface" size="sm" onClick={tambah}>
                <Plus className="h-4 w-4" aria-hidden />
                {t("fengshui.add")}
              </Button>
            )}

            {galat && <Alert tone="error">{galat}</Alert>}

            <Button onClick={timbang} block>
              <Store className="h-4 w-4" aria-hidden />
              {t("fengshui.cta")}
            </Button>
          </CardBody>
        </Card>

        {hasil && (
          <div className="space-y-4">
            {hasil.map((h, i) => (
              <KartuNama
                key={`${h.nama}-${i}`}
                hasil={h}
                lang={lang}
                teratas={i === 0 && hasil.length > 1 && h.makna.nada === "baik"}
              />
            ))}

            <Card elevation={1}>
              <CardBody className="space-y-2 py-5">
                <p className="font-heading text-sm font-semibold text-ink">
                  {t("fengshui.method")}
                </p>
                <p className="text-[13px] leading-relaxed text-ink-soft">
                  {t("fengshui.methodDesc")}
                </p>
              </CardBody>
            </Card>

            <Wisdom>{t("fengshui.disclaimer")}</Wisdom>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function KartuNama({
  hasil,
  lang,
  teratas,
}: {
  hasil: HasilFengshui;
  lang: "id" | "en";
  teratas: boolean;
}) {
  const t = useT();
  const tone = NADA_TONE[hasil.makna.nada];
  // Keduanya sudah kosong sendiri bila angkanya mendukung, jadi tidak perlu
  // diperiksa dua kali di sini.
  const kata = saranKata(hasil);
  const huruf = saranHuruf(hasil);

  return (
    <Card elevation={teratas ? 3 : 2} className={cn("p-5", teratas && KATEGORI_WASH[tone])}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          {teratas && (
            <p className="mb-1.5 inline-block rounded-pill bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-ink">
              {t("fengshui.best")}
            </p>
          )}
          <p className="font-heading text-lg font-semibold text-ink">{hasil.nama}</p>
          <p className="mt-0.5 text-sm text-ink-soft">
            {t("fengshui.number", { n: hasil.angka })} · {hasil.makna.nama[lang]}
          </p>
          <p className="mt-0.5 text-xs text-ink-faint">
            {t("fengshui.sum", { n: hasil.jumlah })} ·{" "}
            {t("fengshui.element", { u: UNSUR_LABEL[hasil.unsur][lang] })}
          </p>
        </div>

        <span
          className={cn(
            "shrink-0 rounded-pill px-3.5 py-1.5 text-xs font-semibold",
            KATEGORI_SOLID[tone],
          )}
        >
          {t(`fengshui.tone.${hasil.makna.nada}`)}
        </span>
      </div>

      <p className="mt-3 border-t border-border-soft pt-3 text-[15px] leading-relaxed text-ink-soft">
        {hasil.makna.tafsir[lang]}
      </p>

      <p className="mt-2 text-[13px] leading-relaxed text-ink-faint">
        {UNSUR_SIFAT[hasil.unsur][lang]}
      </p>

      <RincianHurufBaris hasil={hasil} />

      {hasil.diabaikan > 0 && (
        <p className="mt-2 text-xs text-ink-faint">
          {t("fengshui.ignored", { n: hasil.diabaikan })}
        </p>
      )}
      {hasil.dipotong && (
        <p className="mt-2 text-xs text-ink-faint">
          {t("fengshui.trimmed", { n: BATAS_HURUF })}
        </p>
      )}

      {(kata.length > 0 || huruf.length > 0) && (
        <div className="mt-4 border-t border-border-soft pt-3">
          <p className="font-heading text-sm font-semibold text-ink">
            {t("fengshui.suggest.title")}
          </p>

          {kata.length > 0 && (
            <div className="mt-2">
              <p className="text-[13px] text-ink-soft">{t("fengshui.suggest.wordDesc")}</p>
              <ul className="mt-2 space-y-1.5">
                {kata.map((s) => (
                  <li key={s.kata} className="text-[13px] text-ink-soft">
                    <span className="font-semibold text-ink">{s.kata}</span>{" "}
                    <span className="text-ink-faint">
                      +{s.tambahan} → {t("fengshui.number", { n: s.angka })},{" "}
                    </span>
                    <span className={KATEGORI_TEKS.GURU}>{s.makna.nama[lang]}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {huruf.length > 0 && (
            <div className="mt-3">
              <p className="text-[13px] font-medium text-ink">{t("fengshui.suggest.letter")}</p>
              <ul className="mt-1 space-y-1">
                {huruf.map((s) => (
                  <li key={s.selisih} className="text-[13px] text-ink-soft">
                    {t("fengshui.suggest.letterDesc", {
                      n: s.selisih,
                      huruf: s.huruf.join(", "),
                    })}{" "}
                    <span className="text-ink-faint">
                      → {t("fengshui.number", { n: s.angka })},{" "}
                    </span>
                    <span className={KATEGORI_TEKS.GURU}>{s.makna.nama[lang]}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/**
 * Huruf beserta nilainya, satu per satu.
 *
 * Terlihat sepele, tapi inilah yang membuat hasilnya bisa diperiksa sendiri
 * oleh pengguna, bukan diterima begitu saja. Orang yang bisa melihat asal
 * angkanya jauh lebih mungkin mencoba ejaan lain, dan itu memang gunanya.
 */
function RincianHurufBaris({ hasil }: { hasil: HasilFengshui }) {
  const t = useT();
  if (hasil.rincian.length === 0) return null;

  return (
    <details className="mt-3">
      <summary className="cursor-pointer text-[13px] font-medium text-ink-soft hover:text-ink">
        {t("fengshui.breakdown")}
      </summary>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {hasil.rincian.map((r, i) => (
          <span
            key={i}
            className="inline-flex items-baseline gap-1 rounded-pill bg-surface-sunk px-2.5 py-1 text-xs hb-sink"
          >
            <span className="font-semibold text-ink">{r.huruf}</span>
            <span className="text-ink-faint">{r.nilai}</span>
          </span>
        ))}
      </div>
    </details>
  );
}
