"use client";

import { ArrowRight, CheckCircle2, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Wordmark } from "@/components/ui/Logo";
import { useT } from "@/lib/content/LangProvider";
import { ambilToken } from "@/lib/firebase/client";
import { rupiah } from "@/lib/harga";

/**
 * Ke mana orang mendarat setelah membayar.
 *
 * Alasannya bukan sopan santun. Sebagian metode bayar (e-wallet, kartu dengan
 * 3DS) meninggalkan aplikasi ini sepenuhnya, lalu Midtrans memulangkan
 * orangnya ke `finish` URL. Sebelum halaman ini ada, URL itu menunjuk balik ke
 * `/expired`, jadi orang yang baru saja membayar mendarat di layar yang
 * berbunyi "aksesmu habis". Yang paling mungkin dia simpulkan adalah uangnya
 * hilang, dan yang paling mungkin dia lakukan adalah membayar sekali lagi.
 *
 * Halaman ini juga tempat yang benar untuk keadaan menggantung. Virtual
 * account dan QRIS tidak selesai seketika: uangnya baru masuk beberapa menit
 * kemudian lewat bank. Di halaman terkunci keadaan itu tidak punya tempat;
 * di sini ia punya kalimatnya sendiri, dan halamannya menunggu bersama
 * orangnya alih-alih menyuruh dia memuat ulang sendiri.
 */

type Keadaan = "memeriksa" | "lunas" | "tertunda" | "gagal" | "tanpaPesanan";

interface Rincian {
  paketNama?: string;
  paketTahun?: number;
  addOn?: string[];
  total?: number;
}

export default function TerimaKasihPage() {
  const t = useT();
  const [keadaan, setKeadaan] = useState<Keadaan>("memeriksa");
  const [rincian, setRincian] = useState<Rincian>({});
  const hidup = useRef(true);

  useEffect(() => {
    hidup.current = true;
    return () => {
      hidup.current = false;
    };
  }, []);

  /**
   * Ditanya berulang dengan jeda, bukan sekali.
   *
   * Putarannya lebih panjang daripada di halaman langganan (20 kali, kira-kira
   * satu menit) karena di sini orangnya memang sedang menunggu jawaban dan
   * tidak sedang mengerjakan apa pun yang lain. Menyerah terlalu cepat berarti
   * menyuruhnya memuat ulang halaman padahal jawabannya tinggal beberapa detik
   * lagi.
   */
  const pantau = useCallback(async (orderId: string | null) => {
    if (!orderId) return setKeadaan("tanpaPesanan");
    const token = await ambilToken();
    for (let sisa = 20; sisa >= 0; sisa--) {
      let status = "menunggu";
      try {
        const res = await fetch(`/api/bayar?orderId=${encodeURIComponent(orderId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await res.json()) as { status?: string } & Rincian;
        if (!hidup.current) return;
        if (res.ok) {
          status = data.status ?? "menunggu";
          setRincian({
            paketNama: data.paketNama,
            paketTahun: data.paketTahun,
            addOn: data.addOn,
            total: data.total,
          });
        } else {
          setKeadaan("tanpaPesanan");
          return;
        }
      } catch {
        // Jaringan yang putus sesaat bukan alasan mengumumkan gagal bayar.
        // Uangnya mungkin sudah masuk; yang gagal cuma pertanyaannya.
        status = "menunggu";
      }
      if (!hidup.current) return;

      if (status === "lunas") return setKeadaan("lunas");
      if (status === "gagal") return setKeadaan("gagal");
      if (sisa === 0) return setKeadaan("tertunda");

      await new Promise((r) => setTimeout(r, 3000));
      if (!hidup.current) return;
    }
  }, []);

  useEffect(() => {
    const orderId = new URLSearchParams(window.location.search).get("bayar");
    // Efek ini menyinkronkan keadaan di luar React, yaitu pesanan di Midtrans
    // yang nomornya dibawa pulang di query. Perubahan state-nya terjadi
    // sesudah await, bukan di dalam render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void pantau(orderId);
  }, [pantau]);

  const isi = {
    memeriksa: {
      Ikon: Clock,
      warna: "text-ink-faint",
      judul: t("tk.memeriksa.title"),
      teks: t("tk.memeriksa.desc"),
    },
    lunas: {
      Ikon: CheckCircle2,
      warna: "text-guru-teks",
      judul: t("tk.lunas.title"),
      teks: t("tk.lunas.desc"),
    },
    tertunda: {
      Ikon: Clock,
      warna: "text-lara-teks",
      judul: t("tk.tertunda.title"),
      teks: t("tk.tertunda.desc"),
    },
    gagal: {
      Ikon: XCircle,
      warna: "text-error",
      judul: t("tk.gagal.title"),
      teks: t("tk.gagal.desc"),
    },
    tanpaPesanan: {
      Ikon: XCircle,
      warna: "text-ink-faint",
      judul: t("tk.tanpaPesanan.title"),
      teks: t("tk.tanpaPesanan.desc"),
    },
  }[keadaan];

  const { Ikon } = isi;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-14">
      <div className="mb-8 flex justify-center">
        <Wordmark size={28} textClassName="text-2xl" />
      </div>

      <Card elevation={3}>
        <CardBody className="space-y-5 py-9 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-pill bg-surface-sunk hb-sink">
            <Ikon className={`h-6 w-6 ${isi.warna}`} aria-hidden />
          </span>

          <div className="space-y-2">
            <h1 className="font-heading text-2xl font-bold text-ink">{isi.judul}</h1>
            <p className="text-[15px] leading-relaxed text-ink-soft">{isi.teks}</p>
          </div>

          {/* Apa yang barusan dibeli, disebutkan kembali. Yang baru membayar
              ingin melihat ulang apa yang dia bayar, dan itu juga yang membuat
              salah pilih ketahuan lebih awal, saat masih mudah dibereskan. */}
          {rincian.paketNama && keadaan !== "gagal" && (
            <dl className="mx-auto max-w-sm space-y-2 rounded-md bg-surface-sunk px-5 py-4 text-left text-sm hb-sink">
              <Baris label={t("tk.item")}>{rincian.paketNama}</Baris>
              {rincian.addOn && rincian.addOn.length > 0 && (
                <Baris label={t("tk.addon")}>{rincian.addOn.join(", ")}</Baris>
              )}
              {typeof rincian.total === "number" && (
                <Baris label={t("req.total")}>
                  <span className="font-medium text-ink">{rupiah(rincian.total)}</span>
                </Baris>
              )}
            </dl>
          )}

          <div className="space-y-3 pt-1">
            {keadaan === "lunas" && (
              <Link href="/hari-ini" className="block">
                <Button block size="lg">
                  {t("tk.buka")}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
            )}

            {(keadaan === "gagal" || keadaan === "tanpaPesanan") && (
              <Link href="/expired" className="block">
                <Button block size="lg">
                  {t("tk.kembali")}
                </Button>
              </Link>
            )}

            {keadaan === "tertunda" && (
              <Link href="/expired" className="block">
                <Button block size="lg" variant="surface">
                  {t("tk.kembali")}
                </Button>
              </Link>
            )}
          </div>
        </CardBody>
      </Card>
    </main>
  );
}

function Baris({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-xs text-ink-faint">{label}</dt>
      <dd className="text-right text-ink-soft">{children}</dd>
    </div>
  );
}
