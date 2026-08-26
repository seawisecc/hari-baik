"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell, BelumDikonfigurasi, Bidang } from "../AuthShell";
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

  // Peringatan baru muncul setelah ada yang diketik, supaya tidak menegur
  // pengguna atas kolom yang belum sempat diisi.
  const tidakCocok = ulangi.length > 0 && password !== ulangi;
  const siap = email.length > 0 && password.length >= 6 && password === ulangi;

  return (
    <AuthShell
      title="Daftar"
      subtitle="Gratis 3 hari, tanpa kartu kredit."
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
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!siap) return;
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

          <Bidang label={<Label htmlFor="email">Email</Label>}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Bidang>

          <Bidang
            label={<Label htmlFor="password">Kata sandi</Label>}
            hint="Minimal 6 karakter."
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Bidang>

          <Bidang
            label={<Label htmlFor="ulangi">Ulangi kata sandi</Label>}
            error={tidakCocok ? "Kata sandi belum sama." : undefined}
          >
            <Input
              id="ulangi"
              type="password"
              autoComplete="new-password"
              value={ulangi}
              onChange={(e) => setUlangi(e.target.value)}
              required
            />
          </Bidang>

          <Button type="submit" block size="lg" disabled={busy || !siap}>
            {busy ? "Memproses…" : "Daftar"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
