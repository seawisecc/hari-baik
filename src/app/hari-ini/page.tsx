"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { ForecastStrip } from "@/components/hari-ini/ForecastStrip";
import { PanduanCard } from "@/components/hari-ini/PanduanCard";
import { Sorotan } from "@/components/hari-ini/TodaySorotan";
import { TodayHero } from "@/components/hari-ini/TodayHero";
import { ButuhTanggalLahir, Memuat } from "@/components/ProGate";
import { PageContainer } from "@/components/shell/AppShell";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { getWeton } from "@/lib/content/weton";
import { buatPerkiraan, hariTerbaik, hariTerberat } from "@/lib/forecast";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { useUserData } from "@/lib/useUserData";
import { getWarigaDay, toDateString } from "@/lib/wariga";

export default function HariIniPage() {
  const { birthDate, loading } = useUserData();
  const { profile } = useAuth();
  const today = toDateString(new Date());

  const data = useMemo(() => {
    if (!birthDate) return null;
    const perkiraan = buatPerkiraan(birthDate, 7, today);
    return {
      hari: getWarigaDay(today, birthDate),
      perkiraan,
      terbaik: hariTerbaik(perkiraan),
      terberat: hariTerberat(perkiraan),
    };
  }, [birthDate, today]);

  if (loading) return <Memuat />;
  if (!birthDate || !data) return <ButuhTanggalLahir title="Hari Ini" />;

  const weton = getWeton(data.hari.saptaWara, data.hari.pancaWara);

  return (
    <PageContainer>
      <div className="space-y-8">
        <TodayHero hari={data.hari} nama={profile?.nama} />

        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-heading text-xl font-semibold text-ink">Tujuh hari ke depan</h2>
            <Link
              href="/kalender"
              className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"
            >
              Lihat kalender
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <ForecastStrip perkiraan={data.perkiraan} />
        </section>

        <Sorotan terbaik={data.terbaik} terberat={data.terberat} />

        <PanduanCard kategori={data.hari.kategori!.name} />

        {weton && (
          <Card>
            <CardHeader>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                Karakter weton hari ini
              </p>
              <CardTitle className="mt-1">{weton.energi}</CardTitle>
              <p className="mt-0.5 text-sm text-ink-soft">{weton.tema}</p>
            </CardHeader>
            <CardBody className="space-y-5">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                    Cocok untuk
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {weton.cocokUntuk.map((c) => (
                      <li
                        key={c}
                        className="rounded-pill bg-surface-sunk px-3 py-1.5 text-xs text-ink-soft hb-sink-sm"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                    Hindari
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {weton.hindari.map((c) => (
                      <li
                        key={c}
                        className="rounded-pill bg-surface-sunk px-3 py-1.5 text-xs text-ink-soft hb-sink-sm"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="text-sm italic leading-relaxed text-ink-soft">{weton.afirmasi}</p>
            </CardBody>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
