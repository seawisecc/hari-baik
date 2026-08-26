"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { PageContainer } from "@/components/shell/AppShell";
import { PageHeader, Wisdom } from "@/components/ui/PageHeader";
import { useT } from "@/lib/content/LangProvider";
import { hitungMaknaNama, UNSUR_TONE, type MaknaNama } from "@/lib/content/nama";
import { cn } from "@/lib/cn";

const TONE_BG: Record<string, string> = {
  accent: "bg-accent",
  guru: "bg-guru",
  ratu: "bg-ratu",
  lara: "bg-lara",
  pati: "bg-pati",
};

export default function NamaMaknaPage() {
  const t = useT();
  const [nama, setNama] = useState("");
  const [hasil, setHasil] = useState<MaknaNama | null>(null);

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader title={t("pro.nama.title")} />

        <Card elevation={2}>
          <CardBody className="pt-6">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (nama.trim()) setHasil(hitungMaknaNama(nama));
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="nama">{t("pro.nama.input")}</Label>
                <Input
                  id="nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder={t("pro.nama.input")}
                  required
                />
              </div>
              <Button type="submit" block disabled={!nama.trim()}>
                {t("pro.nama.cta")}
              </Button>
            </form>
          </CardBody>
        </Card>

        {hasil && (
          <>
            <Card elevation={3}>
              <CardHeader>
                <p className="text-sm text-ink-faint">{t("pro.nama.unsur")}</p>
                <div className="mt-2 flex items-center gap-3">
                  <span
                    aria-hidden
                    className={cn(
                      "h-9 w-9 rounded-pill hb-raise-1",
                      TONE_BG[UNSUR_TONE[hasil.unsur]],
                    )}
                  />
                  <div>
                    <CardTitle>{hasil.unsur}</CardTitle>
                    <p className="text-sm text-ink-soft">
                      Total {hasil.total} · sisa {hasil.sisa}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-[15px] leading-relaxed text-ink-soft">{hasil.interp}</p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("pro.nama.breakdown")}</CardTitle>
                <p className="mt-1 text-sm text-ink-faint">
                  Hanya konsonan yang dihitung: vokal tidak punya nilai aksara sendiri.
                </p>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-2">
                  {hasil.rincian.map((r, i) => (
                    <span
                      key={`${r.huruf}-${i}`}
                      className="rounded-md bg-surface-sunk px-3 py-2 text-center hb-sink-sm"
                    >
                      <span className="block text-[13px] font-medium text-ink">{r.aksara}</span>
                      <span className="block text-[11px] text-ink-faint">{r.value}</span>
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm text-ink-soft">
                  Jumlah nilai aksara: <strong className="text-ink">{hasil.total}</strong>
                </p>
              </CardBody>
            </Card>

            <Wisdom>{t("wisdom.name")}</Wisdom>
          </>
        )}
      </div>
    </PageContainer>
  );
}
