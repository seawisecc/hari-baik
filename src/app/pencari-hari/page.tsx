"use client";

import { CalendarSearch, Sparkles } from "lucide-react";
import { useState } from "react";
import { ButuhTanggalLahir, Memuat } from "@/components/ProGate";
import { PageContainer } from "@/components/shell/AppShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { PageHeader, Wisdom } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";
import { useLang, useT } from "@/lib/content/LangProvider";
import {
  JENIS_ACARA,
  cariHariAcara,
  type HariAcara,
  type HasilPencarian,
  type JenisAcara,
} from "@/lib/content/acara";
import { KATEGORI_SOLID, KATEGORI_TEKS, KATEGORI_WASH } from "@/lib/kategori";
import { tanggalMedium } from "@/lib/tanggal";
import { useUserData } from "@/lib/useUserData";
import { toDateString } from "@/lib/wariga";

/** Rentang bawaan: mulai besok, sebulan ke depan. */
function rentangAwal() {
  const besok = new Date();
  besok.setDate(besok.getDate() + 1);
  const akhir = new Date(besok);
  akhir.setMonth(akhir.getMonth() + 1);
  return { dari: toDateString(besok), sampai: toDateString(akhir) };
}

export default function PencariHariPage() {
  const t = useT();
  const { lang } = useLang();
  const { birthDate, loading } = useUserData();

  const awal = rentangAwal();
  const [dari, setDari] = useState(awal.dari);
  const [sampai, setSampai] = useState(awal.sampai);
  const [jenis, setJenis] = useState<JenisAcara>("umum");
  const [hasil, setHasil] = useState<HasilPencarian | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  if (loading) return <Memuat />;
  if (!birthDate) return <ButuhTanggalLahir title={t("acara.title")} />;

  const cari = () => {
    if (sampai < dari) {
      setGalat(t("acara.rangeInvalid"));
      setHasil(null);
      return;
    }
    setGalat(null);
    setHasil(cariHariAcara(birthDate, dari, sampai, jenis));
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader title={t("acara.title")} subtitle={t("acara.subtitle")} />

        <Card elevation={2}>
          <CardBody className="space-y-5 pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dari">{t("acara.from")}</Label>
                <Input
                  id="dari"
                  type="date"
                  value={dari}
                  onChange={(e) => setDari(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sampai">{t("acara.to")}</Label>
                <Input
                  id="sampai"
                  type="date"
                  value={sampai}
                  onChange={(e) => setSampai(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("acara.type")}</Label>
              {/* Tombol, bukan select: pilihannya sedikit dan semuanya layak
                  terlihat sekaligus, jadi tidak perlu disembunyikan. */}
              <div className="flex flex-wrap gap-2">
                {JENIS_ACARA.map((j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => setJenis(j)}
                    aria-pressed={jenis === j}
                    className={cn(
                      "rounded-pill px-4 py-2 text-sm font-medium transition-shadow duration-150",
                      jenis === j
                        ? "bg-accent text-accent-ink hb-raise-1"
                        : "bg-surface-sunk text-ink-soft hb-sink hover:text-ink",
                    )}
                  >
                    {t(`acara.jenis.${j}`)}
                  </button>
                ))}
              </div>
            </div>

            {galat && <Alert tone="error">{galat}</Alert>}

            <Button onClick={cari} block>
              <CalendarSearch className="h-4 w-4" aria-hidden />
              {t("acara.cta")}
            </Button>
          </CardBody>
        </Card>

        {hasil && (
          <div className="space-y-4">
            <p className="text-sm text-ink-soft">
              {t("acara.result", { n: hasil.hari.length, total: hasil.diperiksa })}
            </p>

            {hasil.dipotong && (
              <Alert tone="warning">{t("acara.trimmed", { n: hasil.diperiksa })}</Alert>
            )}

            {hasil.hari.length === 0 ? (
              <Card elevation={1}>
                <CardBody className="py-8 text-center text-[15px] leading-relaxed text-ink-soft">
                  {t("acara.none")}
                </CardBody>
              </Card>
            ) : (
              <ul className="space-y-3">
                {hasil.hari.map((h, i) => (
                  <BarisHari key={h.tanggal} hari={h} lang={lang} teratas={i === 0} />
                ))}
              </ul>
            )}

            <Wisdom>{t("acara.disclaimer")}</Wisdom>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function BarisHari({
  hari,
  lang,
  teratas,
}: {
  hari: HariAcara;
  lang: "id" | "en";
  teratas: boolean;
}) {
  const t = useT();
  return (
    <li>
      <Card
        elevation={teratas ? 3 : 1}
        className={cn("p-5", teratas && KATEGORI_WASH[hari.kategori])}
      >
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0 flex-1">
            {teratas && (
              <p className="mb-1.5 inline-flex items-center gap-1 rounded-pill bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-ink">
                <Sparkles className="h-2.5 w-2.5" aria-hidden />
                {t("acara.best")}
              </p>
            )}
            <p className="font-heading text-lg font-semibold text-ink">
              {tanggalMedium(hari.tanggal, lang)}
            </p>
            <p className="mt-0.5 text-sm text-ink-soft">
              {hari.saptaWara} {hari.pancaWara} · {hari.wuku}
            </p>
            <p className="mt-0.5 text-xs text-ink-faint">
              {hari.lunar} · {hari.sasih}
            </p>
          </div>

          <span
            className={cn(
              "shrink-0 rounded-pill px-3.5 py-1.5 text-xs font-semibold",
              KATEGORI_SOLID[hari.kategori],
            )}
          >
            {t(`day.${hari.kategori.toLowerCase()}`)}
          </span>
        </div>

        {(hari.dukungan.length > 0 || hari.catatan.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border-soft pt-3 text-xs">
            {hari.dukungan.length > 0 && (
              <span className={KATEGORI_TEKS.GURU}>
                {t("acara.support")}:{" "}
                {hari.dukungan.map((d) => t(`acara.tanda.${d}`)).join(", ")}
              </span>
            )}
            {hari.catatan.length > 0 && (
              <span className="text-ink-faint">
                {t("acara.note")}:{" "}
                {hari.catatan
                  .map((c) => (c.startsWith("acara") ? t(c) : t(`acara.tanda.${c}`)))
                  .join(", ")}
              </span>
            )}
          </div>
        )}
      </Card>
    </li>
  );
}
