"use client";

import { WatakCard } from "@/components/WatakCard";
import { ButuhTanggalLahir, Memuat } from "@/components/ProGate";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPancasuda, getPangarasan } from "@/lib/content/kepribadian";
import { getWeton } from "@/lib/content/weton";
import { useUserData } from "@/lib/useUserData";
import { pancawaraName, saptawaraName, uripHari } from "@/lib/wariga";

export default function KepribadianPage() {
  const { birthDate, loading } = useUserData();

  if (loading) return <Memuat />;

  if (!birthDate) return <ButuhTanggalLahir title="Kepribadian" />;

  const sapta = saptawaraName(birthDate);
  const panca = pancawaraName(birthDate);
  const weton = getWeton(sapta, panca);
  const pangarasan = weton ? getPangarasan(weton.pangarasan) : null;
  const pancasuda = weton ? getPancasuda(weton.pancasuda) : null;

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <PageHeader title="Kepribadian" subtitle="Dibaca dari weton kelahiranmu" />

      <Card elevation={3}>
        <CardHeader>
          <p className="text-sm text-ink-faint">Weton lahir</p>
          <CardTitle className="mt-1">
            {sapta} {panca}
          </CardTitle>
          <p className="mt-1 text-sm text-ink-soft">Urip {uripHari(birthDate)}</p>
        </CardHeader>
        {weton && (
          <CardBody>
            <p className="text-[15px] leading-relaxed text-ink-soft">
              <strong className="text-ink">{weton.energi}</strong> — {weton.tema}
            </p>
          </CardBody>
        )}
      </Card>

      {pangarasan && <WatakCard label="Pangarasan — cara kamu bergerak" profil={pangarasan} />}
      {pancasuda && <WatakCard label="Pancasuda — bekal bawaan" profil={pancasuda} />}
    </main>
  );
}
