"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "../AuthShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/firebase/AuthProvider";

export default function VerifyEmailPage() {
  const { user, resendVerification, logout } = useAuth();
  const [terkirim, setTerkirim] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <AuthShell
      title="Cek emailmu"
      subtitle={
        user?.email
          ? `Kami sudah mengirim tautan verifikasi ke ${user.email}. Klik tautan itu, lalu lanjut.`
          : "Kami sudah mengirim tautan verifikasi ke emailmu."
      }
      footer={
        <button
          onClick={() => logout()}
          className="underline underline-offset-2 hover:text-ink"
        >
          Keluar
        </button>
      }
    >
      <div className="space-y-4">
        {terkirim && <Alert tone="success">Tautan verifikasi dikirim ulang.</Alert>}

        <Link href="/onboarding" className="block">
          <Button block>Sudah saya verifikasi</Button>
        </Link>

        <Button
          variant="surface"
          block
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await resendVerification();
              setTerkirim(true);
            } finally {
              setBusy(false);
            }
          }}
        >
          Kirim ulang tautan
        </Button>

        <p className="text-xs leading-relaxed text-ink-faint">
          Tidak ada di kotak masuk? Periksa folder spam atau promosi.
        </p>
      </div>
    </AuthShell>
  );
}
