"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell, BelumDikonfigurasi, Bidang } from "../AuthShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { pesanAuth } from "@/lib/firebase/errors";

export default function LoginPage() {
  const t = useT();
  const { login, configured } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <AuthShell
      title={t("auth.login")}
      footer={
        <>
          {t("auth.noAccount")}{" "}
          <Link href="/register" className="font-medium text-ink underline underline-offset-2">
            {t("auth.register")}
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

          <Bidang label={<Label htmlFor="email">{t("auth.email")}</Label>}>
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
            label={
              <div className="flex items-baseline justify-between gap-3">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Link
                  href="/lupa-sandi"
                  className="text-xs text-ink-faint underline underline-offset-2 hover:text-ink-soft"
                >
                  {t("auth.forgot")}
                </Link>
              </div>
            }
          >
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Bidang>

          <Button type="submit" block size="lg" disabled={busy || !email || !password}>
            {busy ? t("common.processing") : t("auth.login")}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
