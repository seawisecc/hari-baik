"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthShell, BelumDikonfigurasi, Bidang } from "../(auth)/AuthShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { InputSandi, Label } from "@/components/ui/Input";
import { useT } from "@/lib/content/LangProvider";
import { firebase, firebaseConfigured } from "@/lib/firebase/client";
import { pesanAuth } from "@/lib/firebase/errors";

/**
 * Penangan tautan dari email Firebase.
 *
 * Firebase mengirim satu URL untuk semua jenis tautan email, lalu menempelkan
 * `mode` dan `oobCode` di query-nya. Bawaannya URL itu ada di
 * `hari-baik-7e56c.firebaseapp.com`, domain yang tidak dikenali siapa pun yang
 * menerima emailnya, dan itu salah satu sebab email konfirmasi jatuh ke spam:
 * email yang mengaku dari Hari Baik tapi mengarah ke domain lain adalah pola
 * yang sama persis dengan phishing.
 *
 * Firebase Hosting melayani halaman itu sendiri di `/__/auth/action`. Aplikasi
 * ini di Vercel, jadi tidak ada yang melayaninya, dan memindahkan action URL
 * ke domain sendiri tanpa halaman ini akan membuat setiap tautan verifikasi
 * dan reset kata sandi berujung 404. Halaman inilah yang membuat pemindahan
 * itu mungkin.
 *
 * Yang ditangani hanya tiga mode yang benar-benar bisa dikirim aplikasi ini.
 * Mode lain, termasuk yang mungkin ditambahkan Firebase nanti, dijawab dengan
 * pesan yang jujur mengatakan tautannya tidak dikenali, bukan layar kosong.
 */
export default function AksiPage() {
  return (
    // useSearchParams membaca URL di browser, jadi bagian ini tidak bisa ikut
    // dirender di server. Tanpa batas Suspense, seluruh halaman ikut menunggu.
    <Suspense fallback={<Rangka />}>
      <Aksi />
    </Suspense>
  );
}

function Rangka({ children }: { children?: React.ReactNode }) {
  const t = useT();
  return <AuthShell title={t("action.title")}>{children ?? <Memuat />}</AuthShell>;
}

function Memuat() {
  const t = useT();
  return <p className="text-sm text-ink-faint">{t("common.loading")}</p>;
}

type Keadaan =
  | { fase: "memuat" }
  | { fase: "selesai"; pesan: string; tujuan: string; tombol: string }
  | { fase: "sandi"; email: string }
  | { fase: "gagal"; pesan: string };

