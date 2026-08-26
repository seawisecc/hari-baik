"use client";

import { Lock, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DaftarHarga } from "@/components/DaftarHarga";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Wordmark } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ADMIN_WA, ADMIN_WA_DISPLAY } from "@/components/WhatsAppCard";
import { useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { rupiah } from "@/lib/harga";

export default function ExpiredPage() {
  const t = useT();
  const router = useRouter();
  const { profile, logout } = useAuth();
  const [dipilih, setDipilih] = useState<{ nama: string; harga: number } | null>(null);

  // Paket yang diklik ikut ke pesan WhatsApp, jadi admin langsung tahu
  // yang dimaksud tanpa perlu bertanya lagi.
  const baris = [
    "Halo, saya ingin berlangganan Hari Baik.",
    dipilih ? `Paket: ${dipilih.nama} (${rupiah(dipilih.harga)})` : null,
    `Nama: ${profile?.nama || "-"}`,
    `Email: ${profile?.email ?? "-"}`,
  ].filter(Boolean);

  const waHref = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(baris.join("\n"))}`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-14">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Wordmark size={28} textClassName="text-2xl" />
        <ThemeToggle compact />
      </div>

      <Card elevation={3}>
        <CardHeader>
          <span className="mb-4 grid h-12 w-12 place-items-center rounded-pill bg-surface-sunk hb-sink">
            <Lock className="h-5 w-5 text-ink-faint" aria-hidden />
          </span>
          <CardTitle className="text-2xl">{t("expired.title")}</CardTitle>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{t("expired.desc")}</p>
        </CardHeader>

        <CardBody className="space-y-8 pb-7">
          <DaftarHarga onPilih={(nama, harga) => setDipilih({ nama, harga })} />

          <div className="space-y-4 border-t border-border-soft pt-6">
            <div>
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                {t("expired.howTo")}
              </p>
              <ol className="space-y-2 text-sm leading-relaxed text-ink-soft">
                {["expired.step1", "expired.step2", "expired.step3"].map((k, i) => (
                  <li key={k} className="flex gap-2.5">
                    <span className="font-semibold text-ink">{i + 1}.</span>
                    {t(k)}
                  </li>
                ))}
              </ol>
            </div>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-13 w-full items-center justify-center gap-2 rounded-pill bg-accent text-[15px] font-medium text-accent-ink hb-raise-2 transition-colors hover:bg-accent-strong"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              {t("expired.chatAdmin")} {ADMIN_WA_DISPLAY}
            </a>

            <p className="text-center text-xs leading-relaxed text-ink-faint">
              {t("expired.manualNote")}
            </p>
          </div>
        </CardBody>
      </Card>

      <button
        onClick={async () => {
          await logout();
          router.push("/");
        }}
        className="mt-6 text-center text-sm text-ink-faint underline underline-offset-2 hover:text-ink-soft"
      >
        {t("nav.logout")}
      </button>
    </main>
  );
}
