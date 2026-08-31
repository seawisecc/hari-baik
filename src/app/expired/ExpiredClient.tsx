"use client";

import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AjukanAktivasi } from "@/components/AjukanAktivasi";
import { MIDTRANS_AKTIF } from "@/components/BayarMidtrans";
import { DaftarHarga } from "@/components/DaftarHarga";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Wordmark } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { jalurBayar, type PengaturanHarga, type PaketLangganan } from "@/lib/harga";

/** Paket yang disorot lebih dulu, supaya tombol kirim langsung bisa ditekan. */
function paketAwal(harga: PengaturanHarga): PaketLangganan | null {
  const aktif = harga.paket.filter((p) => p.aktif);
  return aktif.find((p) => p.populer) ?? aktif[0] ?? null;
}

/**
 * Harga datang dari server sebagai prop, jadi daftar paket sudah terisi pada
 * cat pertama. Tidak ada lagi fetch setelah hidrasi yang membuat halaman ini
 * kosong beberapa detik sebelum harganya muncul.
 */
export function ExpiredClient({ harga }: { harga: PengaturanHarga }) {
  const t = useT();
  const router = useRouter();
  const { profile, logout } = useAuth();
  const [paket, setPaket] = useState<PaketLangganan | null>(() => paketAwal(harga));


  // Langkah "cara berlangganan" di bawah menjelaskan alur transfer manual,
  // jadi ia ikut hilang ketika jalur itu tidak ditawarkan. Petunjuk yang
  // menyuruh menghubungi admin di halaman yang tidak lagi menerima transfer
  // lebih membingungkan daripada tidak ada petunjuk sama sekali.
  const jalur = jalurBayar({
    midtransAktif: MIDTRANS_AKTIF,
    transferDiizinkan: harga.transferManual,
  });

  const menunggu = profile?.subscriptionStatus === "pending";

  /*
   * Setelah lunas, orangnya dibawa ke halaman terima kasih, bukan langsung ke
   * aplikasi.
   *
   * Bukan sekadar basa-basi. Halaman itu terdaftar di RUTE_TUJUAN, jadi ia
   * bisa dibuka walau akses belum hidup, dan ia memeriksa sendiri status
   * pesanannya. Membawa orangnya langsung ke /hari-ini berarti bertaruh pada
   * profil di memori yang datang lewat onSnapshot dan tiba beberapa saat
   * kemudian: kalau gerbang sempat memeriksa sebelum itu, ia memantulkannya
   * kembali ke halaman terkunci ini tanpa keterangan apa pun, persis setelah
   * orangnya membayar.
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
          <span className="mb-4 grid h-12 w-12 place-items-center rounded-pill bg-surface-sunk hb-sink">
            <Lock className="h-5 w-5 text-ink-faint" aria-hidden />
          </span>
          <CardTitle className="text-2xl">{t("expired.title")}</CardTitle>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{t("expired.desc")}</p>
        </CardHeader>

        <CardBody className="space-y-8 pb-7">
          {!menunggu && (
            <DaftarHarga
              data={harga}
              dipilih={paket?.id ?? null}
              onPilih={(p) => setPaket(p)}
              tanpaAddOn
            />
          )}

          <div className="space-y-5 border-t border-border-soft pt-6">
            {!menunggu && jalur.transfer && (
              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                  {t("expired.howTo")}
                </p>
                <ol className="space-y-2 text-sm leading-relaxed text-ink-soft">
                  {["expired.step1", "expired.step2", "expired.step3"].map((k, i) => (
                    <li key={k} className="flex gap-2.5">
                      <span className="font-semibold text-ink">{i + 1}.</span>
                      {t(k)}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <AjukanAktivasi
              paket={paket}
              addOnTersedia={harga.addOn.filter((a) => a.aktif)}
              sudahMenunggu={menunggu}
              transferManual={harga.transferManual}
              onLunas={keTerimaKasih}
            />
          </div>
        </CardBody>
      </Card>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-ink-faint">
        {t("studio.by")}
      </p>

      <button
        onClick={async () => {
          await logout();
          router.push("/");
        }}
        className="mt-6 text-center text-sm text-ink-faint underline underline-offset-2 hover:text-ink-soft"
      >
        {t("nav.logout")}
      </button>
    </main>
  );
}
