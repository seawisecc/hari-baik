"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell, BelumDikonfigurasi, Bidang } from "../AuthShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { pesanAuth } from "@/lib/firebase/errors";

export default function LupaSandiPage() {
  const t = useT();
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [terkirim, setTerkirim] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <AuthShell
      title={t("auth.forgotTitle")}
      subtitle={t("auth.forgotSubtitle")}
      footer={
        <Link href="/login" className="font-medium text-ink underline underline-offset-2">
          {t("auth.backToLogin")}
        </Link>
      }
    >
      {!configured ? (
        <BelumDikonfigurasi />
      ) : terkirim ? (
        <div className="space-y-4">
          <Alert tone="success">{`${t("auth.forgotSent")} ${email}.`}</Alert>
          <p className="text-sm leading-relaxed text-ink-soft">
            Buka email itu dan ikuti tautannya. Kalau tidak ada di kotak masuk, periksa folder
            spam atau promosi.
          </p>
        </div>
      ) : (
        <form
          className="space-y-5"
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

          <Button type="submit" block size="lg" disabled={busy || !email}>
            {busy ? t("auth.forgotSending") : t("auth.forgotSend")}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
