"use client";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { WhatsAppCard } from "@/components/WhatsAppCard";
import { useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";

export default function ExpiredPage() {
  const t = useT();
  const { profile } = useAuth();

  return (
    <main className="mx-auto max-w-md space-y-6 px-6 py-10">
      <PageHeader title={t("expired.title")} />

      <Card elevation={3}>
        <CardHeader>
          <CardTitle>Rp 150.000 / tahun</CardTitle>
          <p className="mt-1 text-sm text-ink-soft">≈ Rp 12.500 per bulan</p>
        </CardHeader>
        <CardBody>
          <p className="text-[15px] leading-relaxed text-ink-soft">{t("expired.desc")}</p>
        </CardBody>
      </Card>

      <WhatsAppCard
        pesan={
          profile
            ? `Halo, saya ingin mengaktifkan langganan Hari Baik.\nNama: ${profile.nama || "-"}\nEmail: ${profile.email}`
            : "Halo, saya ingin mengaktifkan langganan Hari Baik."
        }
      />

      <p className="text-center text-xs leading-relaxed text-ink-faint">
        Aktivasi dilakukan manual oleh admin setelah pembayaran dikonfirmasi.
      </p>
    </main>
  );
}
