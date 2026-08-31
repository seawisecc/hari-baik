"use client";

import { Lock, LogOut, MessageCircle, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Memuat } from "@/components/ProGate";
import { PageContainer } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ADMIN_WA, ADMIN_WA_DISPLAY } from "@/components/WhatsAppCard";
import { cn } from "@/lib/cn";
import { useLang, useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { tanggalMedium } from "@/lib/tanggal";
import { TambahAddOn } from "@/components/TambahAddOn";
import type { PengaturanHarga } from "@/lib/harga";
import type { AccessState } from "@/types";

export function ProfilClient({ harga }: { harga: PengaturanHarga }) {
  const t = useT();
  const { lang } = useLang();
  const router = useRouter();
  const { profile, access, logout, loading } = useAuth();

  if (loading) return <Memuat />;

  if (!profile) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <PageHeader title={t("nav.profile")} />
          <Card className="mx-auto max-w-lg">
            <CardBody className="pt-6">
              <p className="text-[15px] text-ink-soft">{t("auth.notSignedIn")}</p>
              <Button className="mt-5" block onClick={() => router.push("/login")}>
                {t("auth.login")}
              </Button>
            </CardBody>
          </Card>
        </div>
      </PageContainer>
    );
  }

  const weton =
    profile.saptaWaraLahir && profile.pancaWaraLahir
      ? `${profile.saptaWaraLahir} ${profile.pancaWaraLahir}`
      : "-";

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader title={t("nav.profile")} action={<StatusPill access={access} />} />

        {/* Identitas dan data kelahiran: satu kartu, karena semuanya
            diturunkan dari satu tanggal yang sama. */}
        <Card elevation={2}>
          <CardHeader>
            <CardTitle>{profile.nama || t("profile.noName")}</CardTitle>
            <p className="mt-0.5 text-sm text-ink-soft">{profile.email}</p>
          </CardHeader>

          <CardBody className="space-y-6">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border-soft sm:grid-cols-4">
              <Kotak label={t("profile.birthDate")} nilai={profile.tanggalLahir ?? "-"} />
              <Kotak label={t("profile.weton")} nilai={weton} />
              <Kotak label={t("profile.wuku")} nilai={profile.wukuLahir ?? "-"} />
              <Kotak label={t("profile.urip")} nilai={profile.uripLahir?.toString() ?? "-"} />
            </dl>

            {/* Tanggal lahir terkunci setelah onboarding. Seluruh isi aplikasi
                dihitung dari angka ini, jadi ia diperlakukan seperti data
                identitas: dikonfirmasi sekali di awal, sesudah itu hanya admin
                yang boleh memperbaikinya kalau ternyata keliru. */}
            <div className="flex flex-wrap items-start gap-3 rounded-md bg-surface-sunk px-5 py-4 hb-sink">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" aria-hidden />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-ink">{t("birth.locked")}</p>
                <p className="text-xs leading-relaxed text-ink-faint">
                  {t("birth.lockedDesc")}
                </p>
                <a
                  href={`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(
                    t("birth.lockedWa", { email: profile.email ?? "" }),
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block pt-1 text-xs font-medium text-accent-deep underline underline-offset-2"
                >
                  {t("birth.lockedAsk")}
                </a>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card elevation={2}>
          <CardHeader>
            <CardTitle>{t("subscription.title")}</CardTitle>
          </CardHeader>
          <CardBody>
            <RingkasanLangganan access={access} lang={lang} />
            {!access.isPro && (
              <Link href="/expired" className="mt-5 block">
                <Button block>{t("subscription.cta")}</Button>
              </Link>
            )}
          </CardBody>
        </Card>

        {/* Menambah add-on di tengah masa langganan.
            Sebelum ini tidak ada jalannya sama sekali: pelanggan yang sudah
            membayar setahun lalu ingin satu fitur tambahan harus membeli
            setahun lagi yang belum dia butuhkan. */}
        <TambahAddOn
          katalog={harga.addOn.filter((a) => a.aktif)}
          dimiliki={profile.addOn ?? []}
          access={access}
        />

        {profile.role === "admin" && (
          <Link href="/admin" className="block">
            <Card
              elevation={1}
              className="flex items-center gap-4 px-6 py-5 transition-shadow hover:hb-raise-2"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-pill bg-accent-wash">
                <Shield className="h-4 w-4 text-accent-deep" aria-hidden />
              </span>
              <div>
                <p className="font-medium text-ink">{t("profile.adminPanel")}</p>
                <p className="text-sm text-ink-soft">{t("profile.adminPanelDesc")}</p>
              </div>
            </Card>
          </Link>
        )}

        {/* Bantuan dibuat ringkas: di halaman profil ini pelengkap, bukan
            ajakan utama seperti di halaman terkunci. */}
        <Card elevation={1} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-6 py-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-pill bg-accent-wash">
            <MessageCircle className="h-4 w-4 text-accent-deep" aria-hidden />
          </span>
          <div className="flex-1">
            <p className="font-medium text-ink">{t("profile.needHelp")}</p>
            <p className="text-sm text-ink-soft">{t("profile.contactAdmin")}</p>
          </div>
          <a
            href={`https://wa.me/${ADMIN_WA}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center rounded-pill bg-surface-sunk px-5 text-sm font-medium text-ink hb-sink-sm transition-colors hover:text-accent-deep"
          >
            {ADMIN_WA_DISPLAY}
          </a>
        </Card>

        {/* Atribusi studio. Ditaruh di profil, bukan di setiap halaman, supaya
            hadir tanpa mengganggu pemakaian sehari-hari. */}
        <p className="px-1 text-center text-xs leading-relaxed text-ink-faint">
          {t("studio.about")}
        </p>

        <div className="pt-2">
          <Button
            variant="ghost"
            onClick={async () => {
              await logout();
              router.push("/");
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            {t("nav.logout")}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

function Kotak({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="bg-surface px-5 py-4">
      <dt className="text-[11px] uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-ink">{nilai}</dd>
    </div>
  );
}

function StatusPill({ access }: { access: AccessState }) {
  const t = useT();
  const { kunci, nada } =
    access.type === "lifetime"
      ? { kunci: "lifetime", nada: "border-accent-strong/50 text-accent-deep" }
      : access.type === "subscription"
        ? { kunci: "active", nada: "border-guru/45 text-guru-teks" }
        : access.type === "trial"
          ? { kunci: "trial", nada: "border-ratu/45 text-ratu-teks" }
          : { kunci: "expired", nada: "border-pati/45 text-pati-teks" };

  return (
    <span className={cn("rounded-pill border px-3.5 py-1.5 text-xs font-medium", nada)}>
      {t(`profile.status.${kunci}`)}
    </span>
  );
}

function RingkasanLangganan({ access, lang }: { access: AccessState; lang: "id" | "en" }) {
  const t = useT();

  if (access.type === "lifetime") {
    return <Ringkasan utama={t("profile.lifetime")} keterangan={t("profile.lifetimeDesc")} />;
  }

  if (!access.expiresAt) {
    return <Ringkasan utama={t("profile.inactive")} keterangan={t("profile.inactiveDesc")} />;
  }

  const sisa = access.daysLeft ?? 0;
  const tanggal = tanggalMedium(access.expiresAt.slice(0, 10), lang);
  const trial = access.type === "trial";

  // Sisa hari jadi judul hanya ketika angkanya berarti. "1589 hari lagi"
  // tidak memberi tahu apa pun; tanggalnya yang lebih berguna.
  if (sisa <= 45) {
    return (
      <Ringkasan
        utama={t("profile.daysLeft", { n: sisa })}
        keterangan={`${trial ? t("profile.trialEnds") : t("profile.validUntil")} ${tanggal}`}
        mendesak={sisa <= 7}
      />
    );
  }

  return (
    <Ringkasan
      utama={tanggal}
      keterangan={`${trial ? t("profile.trialEndDate") : t("profile.validUntilThis")}, ${t(
        "profile.daysLeft",
        { n: sisa },
      )}`}
    />
  );
}

function Ringkasan({
  utama,
  keterangan,
  mendesak = false,
}: {
  utama: string;
  keterangan: string;
  mendesak?: boolean;
}) {
  return (
    <div>
      <p
        className={cn(
          "font-heading text-2xl font-semibold",
          mendesak ? "text-lara-teks" : "text-ink",
        )}
      >
        {utama}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{keterangan}</p>
    </div>
  );
}
