"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { AksiPengguna } from "@/components/admin/aksi";
import { AturHarga } from "@/components/admin/AturHarga";
import { DaftarPermintaan } from "@/components/admin/DaftarPermintaan";
import { TombolEkspor } from "@/components/admin/TombolEkspor";
import { UserTable } from "@/components/admin/UserTable";
import { Alert } from "@/components/ui/Alert";
import { Memuat } from "@/components/ProGate";
import { PageContainer } from "@/components/shell/AppShell";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";
import type { SubscriptionStatus, UserProfile } from "@/types";
import { ambilToken } from "@/lib/firebase/client";
import { HARGA_BAWAAN, type AddOn, type PengaturanHarga } from "@/lib/harga";

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
  /** Katalog add-on, dipakai kolom dan pengatur add-on di tabel pengguna. */
  const [katalogAddOn, setKatalogAddOn] = useState<AddOn[]>(HARGA_BAWAAN.addOn);
  /** Yang sedang diketik, dan yang sudah benar-benar dikirim ke server. */
  const [cari, setCari] = useState("");
  const [cariAktif, setCariAktif] = useState("");
  /** Ada hasil cocok yang tidak muat di halaman ini. */
  const [lebih, setLebih] = useState(false);
  /** Batas pindai kena: mungkin ada yang cocok tapi tidak sempat dilihat. */
  const [terpotong, setTerpotong] = useState(false);
  /** Berapa dokumen yang sempat dilihat server pada pencarian terakhir. */
  const [dipindai, setDipindai] = useState(0);

  useEffect(() => {
    let batal = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/harga");
        const d = (await res.json()) as PengaturanHarga;
        if (!batal) setKatalogAddOn(d.addOn);
      } catch {
        // Katalog bawaan sudah cukup untuk menampilkan namanya.
      }
    })();
    return () => {
      batal = true;
    };
  }, []);

  /*
   * Jeda sebelum mengetik dianggap selesai.
   *
   * Setiap pencarian membaca sampai seribu dokumen di server, dan itu ditagih
   * per dokumen. Tanpa jeda ini, mengetik "wayan" berarti lima pencarian
   * berturut-turut dan lima kali biaya itu, empat di antaranya untuk kata
   * yang belum selesai diketik.
   */
  useEffect(() => {
    if (cari === cariAktif) return;
    const jeda = setTimeout(() => {
      setMemuat(true);
      setCariAktif(cari);
    }, 400);
    return () => clearTimeout(jeda);
  }, [cari, cariAktif]);

  useEffect(() => {
    if (!user) return;
    // Balapan antar-permintaan: hasil dari filter lama tidak boleh menimpa
    // hasil filter yang lebih baru.
    let batal = false;

    void (async () => {
      try {
        const token = await ambilToken();
        if (batal) return;
        const q = new URLSearchParams();
        if (filter !== "all") q.set("status", filter);
        if (cariAktif.trim()) q.set("q", cariAktif.trim());
        const res = await fetch(`/api/admin/users?${q}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (batal) return;
        if (!res.ok) throw new Error(data.error ?? t("admin.loadFailed"));
        setUsers(data.users);
        setLebih(Boolean(data.lebih));
        setTerpotong(Boolean(data.terpotong));
        setDipindai(Number(data.dipindai ?? 0));
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
  }, [user, filter, cariAktif, refresh, t]);

  const aksi = async (uid: string, perintah: AksiPengguna) => {
    if (!user) return;
    setError(null);
    try {
      const token = await ambilToken();
      // Tanggal lahir bukan urusan langganan: ia diperiksa dan dihitung ulang
      // di route profil, yang juga mencatatnya ke jejak audit.
      const jalur =
        perintah.action === "lahir"
          ? "/api/admin/profil"
          : perintah.action === "hapus"
            ? "/api/admin/hapus"
            : "/api/admin/subscription";
      const res = await fetch(jalur, {
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

            {/* Pencarian dan ekspor berdampingan karena keduanya bekerja pada
                tampilan yang sama: yang terekspor adalah yang tersaring. */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-0 flex-1 sm:max-w-md">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                  aria-hidden
                />
                <Input
                  type="search"
                  value={cari}
                  onChange={(e) => setCari(e.target.value)}
                  placeholder={t("admin.search.placeholder")}
                  aria-label={t("admin.search.placeholder")}
                  className="h-11 pl-11 pr-11 text-sm"
                />
                {cari && (
                  <button
                    onClick={() => setCari("")}
                    aria-label={t("admin.search.clear")}
                    className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-pill text-ink-faint hover:text-ink"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <TombolEkspor status={filter === "all" ? null : filter} kunci={cariAktif} />
            </div>

            {!memuat && terpotong && (
              <p className="text-xs text-ink-faint">
                {t("admin.search.truncated", { n: dipindai })}
              </p>
            )}
            {!memuat && lebih && (
              <p className="text-xs text-ink-faint">
                {t("admin.search.more", { n: users.length })}
              </p>
            )}

            <Card elevation={2}>
              <CardBody className="pt-6">
                {memuat ? (
                  <p className="py-10 text-center text-sm text-ink-faint">
                    {t("common.loading")}
                  </p>
                ) : users.length === 0 && cariAktif.trim() ? (
                  // Pesan kosong yang menyebut kata kuncinya, bukan "tidak ada
                  // pengguna", yang terbaca seolah basis datanya yang kosong.
                  <p className="py-10 text-center text-sm text-ink-faint">
                    {t("admin.search.none", { q: cariAktif.trim() })}
                  </p>
                ) : (
                  <UserTable users={users} katalogAddOn={katalogAddOn} onAction={aksi} />
                )}
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </PageContainer>
  );
}
