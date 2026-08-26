"use client";

import { useEffect, useState } from "react";
import type { AksiLangganan } from "@/components/admin/AturLangganan";
import { AturHarga } from "@/components/admin/AturHarga";
import { DaftarPermintaan } from "@/components/admin/DaftarPermintaan";
import { UserTable } from "@/components/admin/UserTable";
import { Alert } from "@/components/ui/Alert";
import { Memuat } from "@/components/ProGate";
import { PageContainer } from "@/components/shell/AppShell";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { PageHeader } from "@/components/ui/PageHeader";
import { useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";
import type { SubscriptionStatus, UserProfile } from "@/types";

const FILTER: { key: SubscriptionStatus | "all"; labelKey: string }[] = [
  { key: "all", labelKey: "admin.filter.all" },
  { key: "pending", labelKey: "admin.filter.pending" },
  { key: "active", labelKey: "admin.filter.active" },
  { key: "lifetime", labelKey: "admin.filter.lifetime" },
  { key: "trial", labelKey: "admin.filter.trial" },
  { key: "expired", labelKey: "admin.filter.expired" },
];

export default function AdminPage() {
  const t = useT();
  const { user, profile, loading, configured } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filter, setFilter] = useState<SubscriptionStatus | "all">("pending");
  const [error, setError] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(true);
  /** Dinaikkan untuk memaksa muat ulang setelah sebuah aksi berhasil. */
  const [refresh, setRefresh] = useState(0);
  const [tab, setTab] = useState<"pengguna" | "permintaan" | "harga">("pengguna");

  useEffect(() => {
    if (!user) return;
    // Balapan antar-permintaan: hasil dari filter lama tidak boleh menimpa
    // hasil filter yang lebih baru.
    let batal = false;

    void (async () => {
      try {
        const token = await user.getIdToken();
        if (batal) return;
        const q = filter === "all" ? "" : `?status=${filter}`;
        const res = await fetch(`/api/admin/users${q}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (batal) return;
        if (!res.ok) throw new Error(data.error ?? t("admin.loadFailed"));
        setUsers(data.users);
        setError(null);
      } catch (err) {
        if (batal) return;
        setError(err instanceof Error ? err.message : t("admin.loadFailed"));
      } finally {
        if (!batal) setMemuat(false);
      }
    })();

    return () => {
      batal = true;
    };
  }, [user, filter, refresh, t]);

  const aksi = async (uid: string, perintah: AksiLangganan) => {
    if (!user) return;
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ uid, ...perintah }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("admin.actionFailed"));
      setMemuat(true);
      setRefresh((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.actionFailed"));
    }
  };

  if (loading) return <Memuat />;

  if (!configured || !user || profile?.role !== "admin") {
    // Ini hanya penjaga tampilan. Penjagaan sebenarnya ada di API route
    // (verifikasi custom claim) dan di Firestore Rules.
    return (
      <PageContainer>
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.noAccess")}</CardTitle>
          </CardHeader>
          <CardBody>{t("admin.adminOnly")}</CardBody>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer wide>
      <div className="space-y-6">
        <PageHeader
          title={t(
            tab === "permintaan"
              ? "admin.title.requests"
              : tab === "harga"
                ? "admin.title.pricing"
                : "admin.title.users",
          )}
          subtitle={
            tab === "permintaan"
              ? t("admin.sub.requests")
              : tab === "harga"
                ? t("admin.sub.pricing")
                : memuat
                  ? t("common.loading")
                  : t(filter === "all" ? "admin.count" : "admin.countFiltered", {
                      n: users.length,
                    })
          }
        />

        {error && <Alert tone="error">{error}</Alert>}

        {/* Dua bagian yang jarang dipakai bersamaan: kelola pengguna
            sehari-hari, atur harga sesekali. */}
        <div
          role="tablist"
          className="inline-flex gap-1 rounded-pill bg-surface-sunk p-1 hb-sink"
        >
          {(["pengguna", "permintaan", "harga"] as const).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`rounded-pill px-5 py-2 text-sm font-medium transition-[box-shadow,background-color] duration-150 ${
                tab === k
                  ? "bg-accent text-accent-ink hb-raise-1"
                  : "text-ink-faint hover:text-ink-soft"
              }`}
            >
              {t(
                k === "pengguna"
                  ? "price.tab.users"
                  : k === "permintaan"
                    ? "admin.tab.requests"
                    : "price.tab.pricing",
              )}
            </button>
          ))}
        </div>

        {tab === "harga" ? (
          <AturHarga />
        ) : tab === "permintaan" ? (
          <DaftarPermintaan />
        ) : (
          <>
            <div className="flex flex-wrap gap-2.5">
              {FILTER.map((f) => (
                <Chip
                  key={f.key}
                  selected={filter === f.key}
                  onClick={() => {
                    if (f.key === filter) return;
                    setMemuat(true);
                    setError(null);
                    setFilter(f.key);
                  }}
                >
                  {t(f.labelKey)}
                </Chip>
              ))}
            </div>

            <Card elevation={2}>
              <CardBody className="pt-6">
                {memuat ? (
                  <p className="py-10 text-center text-sm text-ink-faint">
                    {t("common.loading")}
                  </p>
                ) : (
                  <UserTable users={users} onAction={aksi} />
                )}
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </PageContainer>
  );
}
