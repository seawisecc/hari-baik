"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell, BelumDikonfigurasi } from "../AuthShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { pesanAuth } from "@/lib/firebase/errors";

export default function LupaSandiPage() {
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [terkirim, setTerkirim] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <AuthShell
      title="Lupa kata sandi"
      subtitle="Masukkan emailmu, kami kirimkan tautan untuk membuat kata sandi baru."
      footer={
        <Link href="/login" className="font-medium text-ink underline underline-offset-2">
          Kembali ke halaman masuk
        </Link>
      }
    >
      {!configured ? (
        <BelumDikonfigurasi />
      ) : terkirim ? (
        <div className="space-y-4">
          <Alert tone="success">Tautan sudah dikirim ke {email}.</Alert>
          <p className="text-sm leading-relaxed text-ink-soft">
            Buka email itu dan ikuti tautannya. Kalau tidak ada di kotak masuk, periksa folder
            spam atau promosi.
          </p>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setBusy(true);
            try {
              await resetPassword(email);
              setTerkirim(true);
            } catch (err) {
              setError(pesanAuth(err));
            } finally {
              setBusy(false);
            }
          }}
        >
          {error && <Alert tone="error">{error}</Alert>}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" block disabled={busy || !email}>
            {busy ? "Mengirim…" : "Kirim tautan"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
