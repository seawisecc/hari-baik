"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useT } from "@/lib/content/LangProvider";

/** Layar kunci untuk fitur Pro. `descKey` menjelaskan fitur yang dikunci. */
export function ProLocked({ titleKey, descKey }: { titleKey: string; descKey: string }) {
  const t = useT();
  return (
    <main className="mx-auto max-w-md space-y-6 px-6 py-10">
      <PageHeader title={t(titleKey)} />
      <Card elevation={3}>
        <CardHeader>
          <span className="mb-3 grid h-11 w-11 place-items-center rounded-pill bg-surface-sunk hb-sink">
            <Lock className="h-4 w-4 text-ink-faint" aria-hidden />
          </span>
          <CardTitle>{t("pro.lock.title")}</CardTitle>
          <p className="mt-1 text-sm text-ink-soft">{t("pro.lock.tagline")}</p>
        </CardHeader>
        <CardBody className="space-y-5">
          <p className="text-[15px] leading-relaxed text-ink-soft">{t(descKey)}</p>
          <Link href="/expired" className="block">
            <Button block>{t("pro.lock.cta")}</Button>
          </Link>
        </CardBody>
      </Card>
    </main>
  );
}

/** Ajakan mengisi tanggal lahir, dipakai semua halaman yang butuh itu. */
export function ButuhTanggalLahir({ title }: { title: string }) {
  return (
    <main className="mx-auto max-w-md space-y-6 px-6 py-10">
      <PageHeader title={title} />
      <Card>
        <CardBody className="pt-6">
          <p className="text-[15px] leading-relaxed text-ink-soft">
            Isi tanggal lahirmu dulu supaya perhitungannya bisa dijalankan.
          </p>
          <Link href="/kalender" className="mt-4 block">
            <Button block>Ke kalender</Button>
          </Link>
        </CardBody>
      </Card>
    </main>
  );
}

export function Memuat() {
  return <main className="px-6 py-16 text-center text-ink-faint">Memuat…</main>;
}
