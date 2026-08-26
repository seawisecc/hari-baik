"use client";

import { WatakCard } from "@/components/WatakCard";
import { ButuhTanggalLahir, Memuat } from "@/components/ProGate";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageContainer } from "@/components/shell/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPancasuda, getPangarasan } from "@/lib/content/kepribadian";
import { useT } from "@/lib/content/LangProvider";
import { getWeton } from "@/lib/content/weton";
import { useUserData } from "@/lib/useUserData";
import { pancawaraName, saptawaraName, uripHari } from "@/lib/wariga";

export default function KepribadianPage() {
  const t = useT();
  const { birthDate, loading } = useUserData();

  if (loading) return <Memuat />;

  if (!birthDate) return <ButuhTanggalLahir title={t("traits.title")} />;

  const sapta = saptawaraName(birthDate);
  const panca = pancawaraName(birthDate);
  const weton = getWeton(sapta, panca);
  const pangarasan = weton ? getPangarasan(weton.pangarasan) : null;
  const pancasuda = weton ? getPancasuda(weton.pancasuda) : null;

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader title={t("traits.title")} subtitle={t("traits.subtitle")} />

        <Card elevation={3}>
          <CardHeader>
            <p className="text-sm text-ink-faint">{t("traits.birthWeton")}</p>
            <CardTitle className="mt-1">
              {sapta} {panca}
            </CardTitle>
            <p className="mt-1 text-sm text-ink-soft">Urip {uripHari(birthDate)}</p>
          </CardHeader>
          {weton && (
            <CardBody>
              <p className="text-[15px] leading-relaxed text-ink-soft">
                <strong className="text-ink">{weton.energi}</strong>
                {" · "}
                {weton.tema}
              </p>
            </CardBody>
          )}
        </Card>

        {pangarasan && <WatakCard label={t("traits.pangarasan")} profil={pangarasan} />}
        {pancasuda && <WatakCard label={t("traits.pancasuda")} profil={pancasuda} />}
      </div>
    </PageContainer>
  );
}
