"use client";

import { CalendarPlus, Lock } from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useT } from "@/lib/content/LangProvider";
import { useUserData } from "@/lib/useUserData";

/** Layar kunci fitur Pro. `descKey` menjelaskan fitur apa yang terkunci. */
export function ProLocked({ titleKey, descKey }: { titleKey: string; descKey: string }) {
  const t = useT();

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader title={t(titleKey)} />

        <Card elevation={3} className="mx-auto max-w-lg">
          <CardHeader>
            <span className="mb-4 grid h-12 w-12 place-items-center rounded-pill bg-surface-sunk hb-sink">
              <Lock className="h-4.5 w-4.5 text-ink-faint" aria-hidden />
            </span>
            <CardTitle>{t("pro.lock.title")}</CardTitle>
            <p className="mt-1 text-sm text-ink-soft">{t("pro.lock.tagline")}</p>
          </CardHeader>
          <CardBody className="space-y-6">
            <p className="text-[15px] leading-relaxed text-ink-soft">{t(descKey)}</p>
            <Link href="/expired" className="block">
              <Button block>{t("pro.lock.cta")}</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
}

/** Ajakan mengisi tanggal lahir, dipakai semua halaman yang membutuhkannya. */
export function ButuhTanggalLahir({ title }: { title: string }) {
  const { editable } = useUserData();
  // Mode lokal: formnya ada di kalender. Sudah login: lewat onboarding.
  const href = editable ? "/kalender" : "/onboarding";

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader title={title} />

        <Card elevation={3} className="mx-auto max-w-lg">
          <CardHeader>
            <span className="mb-4 grid h-12 w-12 place-items-center rounded-pill bg-accent-wash hb-raise-1">
              <CalendarPlus className="h-4.5 w-4.5 text-accent-deep" aria-hidden />
            </span>
            <CardTitle>Tanggal lahir belum diisi</CardTitle>
          </CardHeader>
          <CardBody className="space-y-6">
            <p className="text-[15px] leading-relaxed text-ink-soft">
              Kalender siklusmu dihitung dari tanggal lahir, jadi itu harus diisi lebih dulu.
            </p>
            <Link href={href} className="block">
              <Button block>Isi tanggal lahir</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
}

/** Placeholder saat data masih dimuat. */
export function Memuat() {
  return (
    <PageContainer>
      <div className="py-20 text-center text-sm text-ink-faint">Memuat…</div>
    </PageContainer>
  );
}
