"use client";

import { Wordmark } from "@/components/ui/Logo";
import { Lock, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ADMIN_WA, ADMIN_WA_DISPLAY } from "@/components/WhatsAppCard";
import { useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";

export default function ExpiredPage() {
  const t = useT();
  const router = useRouter();
  const { profile, logout } = useAuth();

  const pesan = [
    "Halo, saya ingin berlangganan Hari Baik.",
    `Nama: ${profile?.nama || "-"}`,
    `Email: ${profile?.email ?? "-"}`,
  ].join("\n");

  const waHref = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(pesan)}`;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Wordmark size={28} textClassName="text-2xl" />
        <ThemeToggle />
      </div>

      <Card elevation={3}>
        <CardHeader>
          <span className="mb-4 grid h-12 w-12 place-items-center rounded-pill bg-surface-sunk hb-sink">
            <Lock className="h-5 w-5 text-ink-faint" aria-hidden />
          </span>
          <CardTitle>{t("expired.title")}</CardTitle>
          <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">
            {t("expired.desc")}
          </p>
        </CardHeader>

        <CardBody className="space-y-6">
          <div className="rounded-md bg-surface-sunk px-6 py-5 text-center hb-sink">
            <p className="font-heading text-3xl font-bold text-ink">Rp 150.000</p>
            <p className="mt-1 text-sm text-ink-soft">per tahun</p>
            <p className="mt-0.5 text-xs text-ink-faint">setara Rp 12.500 per bulan</p>
          </div>

          <div>
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
              Cara berlangganan
            </p>
            <ol className="space-y-2 text-sm leading-relaxed text-ink-soft">
              <li className="flex gap-2.5">
                <span className="font-semibold text-ink">1.</span>
                Hubungi admin lewat WhatsApp di nomor di bawah.
              </li>
              <li className="flex gap-2.5">
                <span className="font-semibold text-ink">2.</span>
                Lakukan pembayaran sesuai petunjuk admin.
              </li>
              <li className="flex gap-2.5">
                <span className="font-semibold text-ink">3.</span>
                Akunmu diaktifkan, dan seluruh fitur langsung terbuka lagi.
              </li>
            </ol>
          </div>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-13 w-full items-center justify-center gap-2 rounded-pill bg-accent text-[15px] font-medium text-accent-ink hb-raise-2 transition-colors hover:bg-accent-strong"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Chat admin {ADMIN_WA_DISPLAY}
          </a>

          <p className="text-center text-xs leading-relaxed text-ink-faint">
            Aktivasi dilakukan manual oleh admin setelah pembayaran dikonfirmasi.
          </p>
        </CardBody>
      </Card>

      <button
        onClick={async () => {
          await logout();
          router.push("/");
        }}
        className="mt-6 text-center text-sm text-ink-faint underline underline-offset-2 hover:text-ink-soft"
      >
        Keluar
      </button>
    </main>
  );
}
