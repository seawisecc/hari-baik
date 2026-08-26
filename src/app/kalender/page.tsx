"use client";

import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { DayDetail } from "@/components/calendar/DayDetail";
import { Legend } from "@/components/calendar/Legend";
import { ButuhTanggalLahir, Memuat } from "@/components/ProGate";
import { PageContainer } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { useLang, useT } from "@/lib/content/LangProvider";
import { tanggalKalender } from "@/lib/gate";
import { useUserData } from "@/lib/useUserData";
import { toDateString } from "@/lib/wariga";

/** "YYYY-MM-DD": dipakai untuk memvalidasi ?tanggal= dari URL. */
const POLA_TANGGAL = /^\d{4}-\d{2}-\d{2}$/;

function KalenderView() {
  const { birthDate, loading, access } = useUserData();
  const { lang } = useLang();
  const t = useT();
  const params = useSearchParams();
  const today = toDateString(new Date());

  /*
   * Selama masa coba kalender terkunci di bulan berjalan.
   *
   * Batasnya diterapkan pada state, bukan hanya pada tombolnya, karena tanggal
   * juga bisa datang dari URL lewat ?tanggal= dari kartu perkiraan. Menonaktifkan
   * tombol saja akan meninggalkan pintu belakang yang terbuka.
   */
  const bebas = access.isPro;

  // Tanggal dari URL (dari kartu perkiraan di /hari-ini), kalau ada dan valid.
  const dariUrl = params.get("tanggal");
  const diminta = dariUrl && POLA_TANGGAL.test(dariUrl) ? dariUrl : today;
  const awal = tanggalKalender(diminta, today, bebas);

  const [selected, setSelected] = useState(awal);
  const [cursor, setCursor] = useState(() => {
    const d = new Date(awal + "T12:00:00");
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const geserBulan = (delta: number) => {
    if (!bebas) return;
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  /** Lompat ke tanggal mana pun. Hanya untuk pelanggan. */
  const keTanggal = (tanggal: string) => {
    if (!bebas || !POLA_TANGGAL.test(tanggal)) return;
    const d = new Date(tanggal + "T12:00:00");
    if (Number.isNaN(d.getTime())) return;
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
    setSelected(tanggal);
  };

  const keHariIni = () => {
    const d = new Date();
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
    setSelected(today);
  };

  if (loading) return <Memuat />;
  if (!birthDate) return <ButuhTanggalLahir title={t("nav.calendar")} />;

  const labelBulan = new Date(cursor.year, cursor.month, 1).toLocaleDateString(
    lang === "en" ? "en-GB" : "id-ID",
    { month: "long", year: "numeric" },
  );

  return (
    <PageContainer wide>
      {/* Desktop: kalender menempel di kiri sementara detail hari digulir
          di kanan. Tidak perlu bolak-balik menggulung untuk mengganti hari. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
        <div className="lg:sticky lg:top-6">
          <Card elevation={2}>
            <CardBody className="pt-6">
              <div className="mb-5 flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => geserBulan(-1)}
                  disabled={!bebas}
                  aria-label={t("calendar.prevMonth")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <p className="font-heading text-lg font-semibold capitalize text-ink">
                  {labelBulan}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => geserBulan(1)}
                  disabled={!bebas}
                  aria-label={t("calendar.nextMonth")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <CalendarGrid
                year={cursor.year}
                month={cursor.month}
                birthDate={birthDate}
                selected={selected}
                onSelect={setSelected}
              />

              <div className="mt-5 flex justify-center">
                <Button variant="ghost" size="sm" onClick={keHariIni}>
                  {t("calendar.backToToday")}
                </Button>
              </div>

              {bebas ? <LompatTanggal onPilih={keTanggal} /> : <KunciMasaCoba />}

              <div className="mt-4 border-t border-border-soft pt-5">
                <Legend />
              </div>
            </CardBody>
          </Card>
        </div>

        <DayDetail date={selected} birthDate={birthDate} />
      </div>
    </PageContainer>
  );
}

/**
 * Lompat ke tanggal mana pun, untuk pelanggan.
 *
 * Mengganti bulan satu per satu tidak masuk akal untuk tanggal yang jauh,
 * misalnya memeriksa hari lahir atau merencanakan acara tahun depan.
 */
function LompatTanggal({ onPilih }: { onPilih: (tanggal: string) => void }) {
  const t = useT();
  const [nilai, setNilai] = useState("");

  return (
    <form
      className="mt-4 border-t border-border-soft pt-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (nilai) onPilih(nilai);
      }}
    >
      <Label htmlFor="lompat">{t("calendar.jump")}</Label>
      <div className="mt-2 flex gap-2">
        <Input
          id="lompat"
          type="date"
          value={nilai}
          onChange={(e) => setNilai(e.target.value)}
          className="h-11"
        />
        <Button type="submit" size="sm" disabled={!nilai} className="shrink-0">
          {t("calendar.jumpGo")}
        </Button>
      </div>
    </form>
  );
}

/** Penjelasan kenapa bulan tidak bisa diganti selama masa coba. */
function KunciMasaCoba() {
  const t = useT();
  return (
    <div className="mt-4 space-y-2 border-t border-border-soft pt-4">
      <p className="flex items-center gap-2 text-sm font-medium text-ink">
        <Lock className="h-3.5 w-3.5 shrink-0 text-ink-faint" aria-hidden />
        {t("calendar.trialLocked")}
      </p>
      <p className="text-[13px] leading-relaxed text-ink-soft">
        {t("calendar.trialLockedDesc")}
      </p>
      <Link
        href="/profil"
        className="inline-block text-[13px] font-medium text-accent-deep underline underline-offset-2"
      >
        {t("calendar.subscribeCta")}
      </Link>
    </div>
  );
}

export default function KalenderPage() {
  // useSearchParams butuh Suspense boundary saat prerender.
  return (
    <Suspense fallback={<Memuat />}>
      <KalenderView />
    </Suspense>
  );
}
