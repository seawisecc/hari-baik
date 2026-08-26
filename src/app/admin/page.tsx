"use client";

import { useEffect, useState } from "react";
import type { AksiLangganan } from "@/components/admin/AturLangganan";
import { UserTable } from "@/components/admin/UserTable";
import { Alert } from "@/components/ui/Alert";
import { Memuat } from "@/components/ProGate";
import { PageContainer } from "@/components/shell/AppShell";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/lib/firebase/AuthProvider";
import type { SubscriptionStatus, UserProfile } from "@/types";

const FILTER: { key: SubscriptionStatus | "all"; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Menunggu" },
  { key: "active", label: "Aktif" },
  { key: "lifetime", label: "Selamanya" },
  { key: "trial", label: "Trial" },
  { key: "expired", label: "Habis" },
];

export default function AdminPage() {
  const { user, profile, loading, configured } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filter, setFilter] = useState<SubscriptionStatus | "all">("pending");
  const [error, setError] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(true);
  /** Dinaikkan untuk memaksa muat ulang setelah sebuah aksi berhasil. */
  const [refresh, setRefresh] = useState(0);

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
        if (!res.ok) throw new Error(data.error ?? "Gagal memuat.");
        setUsers(data.users);
        setError(null);
      } catch (err) {
        if (batal) return;
        setError(err instanceof Error ? err.message : "Gagal memuat.");
      } finally {
        if (!batal) setMemuat(false);
      }
    })();

    return () => {
      batal = true;
    };
  }, [user, filter, refresh]);

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
      if (!res.ok) throw new Error(data.error ?? "Gagal.");
      setMemuat(true);
      setRefresh((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal.");
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
            <CardTitle>Tidak punya akses</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-[15px] text-ink-soft">Halaman ini hanya untuk admin.</p>
          </CardBody>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer wide>
      <div className="space-y-6">
        <PageHeader
          title="Kelola Pengguna"
          subtitle={
            memuat
              ? "Memuat…"
              : `${users.length} pengguna${filter === "all" ? "" : " pada filter ini"}`
          }
        />

        {error && <Alert tone="error">{error}</Alert>}

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
              {f.label}
            </Chip>
          ))}
        </div>

        <Card elevation={2}>
          <CardBody className="pt-6">
            {memuat ? (
              <p className="py-10 text-center text-sm text-ink-faint">Memuat…</p>
            ) : (
              <UserTable users={users} onAction={aksi} />
            )}
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
}
