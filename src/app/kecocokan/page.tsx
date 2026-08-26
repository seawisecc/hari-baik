"use client";

import { useState } from "react";
import { ButuhTanggalLahir, Memuat, ProLocked } from "@/components/ProGate";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { PageContainer } from "@/components/shell/AppShell";
import { PageHeader, Wisdom } from "@/components/ui/PageHeader";
import { useT } from "@/lib/content/LangProvider";
import { hitungPetemon, type HasilPetemon, type UripPetemon } from "@/lib/content/petemon";
import { useUserData } from "@/lib/useUserData";
import { toDateString } from "@/lib/wariga";

function RincianUrip({ label, u }: { label: string; u: UripPetemon }) {
  return (
    <div className="rounded-md bg-surface-sunk px-5 py-4 hb-sink">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-1.5 text-[15px] font-medium text-ink">
        {u.saptaWara} {u.pancaWara}
      </p>
      <p className="mt-1 text-[13px] text-ink-soft">
        {u.saptaUrip} + {u.pancaUrip} + {u.sadUrip} ({u.sadWara}) ={" "}
        <strong className="text-ink">{u.totalUrip}</strong>
      </p>
    </div>
  );
}

export default function KecocokanPage() {
  const t = useT();
  const { birthDate, access, loading } = useUserData();
  const today = toDateString(new Date());
  const [pasangan, setPasangan] = useState("");
  const [hasil, setHasil] = useState<HasilPetemon | null>(null);

  if (loading) return <Memuat />;
  if (!access.isPro) {
    return <ProLocked titleKey="pro.petemon.title" descKey="pro.lock.desc.petemon" />;
  }
  if (!birthDate) return <ButuhTanggalLahir title="Kecocokan" />;

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader title={t("pro.petemon.title")} />

        <Card elevation={2}>
          <CardBody className="pt-6">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (pasangan) setHasil(hitungPetemon(birthDate, pasangan));
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="pasangan">{t("pro.petemon.input")}</Label>
                <Input
                  id="pasangan"
                  type="date"
                  max={today}
                  value={pasangan}
                  onChange={(e) => setPasangan(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" block disabled={!pasangan}>
                {t("pro.petemon.cta")}
              </Button>
            </form>
          </CardBody>
        </Card>

        {hasil && (
          <>
            <Card elevation={3}>
              <CardHeader>
                <p className="text-sm text-ink-faint">{t("pro.petemon.result")}</p>
                <CardTitle className="mt-1">
                  {hasil.panca.name} · {hasil.sad.name}
                </CardTitle>
                <p className="mt-1 text-sm text-ink-soft">
                  Total urip {hasil.total} · sisa 5 = {hasil.sisa5} · sisa 16 = {hasil.sisa16}
                </p>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">
                    Pancapetemon — {hasil.panca.name}
                  </p>
                  <p className="text-[15px] leading-relaxed text-ink-soft">
                    {hasil.panca.interp}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">
                    Sadpetemon — {hasil.sad.name}
                  </p>
                  <p className="text-[15px] leading-relaxed text-ink-soft">
                    {hasil.sad.interp}
                  </p>
                </div>
              </CardBody>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <RincianUrip label="Kamu" u={hasil.orang1} />
              <RincianUrip label="Pasangan" u={hasil.orang2} />
            </div>

            <Wisdom>{t("wisdom.petemon")}</Wisdom>
          </>
        )}
      </div>
    </PageContainer>
  );
}