function Aksi() {
  const t = useT();
  const params = useSearchParams();
  const mode = params.get("mode");
  const kode = params.get("oobCode");

  const [keadaan, setKeadaan] = useState<Keadaan>({ fase: "memuat" });

  useEffect(() => {
    if (!firebaseConfigured) return;
    let batal = false;

    void (async () => {
      if (!kode) {
        if (!batal) setKeadaan({ fase: "gagal", pesan: t("action.noCode") });
        return;
      }
      try {
        const { auth, fn } = await firebase();
        if (batal) return;

        if (mode === "verifyEmail") {
          await fn.applyActionCode(auth, kode);
          // Token yang sedang dipegang masih membawa emailVerified yang lama.
          // Tanpa penyegaran ini, orangnya menekan tombol lalu dikembalikan
          // ke layar verifikasi yang sama, seolah tidak terjadi apa-apa.
          await auth.currentUser?.reload();
          await auth.currentUser?.getIdToken(true);
          if (!batal) {
            setKeadaan({
              fase: "selesai",
              pesan: t("action.verified"),
              tujuan: auth.currentUser ? "/hari-ini" : "/login",
              tombol: auth.currentUser ? t("action.toApp") : t("auth.login"),
            });
          }
          return;
        }

        if (mode === "resetPassword") {
          // Kodenya diperiksa lebih dulu supaya alamat emailnya bisa
          // ditampilkan. Meminta orang mengetik sandi baru tanpa memberi tahu
          // untuk akun yang mana adalah cara mudah salah akun.
          const email = await fn.verifyPasswordResetCode(auth, kode);
          if (!batal) setKeadaan({ fase: "sandi", email });
          return;
        }

        if (mode === "recoverEmail") {
          await fn.applyActionCode(auth, kode);
          if (!batal) {
            setKeadaan({
              fase: "selesai",
              pesan: t("action.recovered"),
              tujuan: "/login",
              tombol: t("auth.login"),
            });
          }
          return;
        }

        if (!batal) setKeadaan({ fase: "gagal", pesan: t("action.unknownMode") });
      } catch (err) {
        if (!batal) setKeadaan({ fase: "gagal", pesan: pesanAuth(err) });
      }
    })();

    return () => {
      batal = true;
    };
  }, [mode, kode, t]);

  if (!firebaseConfigured) {
    return (
      <Rangka>
        <BelumDikonfigurasi />
      </Rangka>
    );
  }

  if (keadaan.fase === "memuat") return <Rangka />;

  if (keadaan.fase === "gagal") {
    return (
      <Rangka>
        <div className="space-y-5">
          <Alert tone="error">{keadaan.pesan}</Alert>
          <Link href="/login">
            <Button block size="lg" variant="surface">
              {t("auth.login")}
            </Button>
          </Link>
        </div>
      </Rangka>
    );
  }

  if (keadaan.fase === "selesai") {
    return (
      <Rangka>
        <div className="space-y-5">
          <Alert tone="success">{keadaan.pesan}</Alert>
          <Link href={keadaan.tujuan}>
            <Button block size="lg">
              {keadaan.tombol}
            </Button>
          </Link>
        </div>
      </Rangka>
    );
  }

  return <SandiBaru kode={kode!} email={keadaan.email} />;
}

/** Formulir sandi baru, dipakai setelah kode reset terbukti sah. */
function SandiBaru({ kode, email }: { kode: string; email: string }) {
  const t = useT();
  const [sandi, setSandi] = useState("");
  const [ulangi, setUlangi] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selesai, setSelesai] = useState(false);

  const tidakCocok = ulangi.length > 0 && sandi !== ulangi;
  const siap = sandi.length >= 6 && sandi === ulangi;

  if (selesai) {
    return (
      <Rangka>
        <div className="space-y-5">
          <Alert tone="success">{t("action.passwordChanged")}</Alert>
          <Link href="/login">
            <Button block size="lg">
              {t("auth.login")}
            </Button>
          </Link>
        </div>
      </Rangka>
    );
  }

  return (
    <Rangka>
      <form
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!siap) return;
          setError(null);
          setBusy(true);
          try {
            const { auth, fn } = await firebase();
            await fn.confirmPasswordReset(auth, kode, sandi);
            setSelesai(true);
          } catch (err) {
            setError(pesanAuth(err));
          } finally {
            setBusy(false);
          }
        }}
      >
        {error && <Alert tone="error">{error}</Alert>}

        <p className="text-sm text-ink-soft">{t("action.resetFor", { email })}</p>

        <Bidang
          label={<Label htmlFor="sandi">{t("auth.password")}</Label>}
          hint={t("auth.passwordHint")}
        >
          <InputSandi
            id="sandi"
            autoComplete="new-password"
            minLength={6}
            value={sandi}
            onChange={(e) => setSandi(e.target.value)}
            required
          />
        </Bidang>

        <Bidang
          label={<Label htmlFor="ulangi">{t("auth.passwordRepeat")}</Label>}
          error={tidakCocok ? t("auth.passwordMismatch") : undefined}
        >
          <InputSandi
            id="ulangi"
            autoComplete="new-password"
            value={ulangi}
            onChange={(e) => setUlangi(e.target.value)}
            required
          />
        </Bidang>

        <Button type="submit" block size="lg" disabled={busy || !siap}>
          {busy ? t("common.processing") : t("action.savePassword")}
        </Button>
      </form>
    </Rangka>
  );
}
