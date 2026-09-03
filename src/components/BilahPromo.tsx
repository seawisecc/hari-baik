"use client";

import { ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { HitungMundur } from "@/components/HitungMundur";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/content/LangProvider";
import type { SisaPromo } from "@/lib/promo";

/**
 * Bilah promo yang menempel di bawah layar.
 *
 * Halaman depan ini panjang: masalah, alasan, warisan, cara kerja, kategori,
 * fitur, testimoni, baru harga. Yang membacanya sampai bawah sudah melewati
 * ajakan di hero ribuan piksel yang lalu, dan yang berhenti di tengah tidak
 * pernah sampai ke harganya sama sekali. Bilah ini yang membawa penawarannya
 * ikut turun bersama pembacanya.
 *
 * Tiga hal yang menahannya supaya tetap jadi tawaran, bukan gangguan, dan
 * ketiganya sengaja, bukan hiasan:
 *
 * 1. Ada tombol tutup, dan sekali ditutup dia tidak kembali sepanjang
 *    kunjungan itu. Ajakan yang tidak bisa disingkirkan berhenti dibaca dan
 *    mulai dihindari, dan halaman ini sudah menjanjikan "tanpa kartu kredit"
 *    di hero.
 * 2. Dia menghilang sendiri begitu bagian harga terlihat. Di situ tombolnya
 *    sudah ada di layar, jadi yang tersisa dari bilah ini cuma menutupi isi
 *    yang sedang dibaca orangnya.
 * 3. Dia baru muncul setelah hero terlewat. Muncul sejak awal berarti dua
 *    ajakan yang sama bersaing di layar yang sama.
 *
 * Ambang gulirnya diukur dari tinggi jendela, bukan angka piksel tetap:
 * hero setinggi satu layar di ponsel adalah dua pertiga layar di laptop, dan
 * ambang tetap membuat bilahnya muncul terlalu cepat di salah satunya.
 */
/**
 * Id deret kartu harga di halaman depan.
 *
 * Bilah ini menghilang begitu deret itu terlihat, jadi keduanya harus memakai
 * nama yang sama. Ditulis sebagai tetapan dan diimpor halaman depan supaya
 * yang mengubah salah satunya tidak bisa melewatkan pasangannya, dan supaya
 * putusnya ketahuan saat menyusun, bukan sebagai bilah yang diam-diam tidak
 * pernah menyingkir.
 */
export const SASARAN = "paket";

export function BilahPromo({
  berakhirPada,
  awal,
  hemat,
  diskonMaks,
}: {
  berakhirPada: string;
  /** Sisa promo saat dirender di server. Lihat catatan di HitungMundur. */
  awal: SisaPromo;
  /** Rupiah yang dihemat pada paket terbaik, sudah dirangkai pemanggilnya. */
  hemat: string;
  diskonMaks: number;
}) {
  const t = useT();
  const [lewatHero, setLewatHero] = useState(false);
  const [diHarga, setDiHarga] = useState(false);
  const [ditutup, setDitutup] = useState(false);

  useEffect(() => {
    const cek = () => setLewatHero(window.scrollY > window.innerHeight * 0.9);
    cek();
    window.addEventListener("scroll", cek, { passive: true });
    return () => window.removeEventListener("scroll", cek);
  }, []);

  useEffect(() => {
    /*
     * Yang diamati deret kartu harganya, BUKAN jangkar `#promo` di atasnya.
     *
     * Jangkar itu div setinggi nol, dan target setinggi nol tidak pernah
     * dianggap berpotongan: irisannya kotak berluas nol, dan kotak kosong
     * dibaca "tidak berpotongan". Kodenya tidak melempar apa pun, pengamatnya
     * terpasang dengan benar, `isIntersecting` cuma tidak pernah jadi true.
     * Gejalanya persis seperti pemeriksaan yang tidak pernah dipasang:
     * bilahnya tetap menempel menutupi kartu harga yang sedang dibaca
     * orangnya. Terukur di peramban, bukan ditebak: tinggi jangkarnya 0, dan
     * bilahnya masih tampil padahal ketiga kartu harga ada di layar.
     *
     * Margin bawah negatif supaya bagian harga baru dihitung terlihat setelah
     * benar-benar masuk layar, bukan pada saat baris pertamanya muncul dari
     * balik bilah. Tanpa itu bilahnya berkedip mati-hidup saat digulir pelan.
     */
    const sasaran = document.getElementById(SASARAN);
    if (!sasaran) return;
    const pengamat = new IntersectionObserver(([entri]) => setDiHarga(entri.isIntersecting), {
      rootMargin: "0px 0px -25% 0px",
    });
    pengamat.observe(sasaran);
    return () => pengamat.disconnect();
  }, []);

  const tampil = lewatHero && !diHarga && !ditutup;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 px-3 pb-[env(safe-area-inset-bottom)] transition-[opacity,transform] duration-200 ${
        tampil ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
      aria-hidden={!tampil}
    >
      {/*
       * Satu susunan, bukan dua.
       *
       * Di layar sempit tombolnya turun ke baris sendiri selebar penuh, di
       * layar lebar ketiganya sebaris. Godaannya merender dua susunan lalu
       * menyembunyikan salah satunya dengan CSS, dan itu sudah pernah
       * menggigit di panel admin. Di sini yang berpindah cuma urutan dan
       * lebarnya, jadi tidak ada elemen kembar di DOM.
       *
       * Tanpa baris sendiri, tombol dan tombol tutup memakan sekitar dua
       * ratus piksel dari lebar ponsel dan yang tersisa untuk kalimat
       * penawarannya tinggal terpotong jadi "Potongan samp...", yaitu
       * bilah yang memakan ruang tanpa menyampaikan apa pun.
       */}
      <div className="mx-auto mb-3 flex max-w-3xl flex-wrap items-center gap-x-3 gap-y-2.5 rounded-lg bg-surface px-3 py-2.5 hb-raise-4 sm:flex-nowrap sm:px-5 sm:py-3">
        <div className="order-1 min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">
            {t("promo.upTo", { n: diskonMaks })}
            <span className="hidden sm:inline"> · {t("promo.saveUpTo", { v: hemat })}</span>
          </p>
          <p className="mt-0.5 truncate text-xs text-ink-soft">
            <HitungMundur berakhirPada={berakhirPada} awal={awal} ringkas />
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDitutup(true)}
          tabIndex={tampil ? undefined : -1}
          aria-label={t("promo.close")}
          className="order-2 grid h-8 w-8 shrink-0 place-items-center rounded-pill text-ink-faint transition-colors hover:bg-surface-sunk hover:text-ink sm:order-3"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <a
          href="#promo"
          className="order-3 w-full shrink-0 sm:order-2 sm:w-auto"
          tabIndex={tampil ? undefined : -1}
        >
          <Button size="sm" variant="promo" block className="sm:w-auto">
            <span className="relative z-10">{t("promo.take")}</span>
            <ArrowRight className="relative z-10 h-3.5 w-3.5" aria-hidden />
            <span
              aria-hidden
              className="absolute inset-y-0 -left-6 w-8 bg-white/40 blur-[3px] hb-kilau"
            />
          </Button>
        </a>
      </div>
    </div>
  );
}
