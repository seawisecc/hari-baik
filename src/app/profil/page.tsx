"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Memuat } from "@/components/ProGate";
import { PageContainer } from "@/components/shell/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { WhatsAppCard } from "@/components/WhatsAppCard";
import { useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";

function Baris({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="text-sm text-ink-faint">{label}</dt>
      <dd className="text-right text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export default function ProfilPage() {
  const t = useT();
  const router = useRouter();
  const { profile, access, logout, loading } = useAuth();

  if (loading) return <Memuat />;

  if (!profile) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <PageHeader title={t("nav.profile")} />
          <Card>
            <CardBody className="pt-6">
              <p className="text-[15px] text-ink-soft">Kamu belum masuk.</p>
              <Button className="mt-4" block onClick={() => router.push("/login")}>
                Masuk
              </Button>
            </CardBody>
          </Card>
        </div>
      </PageContainer>
    );
  }

  const statusLabel =
    access.type === "subscription"
      ? `${t("subscription.active")} ${new Date(access.expiresAt!).toLocaleDateString("id-ID")}`
      : access.type === "trial"
        ? `${t("subscription.trial")} ${new Date(access.expiresAt!).toLocaleDateString("id-ID")}`
        : t("subscription.expired");

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader title={t("nav.profile")} />

        <Card elevation={3}>
          <CardHeader>
            <CardTitle>{profile.nama || "(nama belum diisi)"}</CardTitle>
            <p className="mt-0.5 text-sm text-ink-soft">{profile.email}</p>
          </CardHeader>
          <CardBody>
            <dl className="divide-y divide-border-soft">
              <Baris label="Tanggal lahir" value={profile.tanggalLahir ?? "-"} />
              <Baris
                label="Weton"
                value={
                  profile.saptaWaraLahir && profile.pancaWaraLahir
                    ? `${profile.saptaWaraLahir} ${profile.pancaWaraLahir}`
                    : "-"
                }
              />
              <Baris label="Wuku" value={profile.wukuLahir ?? "-"} />
              <Baris label="Urip" value={profile.uripLahir?.toString() ?? "-"} />
              <Baris label="WhatsApp" value={profile.phoneNumber ?? "-"} />
            </dl>
            <p className="mt-3 text-xs italic text-ink-faint">{t("profile.dob.readonly")}</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("subscription.title")}</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-[15px] text-ink-soft">
              {statusLabel}
              {access.daysLeft !== null && (
                <span className="text-ink-faint">
                  {" "}
                  · {access.daysLeft} {t("subscription.days")}
                </span>
              )}
            </p>
            {!access.isPro && (
              <Button block onClick={() => router.push("/expired")}>
                {t("subscription.cta")}
              </Button>
            )}
          </CardBody>
        </Card>

        {profile.role === "admin" && (
          <Button variant="surface" block onClick={() => router.push("/admin")}>
            Panel Admin
          </Button>
        )}

        <WhatsAppCard />

        <Button
          variant="ghost"
          block
          onClick={async () => {
            await logout();
            router.push("/");
          }}
        >
          {t("nav.logout")}
        </Button>
      </div>
    </PageContainer>
  );
}
