"use client";

import { useState } from "react";
import { ButuhTanggalLahir, Memuat, ProLocked } from "@/components/ProGate";
import { Card, CardBody } from "@/components/ui/Card";
import { PageContainer } from "@/components/shell/AppShell";
import { PageHeader, Wisdom } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/content/LangProvider";
import {
  hitungUsia,
  periodeSaatIni,
  petaPerjalananHidup,
  type NasibTone,
} from "@/lib/content/nasib";
import { useUserData } from "@/lib/useUserData";
import { uripHari } from "@/lib/wariga";

const TONE_BG: Record<NasibTone, string> = {
  accent: "bg-accent",
  guru: "bg-guru",
  ratu: "bg-ratu",
  lara: "bg-lara",
  pati: "bg-pati",
};

export default function PerjalananHidupPage() {
  const t = useT();
  const { birthDate, access, loading } = useUserData();
  const [terbuka, setTerbuka] = useState<number | null>(null);

  if (loading) return <Memuat />;
  if (!access.isPro) {
    return <ProLocked titleKey="pro.nasib.title" descKey="pro.lock.desc.nasib" />;
  }

  if (!birthDate) return <ButuhTanggalLahir title={t("pro.nasib.title")} />;

  const urip = uripHari(birthDate);
  const peta = petaPerjalananHidup(urip);
  const usia = hitungUsia(birthDate);
  const sekarang = periodeSaatIni(peta, usia);

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader title={t("pro.nasib.title")} subtitle={t("pro.nasib.subtitle")} />

        <Wisdom>{t("wisdom.nasib")}</Wisdom>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-soft">
          <span>
            Urip lahir: <strong className="text-ink">{urip}</strong>
          </span>
          <span>
            Usia sekarang: <strong className="text-ink">{usia} tahun</strong>
          </span>
        </div>

        <div className="space-y-2.5">
          {peta.map((p, i) => {
            const aktif = i === sekarang;
            const dibuka = terbuka === i;
            const bisaDibuka = p.rejeki !== null || p.saran !== null;

            return (
              <Card
                key={`${p.ageMin}-${p.ageMax}`}
                elevation={aktif ? 3 : 1}
                className={cn(
                  "overflow-hidden transition-shadow",
                  aktif && "ring-2 ring-accent-strong/40",
                )}
              >
                <button
                  type="button"
                  disabled={!bisaDibuka}
                  onClick={() => setTerbuka(dibuka ? null : i)}
                  aria-expanded={dibuka}
                  className={cn(
                    "flex w-full items-center gap-3.5 px-5 py-4 text-left",
                    bisaDibuka && "hover:bg-surface-sunk/50",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "h-3 w-3 shrink-0 rounded-full",
                      p.tone ? TONE_BG[p.tone] : "bg-border-strong",
                    )}
                  />
                  <span className="w-20 shrink-0 text-sm tabular-nums text-ink-faint">
                    {p.ageMin}–{p.ageMax}
                  </span>
                  <span className="flex-1 text-[15px] font-medium text-ink">
                    {p.label ?? "—"}
                  </span>
                  {aktif && (
                    <span className="shrink-0 rounded-pill bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-ink">
                      {t("pro.nasib.now")}
                    </span>
                  )}
                </button>

                {dibuka && (
                  <CardBody className="space-y-3.5 border-t border-border-soft pt-4">
                    {p.rejeki && (
                      <p className="text-sm leading-relaxed text-ink-soft">{p.rejeki}</p>
                    )}
                    {p.saran && (
                      <div className="rounded-md bg-surface-sunk px-4 py-3 hb-sink">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">
                          Saran
                        </p>
                        <p className="text-sm leading-relaxed text-ink">{p.saran}</p>
                      </div>
                    )}
                  </CardBody>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
