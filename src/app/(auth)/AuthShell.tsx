"use client";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Wordmark } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/**
 * Kerangka halaman autentikasi.
 *
 * Kartu dijaga sempit dan dipusatkan secara vertikal supaya fokus tetap pada
 * satu tindakan; tidak ada navigasi aplikasi di sini karena pengguna belum
 * punya tempat untuk dituju.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-14">
      <div className="mb-9 flex items-center justify-between gap-4">
        <Wordmark size={28} textClassName="text-2xl" />
        <ThemeToggle compact />
      </div>

      <Card elevation={3}>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {subtitle && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{subtitle}</p>}
        </CardHeader>
        <CardBody className="pb-7">{children}</CardBody>
      </Card>

      {footer && <div className="mt-7 text-center text-sm text-ink-soft">{footer}</div>}
    </main>
  );
}

/** Pesan yang muncul kalau .env.local belum diisi, supaya tidak terlihat rusak. */
export function BelumDikonfigurasi() {
  return (
    <div className="rounded-md bg-warning/25 px-5 py-4 text-sm leading-relaxed text-ink">
      Firebase belum dikonfigurasi. Salin <code>.env.example</code> ke <code>.env.local</code>,
      isi kredensial project Firebase-mu, lalu jalankan ulang dev server.
    </div>
  );
}

/** Satu bidang isian dengan label dan keterangan, jaraknya seragam. */
export function Bidang({
  label,
  hint,
  error,
  children,
}: {
  label: React.ReactNode;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      {label}
      {children}
      {error ? (
        <p className="text-xs text-error">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}
