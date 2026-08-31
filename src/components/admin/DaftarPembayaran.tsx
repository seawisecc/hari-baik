"use client";

import { MessageCircle, RefreshCw, Search, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { bolehPeriksaUlang, STATUS_PEMBAYARAN } from "@/lib/admin-pembayaran";
import { useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { ambilToken } from "@/lib/firebase/client";
import { rupiah } from "@/lib/harga";
import type { Pembayaran, StatusPembayaranDoc } from "@/types";

/**
 * Daftar pesanan lewat payment gateway.
 *
 * Layar ini menjawab satu pertanyaan yang pasti datang: seseorang bilang sudah
 * membayar tapi aplikasinya masih terkunci. Yang dibutuhkan saat itu bukan
 * angka penjualan, melainkan satu pesanan tertentu, dan cara menyelesaikannya
 * tanpa membuka Firestore.
 *
 * Bawaannya menampilkan yang berstatus menunggu, bukan yang lunas. Yang lunas
 * tidak butuh siapa-siapa; yang menunggu itulah yang mungkin sedang ditunggu
 * orang di seberang.
 */

const GAYA_STATUS: Record<StatusPembayaranDoc, string> = {
  menunggu: "bg-lara/30 text-ink",
  lunas: "bg-guru/25 text-ink",
  gagal: "bg-pati/20 text-ink",
  dikembalikan: "bg-ratu/25 text-ink",
};

const KUNCI_STATUS: Record<StatusPembayaranDoc, string> = {
  menunggu: "bayar.status.menunggu",
  lunas: "bayar.status.lunas",
  gagal: "bayar.status.gagal",
  dikembalikan: "bayar.status.dikembalikan",
};

function waktu(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function nomorWa(phone: string) {
  return phone.replace(/\D/g, "").replace(/^0/, "62");
}

export function DaftarPembayaran() {
  const t = useT();
  const { user } = useAuth();
  const idCari = useId();
  const [status, setStatus] = useState<StatusPembayaranDoc | "all">("menunggu");
  const [daftar, setDaftar] = useState<Pembayaran[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kabar, setKabar] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [terpotong, setTerpotong] = useState(false);
  const [dipindai, setDipindai] = useState(0);
  const [gatewayAktif, setGatewayAktif] = useState(true);
  const [cari, setCari] = useState("");
  const [cariAktif, setCariAktif] = useState("");

  // Jeda mengetik, alasannya sama dengan pencarian pengguna: tiap pencarian
  // membaca ratusan dokumen di server dan itu ditagih per dokumen.
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
    let batal = false;

    void (async () => {
      try {
        const token = await ambilToken();
        if (batal) return;
        const q = new URLSearchParams({ status });
        if (cariAktif.trim()) q.set("q", cariAktif.trim());
        const res = await fetch(`/api/admin/pembayaran?${q}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (batal) return;
        if (!res.ok) throw new Error(data.error ?? t("admin.loadFailed"));
        setDaftar(data.pembayaran);
        setTerpotong(Boolean(data.terpotong));
        setDipindai(Number(data.dipindai ?? 0));
        setGatewayAktif(Boolean(data.gatewayAktif));
        setError(null);
      } catch (err) {
        if (!batal) setError(err instanceof Error ? err.message : t("admin.loadFailed"));
      } finally {
        if (!batal) setMemuat(false);
      }
    })();

    return () => {
      batal = true;
    };
  }, [user, status, cariAktif, refresh, t]);

  const periksaUlang = async (orderId: string) => {
    setBusy(orderId);
    setError(null);
    setKabar(null);
    try {
      const token = await ambilToken();
      const res = await fetch("/api/admin/pembayaran", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("admin.actionFailed"));

      setKabar(
        data.adaTransaksi === false
          ? t("bayar.cek.belumAda")
          : data.baru
            ? t("bayar.cek.berubah")
            : t("bayar.cek.tetap", {
                status: t(KUNCI_STATUS[data.status as StatusPembayaranDoc]),
              }),
      );
      setMemuat(true);
      setRefresh((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.actionFailed"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      {error && <Alert tone="error">{error}</Alert>}
      {kabar && <Alert tone="success">{kabar}</Alert>}
      {!gatewayAktif && <Alert tone="warning">{t("bayar.gatewayMati")}</Alert>}

      <div className="flex flex-wrap gap-2.5">
        {(["all", ...STATUS_PEMBAYARAN] as const).map((k) => (
          <Chip
            key={k}
            selected={status === k}
            onClick={() => {
              if (k === status) return;
              setMemuat(true);
              setKabar(null);
              setStatus(k);
            }}
          >
            {k === "all" ? t("admin.filter.all") : t(KUNCI_STATUS[k])}
          </Chip>
        ))}
      </div>

      <div className="relative min-w-0 sm:max-w-md">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
          aria-hidden
        />
        <Input
          id={idCari}
          type="search"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder={t("bayar.cari.placeholder")}
          aria-label={t("bayar.cari.placeholder")}
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

      {!memuat && terpotong && (
        <p className="text-xs text-ink-faint">{t("admin.search.truncated", { n: dipindai })}</p>
      )}

      {memuat ? (
        <p className="py-10 text-center text-sm text-ink-faint">{t("common.loading")}</p>
      ) : daftar.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-faint">
          {cariAktif.trim()
            ? t("admin.search.none", { q: cariAktif.trim() })
            : t("bayar.kosong")}
        </p>
      ) : (
        <div className="space-y-3">
          {daftar.map((p) => (
            <Card key={p.orderId} elevation={2}>
              <CardBody className="space-y-4 pt-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {p.nama || t("profile.noName")}
                    </p>
                    <p className="truncate text-xs text-ink-faint" title={p.email}>
                      {p.email}
                    </p>
                    {p.phoneNumber && (
                      <a
                        href={`https://wa.me/${nomorWa(p.phoneNumber)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 inline-flex items-center gap-1 text-xs text-accent-deep hover:underline"
                      >
                        <MessageCircle className="h-3 w-3" aria-hidden />
                        {p.phoneNumber}
                      </a>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`rounded-pill px-2.5 py-1 text-xs font-medium ${GAYA_STATUS[p.status]}`}
                    >
                      {t(KUNCI_STATUS[p.status])}
                    </span>
                    <span className="font-heading text-lg font-bold text-ink">
                      {rupiah(p.total)}
                    </span>
                    {/* Pesanan sandbox tidak boleh terbaca sebagai uang masuk.
                        Tanpa penanda ini, hasil percobaan dan penjualan
                        sungguhan terlihat sama persis di daftar yang sama. */}
                    {p.mode !== "produksi" && (
                      <span className="rounded-pill bg-surface-sunk px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-faint">
                        {p.mode}
                      </span>
                    )}
                  </div>
                </div>

                <dl className="grid gap-x-6 gap-y-2 border-t border-border-soft pt-3 text-sm sm:grid-cols-2">
                  <Baris label={t("bayar.kol.paket")}>
                    {p.paketNama}
                    {p.addOn.length > 0 && (
                      <span className="text-ink-faint">
                        {" "}
                        + {p.addOn.map((a) => a.nama).join(", ")}
                      </span>
                    )}
                  </Baris>
                  <Baris label={t("bayar.kol.cara")}>{p.paymentType ?? "-"}</Baris>
                  <Baris label={t("bayar.kol.dibuat")}>{waktu(p.createdAt)}</Baris>
                  <Baris label={t("bayar.kol.dibayar")}>{waktu(p.dibayarPada)}</Baris>
                  <Baris label={t("bayar.kol.order")}>
                    <code className="break-all text-xs">{p.orderId}</code>
                  </Baris>
                  <Baris label={t("bayar.kol.transaksi")}>
                    <code className="break-all text-xs">{p.transactionId ?? "-"}</code>
                  </Baris>
                </dl>

                {bolehPeriksaUlang(p) && (
                  <div className="flex flex-wrap items-center gap-3 border-t border-border-soft pt-4">
                    <Button
                      size="sm"
                      variant="surface"
                      disabled={busy === p.orderId || !gatewayAktif}
                      onClick={() => periksaUlang(p.orderId)}
                    >
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                      {busy === p.orderId ? t("bayar.cek.jalan") : t("bayar.cek")}
                    </Button>
                    <p className="text-xs leading-relaxed text-ink-faint">
                      {t("bayar.cek.hint")}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Baris({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-xs text-ink-faint">{label}</dt>
      <dd className="min-w-0 text-right text-ink-soft">{children}</dd>
    </div>
  );
}
