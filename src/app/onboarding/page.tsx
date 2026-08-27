"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Wordmark } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Bidang } from "@/app/(auth)/AuthShell";
import { uripPetemon } from "@/lib/content/petemon";
import { useLang, useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { perbaruiProfil } from "@/lib/firebase/client";
import { tanggalPanjang } from "@/lib/tanggal";
import {
  getSadwara,
  pancawaraName,
  saptawaraName,
  toDateString,
  uripHari,
  wukuName,
} from "@/lib/wariga";

export default function OnboardingPage() {
  const t = useT();
  const { lang } = useLang();
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const today = toDateString(new Date());

  const [nama, setNama] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /**
   * Langkah kedua: tanggalnya dibacakan kembali sebelum disimpan.
   *
   * Tanggal lahir hanya bisa diisi sekali; sesudah itu terkunci di Firestore
   * Rules dan hanya admin yang bisa memperbaikinya. Karena itu satu-satunya
   * kesempatan menangkap salah ketik ada di sini, dan pratinjau pasif saja
   * tidak cukup: orang menekan tombol simpan tanpa membacanya.
   */
  const [konfirmasi, setKonfirmasi] = useState(false);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center text-sm text-ink-faint">
        {t("common.loading")}
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <Card>
          <CardBody className="pt-6">
            <p className="text-[15px] text-ink-soft">{t("auth.notSignedIn")}</p>
            <Button className="mt-5" block onClick={() => router.push("/login")}>
              {t("auth.toLogin")}
            </Button>
          </CardBody>
        </Card>
      </main>
    );
  }

  // Tanggal lahir yang sudah terisi ikut menutup halaman ini, bukan hanya
  // penanda onboardingComplete. Rules menolak tanggal kedua, jadi tanpa ini
  // form-nya terlihat bisa diisi lagi lalu gagal saat disimpan.
  if (profile?.onboardingComplete || profile?.tanggalLahir) {
    router.replace("/hari-ini");
    return null;
  }

  const siap = nama.trim().length > 0 && tanggalLahir.length > 0;

  const simpan = async () => {
    setError(null);
    setBusy(true);
    try {
      const petemon = uripPetemon(tanggalLahir);
      await perbaruiProfil(user.uid, {
        nama: nama.trim(),
        tanggalLahir,
        phoneNumber: phone.trim() || null,
        onboardingComplete: true,
        saptaWaraLahir: saptawaraName(tanggalLahir),
        pancaWaraLahir: pancawaraName(tanggalLahir),
        sadWaraLahir: getSadwara(tanggalLahir),
        wukuLahir: wukuName(tanggalLahir),
        uripLahir: uripHari(tanggalLahir),
        uripPetemonLahir: petemon.totalUrip,
      });
      router.push("/hari-ini");
    } catch {
      setError(t("common.saveFailed"));
      setKonfirmasi(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-14">
      <div className="mb-9 flex items-center justify-between gap-4">
        <Wordmark size={28} textClassName="text-2xl" />
        <ThemeToggle compact />
      </div>

      <Card elevation={3}>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">
            {konfirmasi ? t("onboarding.confirmTitle") : t("onboarding.title")}
          </CardTitle>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {konfirmasi ? t("onboarding.confirmDesc") : t("onboarding.subtitle")}
          </p>
        </CardHeader>

        <CardBody className="pb-7">
          {konfirmasi ? (
            <div className="space-y-5">
              {error && <Alert tone="error">{error}</Alert>}

              <div className="space-y-4 rounded-md bg-surface-sunk px-5 py-5 hb-sink">
                <Baris label={t("onboarding.fullName")} nilai={nama.trim()} />
                <Baris
                  label={t("onboarding.birthDate")}
                  nilai={tanggalPanjang(tanggalLahir, lang)}
                  besar
                />
                <Baris
                  label={t("onboarding.yourBirthDay")}
                  nilai={`${saptawaraName(tanggalLahir)} ${pancawaraName(tanggalLahir)}`}
                  keterangan={`Wuku ${wukuName(tanggalLahir)} · Urip ${uripHari(tanggalLahir)}`}
                />
              </div>

              <Alert tone="warning">{t("onboarding.lockWarning")}</Alert>

              <div className="space-y-2.5">
                <Button block size="lg" disabled={busy} onClick={simpan}>
                  {busy ? t("common.saving") : t("onboarding.confirmYes")}
                </Button>
                <Button
                  block
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    setError(null);
                    setKonfirmasi(false);
                  }}
                >
                  {t("onboarding.fix")}
                </Button>
              </div>
            </div>
          ) : (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (!siap) return;
                setError(null);
                setKonfirmasi(true);
              }}
            >
              {error && <Alert tone="error">{error}</Alert>}

              <Bidang label={<Label htmlFor="nama">{t("onboarding.fullName")}</Label>}>
                <Input
                  id="nama"
                  autoComplete="name"
                  maxLength={120}
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  required
                />
              </Bidang>

              <Bidang
                label={<Label htmlFor="lahir">{t("onboarding.birthDate")}</Label>}
                hint={t("onboarding.birthHint")}
              >
                <Input
                  id="lahir"
                  type="date"
                  max={today}
                  value={tanggalLahir}
                  onChange={(e) => setTanggalLahir(e.target.value)}
                  required
                />
              </Bidang>

              {/* Pratinjau langsung: kalau wetonnya terasa asing, kemungkinan
                  tanggalnya salah ketik, dan itu ketahuan sebelum disimpan. */}
              {tanggalLahir && (
                <div className="rounded-md bg-surface-sunk px-5 py-4 hb-sink">
                  <p className="text-[11px] uppercase tracking-wide text-ink-faint">
                    {t("onboarding.yourBirthDay")}
                  </p>
                  <p className="mt-1 font-heading text-xl font-semibold text-ink">
                    {saptawaraName(tanggalLahir)} {pancawaraName(tanggalLahir)}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    Wuku {wukuName(tanggalLahir)} · Urip {uripHari(tanggalLahir)}
                  </p>
                </div>
              )}

              <Bidang
                label={
                  <Label htmlFor="phone">
                    {t("onboarding.whatsapp")}{" "}
                    <span className="font-normal text-ink-faint">({t("common.optional")})</span>
                  </Label>
                }
                hint={t("onboarding.whatsappHint")}
              >
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => {
                    const bersih = e.target.value.replace(/[^0-9+]/g, "");
                    if (bersih.length <= 15) setPhone(bersih);
                  }}
                />
              </Bidang>

              <Button type="submit" block size="lg" disabled={!siap}>
                {t("onboarding.continue")}
              </Button>
            </form>
          )}
        </CardBody>
      </Card>
    </main>
  );
}

/** Satu baris ringkasan di layar konfirmasi. */
function Baris({
  label,
  nilai,
  keterangan,
  besar = false,
}: {
  label: string;
  nilai: string;
  keterangan?: string;
  besar?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-ink-faint">{label}</p>
      <p
        className={
          besar
            ? "mt-1 font-heading text-xl font-semibold text-ink"
            : "mt-0.5 text-[15px] font-medium text-ink"
        }
      >
        {nilai}
      </p>
      {keterangan && <p className="mt-0.5 text-xs text-ink-soft">{keterangan}</p>}
    </div>
  );
}
