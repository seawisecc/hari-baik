"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AjukanAktivasi } from "@/components/AjukanAktivasi";
import { DaftarHarga } from "@/components/DaftarHarga";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Wordmark } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";
import type { PengaturanHarga } from "@/lib/harga";
import type { PaketPromo } from "@/lib/promo";
import { HARI_TRIAL } from "@/lib/subscription";

/** Paket yang disorot lebih dulu, supaya tombol bayar langsung bisa ditekan. */
function paketAwal(paketPromo: PaketPromo[]): PaketPromo | null {
  return paketPromo.find((p) => p.paket.populer) ?? paketPromo[0] ?? null;
}

/**
 * Penawaran, bukan gerbang.
 *
 * Perbedaannya bukan soal nada melainkan soal jalan keluar, dan jalan keluar
 * itu harus terlihat tanpa menggulir. Halaman depan menjanjikan "tanpa kartu
 * kredit, coba gratis tiga hari"; layar bayar yang muncul tepat sesudah
 * mendaftar akan terbaca sebagai janji yang ditarik kembali kecuali dua hal
 * jelas sejak baris pertama: masa cobanya SUDAH jalan, dan melewati layar ini
 * tidak mengurangi apa pun.
 *
 * Karena itu judulnya menyebut trialnya sudah aktif sebelum menyebut promonya,
 * dan tautan lanjut ada di bawah sebagai tautan biasa yang bisa ditekan, bukan
 * tanda silang kecil di sudut yang harus dicari.
 */
export function PenawaranClient({
  harga,
  paketPromo,
  sisaPromo,
}: {
  harga: PengaturanHarga;
  paketPromo: PaketPromo[];
  /** Sisa hari promo. Halaman ini hanya dirender saat promo berjalan. */
  sisaPromo: number;
}) {
  const t = useT();
  const router = useRouter();
  const { profile } = useAuth();
  const [paket, setPaket] = useState<PaketPromo | null>(() => paketAwal(paketPromo));

  const diskonMaks = Math.max(0, ...paketPromo.map((p) => p.diskonPersen));
  const namaDepan = profile?.nama?.trim().split(/\s+/)[0] ?? "";

  /*
   * Sesudah lunas tetap ke halaman terima kasih, sama seperti dari /expired.
   *
   * Bukan langsung ke aplikasi: sebagian metode baru lunas beberapa menit
   * kemudian, dan halaman terima kasih adalah satu-satunya yang boleh dibuka
   * ketika aksesnya belum sempat menyala.
   */
  const keTerimaKasih = (orderId: string) => {
    router.replace(`/terima-kasih?bayar=${encodeURIComponent(orderId)}`);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-14">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Wordmark size={28} textClassName="text-2xl" />
        <ThemeToggle compact />
      </div>

      <Card elevation={3}>
        <CardHeader>
          <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-pill bg-accent-wash px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-accent-deep hb-raise-1">
            <Sparkles className="h-3 w-3" aria-hidden />
            {t("promo.badge")} · {t("promo.off", { n: diskonMaks })}
          </span>

          {/* Nama depan saja, dan hanya kalau ada. Onboarding memang mewajibkan
              nama, tapi judul yang berbunyi "Selamat datang, " dengan koma
              menggantung adalah bentuk kerusakan yang paling mudah dihindari
              dan paling terlihat. */}
          <CardTitle className="text-2xl">
            {namaDepan
              ? t("penawaran.title", { nama: namaDepan })
              : t("penawaran.titleTanpaNama")}
          </CardTitle>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
            {t("penawaran.desc", { n: HARI_TRIAL })}
          </p>
          <p className="mt-2 text-sm font-medium text-accent-deep">
            {sisaPromo <= 1 ? t("promo.endsToday") : t("promo.ends", { n: sisaPromo })}
          </p>
        </CardHeader>

        <CardBody className="space-y-7 pb-7">
          <DaftarHarga
            data={harga}
            paketPromo={paketPromo}
            dipilih={paket?.paket.id ?? null}
            onPilih={(p) => setPaket(p)}
            tanpaAddOn
          />

          <div className="border-t border-border-soft pt-6">
            <AjukanAktivasi
              harga={harga}
              paket={paket}
              addOnTersedia={harga.addOn.filter((a) => a.aktif)}
              sudahMenunggu={profile?.subscriptionStatus === "pending"}
              transferManual={harga.transferManual}
              onLunas={keTerimaKasih}
            />
          </div>
        </CardBody>
      </Card>

      {/*
       * Jalan keluarnya tautan sungguhan, bukan hiasan.
       *
       * Kecil sesuai maksudnya, tapi kata-katanya menyebut apa yang didapat
       * kalau ditekan, bukan sekadar "lewati". Yang menekan "lewati" merasa
       * menolak sesuatu; yang menekan "lanjutkan dengan masa coba" merasa
       * mengambil yang memang sudah jadi haknya.
       */}
      <Link
        href="/hari-ini"
        className="mt-6 text-center text-sm text-ink-faint underline underline-offset-4 hover:text-ink-soft"
      >
        {t("penawaran.skip", { n: HARI_TRIAL })}
      </Link>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-ink-faint">
        {t("penawaran.note")}
      </p>
    </main>
  );
}
