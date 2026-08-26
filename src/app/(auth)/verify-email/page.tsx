"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "../AuthShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/firebase/AuthProvider";

export default function VerifyEmailPage() {
  const { user, resendVerification, refreshUser, logout } = useAuth();
  const router = useRouter();
  const [terkirim, setTerkirim] = useState(false);
  const [belumTerverifikasi, setBelumTerverifikasi] = useState(false);
  const [busy, setBusy] = useState<"cek" | "kirim" | null>(null);

  return (
    <AuthShell
      title="Cek emailmu"
      subtitle={
        user?.email
          ? `Kami mengirim tautan verifikasi ke ${user.email}. Buka tautan itu, lalu kembali ke sini.`
          : "Kami mengirim tautan verifikasi ke emailmu."
      }
      footer={
        <button
          onClick={async () => {
            await logout();
            router.push("/");
          }}
          className="underline underline-offset-2 hover:text-ink"
        >
          Keluar
        </button>
      }
    >
      <div className="space-y-4">
        {terkirim && <Alert tone="success">Tautan verifikasi dikirim ulang.</Alert>}
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
          {busy === "cek" ? "Memeriksa…" : "Saya sudah verifikasi"}
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
          {busy === "kirim" ? "Mengirim…" : "Kirim ulang tautan"}
        </Button>

        <p className="text-xs leading-relaxed text-ink-faint">
          Tidak ada di kotak masuk? Periksa folder spam atau promosi.
        </p>
      </div>
    </AuthShell>
  );
}
