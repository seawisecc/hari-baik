"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { DayDetail } from "@/components/calendar/DayDetail";
import { Legend } from "@/components/calendar/Legend";
import { ButuhTanggalLahir, Memuat } from "@/components/ProGate";
import { PageContainer } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { useLang } from "@/lib/content/LangProvider";
import { useUserData } from "@/lib/useUserData";
import { toDateString } from "@/lib/wariga";

/** "YYYY-MM-DD" — dipakai untuk memvalidasi ?tanggal= dari URL. */
const POLA_TANGGAL = /^\d{4}-\d{2}-\d{2}$/;

function KalenderView() {
  const { birthDate, loading } = useUserData();
  const { lang } = useLang();
  const params = useSearchParams();
  const today = toDateString(new Date());

  // Tanggal dari URL (dari kartu perkiraan di /hari-ini), kalau ada dan valid.
  const dariUrl = params.get("tanggal");
  const awal = dariUrl && POLA_TANGGAL.test(dariUrl) ? dariUrl : today;

  const [selected, setSelected] = useState(awal);
  const [cursor, setCursor] = useState(() => {
    const d = new Date(awal + "T12:00:00");
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const geserBulan = (delta: number) => {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const keHariIni = () => {
    const d = new Date();
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
    setSelected(today);
  };

  if (loading) return <Memuat />;
  if (!birthDate) return <ButuhTanggalLahir title="Kalender" />;

  const labelBulan = new Date(cursor.year, cursor.month, 1).toLocaleDateString(
    lang === "en" ? "en-GB" : "id-ID",
    { month: "long", year: "numeric" },
  );

  return (
    <PageContainer wide>
      {/* Desktop: kalender menempel di kiri sementara detail hari digulir
          di kanan — tidak perlu bolak-balik menggulung untuk mengganti hari. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
        <div className="lg:sticky lg:top-6">
          <Card elevation={2}>
            <CardBody className="pt-6">
              <div className="mb-5 flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => geserBulan(-1)}
                  aria-label="Bulan sebelumnya"
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
                  aria-label="Bulan berikutnya"
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
                  Kembali ke hari ini
                </Button>
              </div>

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

export default function KalenderPage() {
  // useSearchParams butuh Suspense boundary saat prerender.
  return (
    <Suspense fallback={<Memuat />}>
      <KalenderView />
    </Suspense>
  );
}
