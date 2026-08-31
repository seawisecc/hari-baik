"use client";

import { CreditCard, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/content/LangProvider";
import { ambilToken } from "@/lib/firebase/client";
import { modeDariKunci, urlSnapJs } from "@/lib/midtrans";

/**
 * Tombol bayar lewat Midtrans.
 *
 * Kunci klien dibaca dari env yang berawalan NEXT_PUBLIC, jadi ia memang ikut
 * ke peramban, dan itu tidak apa-apa: kunci klien dirancang untuk terlihat.
 * Yang tidak boleh ikut adalah kunci server, dan ia tidak pernah disentuh
 * berkas ini. Sandbox atau produksi ditentukan dari awalan kuncinya sendiri
 * (`SB-`), bukan dari saklar terpisah yang bisa berbeda dari kuncinya.
 *
 * Kalau kuncinya kosong, komponen ini tidak merender apa pun. Jalur transfer
 * manual di bawahnya tetap hidup, jadi halaman langganan tidak pernah kosong
 * hanya karena gateway-nya belum dipasang.
 */

const KUNCI_KLIEN = (process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "").trim();

export const MIDTRANS_AKTIF = KUNCI_KLIEN.length > 0;

interface HasilSnap {
  order_id?: string;
  transaction_status?: string;
}

interface SnapGlobal {
  pay: (
    token: string,
    opsi: {
      onSuccess?: (h: HasilSnap) => void;
      onPending?: (h: HasilSnap) => void;
      onError?: (h: HasilSnap) => void;
      onClose?: () => void;
    },
  ) => void;
}

declare global {
  interface Window {
    snap?: SnapGlobal;
  }
}

/**
 * Muat snap.js sekali saja.
 *
 * Skripnya tidak dimuat lewat next/script karena ia butuh atribut
 * `data-client-key`, dan yang lebih penting: ia hanya perlu ada di halaman
 * langganan. Memuatnya di layout berarti setiap halaman menarik skrip pihak
 * ketiga untuk sesuatu yang dipakai satu halaman.
 */
function muatSnap(): Promise<void> {
  const src = urlSnapJs(modeDariKunci(KUNCI_KLIEN));
  const sudah = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  if (sudah) {
    return window.snap
      ? Promise.resolve()
      : new Promise((selesai, gagal) => {
          sudah.addEventListener("load", () => selesai());
          sudah.addEventListener("error", () => gagal(new Error("snap.js gagal dimuat")));
        });
  }

  return new Promise((selesai, gagal) => {
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.dataset.clientKey = KUNCI_KLIEN;
    el.addEventListener("load", () => selesai());
    el.addEventListener("error", () => gagal(new Error("snap.js gagal dimuat")));
    document.head.appendChild(el);
  });
}

type Keadaan = "diam" | "menyiapkan" | "membayar" | "memeriksa" | "lunas" | "tertunda";

export function BayarMidtrans({
  paketId,
  addOnIds,
  onLunas,
}: {
  paketId: string | null;
  addOnIds: string[];
  /** Dipanggil sekali begitu pembayaran terbukti lunas di sisi server. */
  onLunas: () => void;
}) {
  const t = useT();
  const [keadaan, setKeadaan] = useState<Keadaan>("diam");
  const [error, setError] = useState<string | null>(null);
  const hidup = useRef(true);

  useEffect(() => {
    hidup.current = true;
    return () => {
      hidup.current = false;
    };
  }, []);

  /**
   * Tanya server: pesanan ini sudah lunas atau belum?
   *
   * Ditanya berulang dengan jeda, bukan sekali, karena jawaban Midtrans tidak
   * selalu langsung berubah begitu jendela Snap ditutup: virtual account dan
   * QRIS penyelesaiannya lewat bank dan butuh beberapa saat. Yang menekan
   * tombol berhak melihat hasilnya di layar yang sama, bukan disuruh memuat
   * ulang halaman sampai berubah sendiri.
   *
   * Ditulis sebagai perulangan, bukan pemanggilan diri sendiri, supaya
   * fungsinya tidak perlu menyebut namanya sendiri dari dalam useCallback.
   * Setiap perubahan state terjadi sesudah await, jadi memanggilnya dari
   * dalam efek tidak memicu render berantai.
   */
  const pantau = useCallback(
    async (orderId: string, putaran = 6): Promise<void> => {
      const token = await ambilToken();
      if (!hidup.current) return;
      setKeadaan("memeriksa");

      for (let sisa = putaran; sisa >= 0; sisa--) {
        let status = "menunggu";
        try {
          const res = await fetch(`/api/bayar?orderId=${encodeURIComponent(orderId)}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = (await res.json()) as { status?: string };
          status = data.status ?? "menunggu";
        } catch {
          // Jaringan yang putus sesaat bukan alasan mengumumkan gagal bayar.
          // Uangnya mungkin sudah masuk; yang gagal cuma pertanyaannya.
          status = "menunggu";
        }
        if (!hidup.current) return;

        if (status === "lunas") {
          setKeadaan("lunas");
          onLunas();
          return;
        }
        if (status === "gagal") {
          setKeadaan("diam");
          setError(t("bayar.gagal"));
          return;
        }
        if (sisa === 0) {
          setKeadaan("tertunda");
          return;
        }
        await new Promise((r) => setTimeout(r, 2500));
        if (!hidup.current) return;
      }
    },
    [onLunas, t],
  );

  /**
   * Kepulangan dari cara bayar yang memakai alihan halaman.
   *
   * Sebagian metode (beberapa e-wallet, kartu dengan 3DS) meninggalkan
   * halaman ini sepenuhnya, jadi callback onSuccess Snap tidak pernah
   * berjalan. Midtrans mengembalikan pengguna ke `finish` URL yang membawa
   * `?bayar=<orderId>`, dan dari situlah pemeriksaannya dimulai. Tanpa ini,
   * orang yang membayar lewat jalur alihan kembali ke halaman terkunci yang
   * kelihatannya tidak terjadi apa-apa.
   *
   * Dibaca dari `window.location`, bukan `useSearchParams`, supaya halaman
   * yang menampungnya tidak ikut kehilangan prerender statisnya.
   */
  useEffect(() => {
    const orderId = new URLSearchParams(window.location.search).get("bayar");
    if (!orderId) return;

    // Dibersihkan dari alamat supaya memuat ulang halaman tidak memeriksa
    // pesanan lama yang sudah selesai berulang-ulang.
    const bersih = new URL(window.location.href);
    bersih.searchParams.delete("bayar");
    window.history.replaceState({}, "", bersih.toString());

    // Efek ini memang menyalakan sesuatu yang berujung pada setState, dan
    // itu disengaja: yang disinkronkan adalah keadaan di luar React, yaitu
    // pesanan di Midtrans yang alamatnya baru saja dibawa pulang di query.
    // Perubahan state-nya sendiri terjadi sesudah await, bukan di dalam
    // render, jadi tidak ada render berantai.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void pantau(orderId);
  }, [pantau]);

  if (!MIDTRANS_AKTIF) return null;

  const bayar = async () => {
    if (!paketId) return;
    setError(null);
    setKeadaan("menyiapkan");
    try {
      await muatSnap();
      const token = await ambilToken();
      const res = await fetch("/api/bayar", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paketId, addOnIds }),
      });
      const data = (await res.json()) as { token?: string; orderId?: string; error?: string };
      if (!res.ok || !data.token || !data.orderId) {
        throw new Error(data.error ?? t("bayar.gagal"));
      }

      const orderId = data.orderId;
      setKeadaan("membayar");
      window.snap?.pay(data.token, {
        onSuccess: () => void pantau(orderId),
        onPending: () => void pantau(orderId),
        onError: () => {
          setKeadaan("diam");
          setError(t("bayar.gagal"));
        },
        // Ditutup bukan berarti batal: untuk virtual account, menutup jendela
        // setelah nomornya disalin adalah alur yang normal. Karena itu
        // statusnya tetap ditanyakan, bukan langsung dianggap batal, hanya
        // dengan putaran yang lebih pendek.
        onClose: () => void pantau(orderId, 2),
      });
    } catch (err) {
      setKeadaan("diam");
      setError(err instanceof Error ? err.message : t("bayar.gagal"));
    }
  };

  const sibuk = keadaan === "menyiapkan" || keadaan === "membayar" || keadaan === "memeriksa";

  return (
    <div className="space-y-3">
      {error && <Alert tone="error">{error}</Alert>}
      {keadaan === "lunas" && <Alert tone="success">{t("bayar.lunas")}</Alert>}
      {keadaan === "tertunda" && <Alert tone="warning">{t("bayar.tertunda")}</Alert>}

      <Button block size="lg" disabled={sibuk || !paketId} onClick={bayar}>
        <CreditCard className="h-4 w-4" aria-hidden />
        {keadaan === "menyiapkan" || keadaan === "membayar"
          ? t("bayar.menyiapkan")
          : keadaan === "memeriksa"
            ? t("bayar.memeriksa")
            : t("bayar.sekarang")}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-faint">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {t("bayar.aman")}
      </p>
    </div>
  );
}
