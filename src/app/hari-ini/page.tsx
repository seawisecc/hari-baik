"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef } from "react";
import { DetailSiklus } from "@/components/hari-ini/DetailSiklus";
import { ForecastStrip } from "@/components/hari-ini/ForecastStrip";
import { PanduanCard } from "@/components/hari-ini/PanduanCard";
import { Sorotan } from "@/components/hari-ini/TodaySorotan";
import { TodayHero } from "@/components/hari-ini/TodayHero";
import { ButuhTanggalLahir, Memuat } from "@/components/ProGate";
import { PageContainer } from "@/components/shell/AppShell";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useLang, useT } from "@/lib/content/LangProvider";
import { getWeton } from "@/lib/content/weton";
import { buatPerkiraan, hariTerbaik, hariTerberat } from "@/lib/forecast";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { tanggalPanjang } from "@/lib/tanggal";
import { useUserData } from "@/lib/useUserData";
import { getWarigaDay, toDateString } from "@/lib/wariga";
import type { AccessState } from "@/types";

export default function HariIniPage() {
  const { birthDate, access, loading } = useUserData();
  const { profile } = useAuth();
  const { lang } = useLang();
  const t = useT();
  const panduanRef = useRef<HTMLDivElement>(null);
  const today = toDateString(new Date());

  const data = useMemo(() => {
    if (!birthDate) return null;
    const perkiraan = buatPerkiraan(birthDate, 8, today);
    return {
      hari: getWarigaDay(today, birthDate),
      perkiraan,
      terbaik: hariTerbaik(perkiraan),
      terberat: hariTerberat(perkiraan),
    };
  }, [birthDate, today]);

  if (loading) return <Memuat />;
  if (!birthDate || !data) return <ButuhTanggalLahir title={t("nav.today")} />;

  const weton = getWeton(data.hari.saptaWara, data.hari.pancaWara);
  const namaDepan = profile?.nama?.trim().split(" ")[0];

  return (
    <PageContainer>
      <div className="space-y-7">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-bold text-ink sm:text-4xl">
              {namaDepan ? `${t("today.greeting")}, ${namaDepan}` : t("today.greeting")}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">{tanggalPanjang(data.hari.date, lang)}</p>
          </div>
          <StatusLangganan access={access} />
        </header>

        <TodayHero
          hari={data.hari}
          onLihatPanduan={() =>
            panduanRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        />

        <DetailSiklus hari={data.hari} />

        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-heading text-xl font-semibold text-ink">
              {t("today.forecast")}
            </h2>
            <Link
              href="/kalender"
              className="inline-flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {t("today.viewCalendar")}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <ForecastStrip perkiraan={data.perkiraan} />
        </section>

        <Sorotan terbaik={data.terbaik} terberat={data.terberat} />

        <div ref={panduanRef} className="scroll-mt-6">
          <PanduanCard kategori={data.hari.kategori!.name} />
        </div>

        {weton && (
          <Card>
            <CardHeader>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                {t("today.wetonCharacter")}
              </p>
              <CardTitle className="mt-1">{weton.energi}</CardTitle>
              <p className="mt-0.5 text-sm text-ink-soft">{weton.tema}</p>
            </CardHeader>
            <CardBody className="space-y-5">
              <div className="grid gap-6 sm:grid-cols-2">
                <Tag label={t("today.suitedFor")} items={weton.cocokUntuk} />
                <Tag label={t("today.avoid")} items={weton.hindari} />
              </div>
              <p className="text-sm italic leading-relaxed text-ink-soft">{weton.afirmasi}</p>
            </CardBody>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}

function Tag({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
        {label}
      </p>
      <ul className="flex flex-wrap gap-2">
        {items.map((c) => (
          <li
            key={c}
            className="rounded-pill bg-surface-sunk px-3 py-1.5 text-xs text-ink-soft hb-sink-sm"
          >
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusLangganan({ access }: { access: AccessState }) {
  const t = useT();

  // Tanpa Firebase, status langganan belum berarti apa-apa: jangan tampilkan.
  if (access.type === "none") return null;

  const { kunci, nada } =
    access.type === "lifetime"
      ? { kunci: "admin.filter.lifetime", nada: "border-accent-strong/50 text-accent-deep" }
      : access.type === "subscription"
        ? { kunci: "admin.filter.active", nada: "border-guru/45 text-guru" }
        : { kunci: "admin.filter.trial", nada: "border-ratu/45 text-ratu" };

  return (
    <span className={`rounded-pill border px-3 py-1 text-xs font-medium ${nada}`}>
      {t(kunci)}
    </span>
  );
}
