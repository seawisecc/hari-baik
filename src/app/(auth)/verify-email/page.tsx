"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "../AuthShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";

export default function VerifyEmailPage() {
  const t = useT();
  const { user, resendVerification, refreshUser, logout } = useAuth();
  const router = useRouter();
  const [terkirim, setTerkirim] = useState(false);
  const [belumTerverifikasi, setBelumTerverifikasi] = useState(false);
  const [busy, setBusy] = useState<"cek" | "kirim" | null>(null);

  return (
    <AuthShell
      title={t("verify.title")}
      subtitle={
        user?.email ? t("verify.subtitleWith", { email: user.email }) : t("verify.subtitle")
      }
      footer={
        <button
          onClick={async () => {
            await logout();
            router.push("/");
          }}
          className="underline underline-offset-2 hover:text-ink"
        >
          {t("nav.logout")}
        </button>
      }
    >
      <div className="space-y-4">
        {terkirim && <Alert tone="success">{t("verify.resent")}</Alert>}
        {belumTerverifikasi && (
          <Alert tone="warning">
            Emailmu belum terverifikasi. Buka tautan di email lalu coba lagi.
          </Alert>
        )}

        <Button
          block
          disabled={busy !== null}
          onClick={async () => {
            setBusy("cek");
            setBelumTerverifikasi(false);
            try {
              // Status verifikasi tersimpan di token, jadi harus diambil ulang
              // dari server: tanpa ini nilainya tetap yang lama selamanya.
              const verified = await refreshUser();
              if (verified) router.replace("/onboarding");
              else setBelumTerverifikasi(true);
            } finally {
              setBusy(null);
            }
          }}
        >
          {busy === "cek" ? t("verify.checking") : t("verify.done")}
        </Button>

        <Button
          variant="surface"
          block
          disabled={busy !== null}
          onClick={async () => {
            setBusy("kirim");
            setBelumTerverifikasi(false);
            try {
              await resendVerification();
              setTerkirim(true);
            } finally {
              setBusy(null);
            }
          }}
        >
          {busy === "kirim" ? t("auth.forgotSending") : t("verify.resend")}
        </Button>

        <p className="text-xs leading-relaxed text-ink-faint">
          Tidak ada di kotak masuk? Periksa folder spam atau promosi.
        </p>
      </div>
    </AuthShell>
  );
}
