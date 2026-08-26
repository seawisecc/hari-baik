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

export default function LoginPage() {
  const { login, configured } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <AuthShell
      title="Masuk"
      footer={
        <>
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-ink underline underline-offset-2">
            Daftar
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
            setError(null);
            setBusy(true);
            try {
              await login(email, password);
              router.push("/hari-ini");
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" block disabled={busy}>
            {busy ? "Memproses…" : "Masuk"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
