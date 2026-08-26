"use client";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <p className="font-heading text-2xl font-bold italic text-ink">Hari Baik</p>
        <ThemeToggle />
      </div>

      <Card elevation={3}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {subtitle && (
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{subtitle}</p>
          )}
        </CardHeader>
        <CardBody>{children}</CardBody>
      </Card>

      {footer && <div className="mt-6 text-center text-sm text-ink-soft">{footer}</div>}
    </main>
  );
}

/** Pesan yang muncul kalau .env.local belum diisi — supaya tidak terlihat "rusak". */
export function BelumDikonfigurasi() {
  return (
    <div className="rounded-md bg-warning/25 px-5 py-4 text-sm leading-relaxed text-ink">
      Firebase belum dikonfigurasi. Salin <code>.env.example</code> ke <code>.env.local</code>,
      isi kredensial project Firebase-mu, lalu jalankan ulang dev server.
    </div>
  );
}
