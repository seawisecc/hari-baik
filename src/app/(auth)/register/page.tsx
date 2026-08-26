"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell, BelumDikonfigurasi } from "../AuthShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { pesanAuth } from "@/lib/firebase/errors";

export default function RegisterPage() {
  const { register, configured } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ulangi, setUlangi] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const cocok = password === ulangi;

  return (
    <AuthShell
      title="Daftar"
      subtitle="Gratis 3 hari. Tanpa kartu kredit."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-ink underline underline-offset-2">
            Masuk
          </Link>
        </>
      }
    >
      {!configured ? (
        <BelumDikonfigurasi />
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!cocok) return;
            setError(null);
            setBusy(true);
            try {
              await register(email, password);
              router.push("/verify-email");
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

          <div className="space-y-2">
            <Label htmlFor="password">Kata sandi</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-ink-faint">Minimal 6 karakter.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ulangi">Ulangi kata sandi</Label>
            <Input
              id="ulangi"
              type="password"
              autoComplete="new-password"
              value={ulangi}
              onChange={(e) => setUlangi(e.target.value)}
              required
            />
            {ulangi && !cocok && <p className="text-xs text-error">Kata sandi belum sama.</p>}
          </div>

          <Button type="submit" block disabled={busy || !cocok}>
            {busy ? "Memproses…" : "Daftar"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
