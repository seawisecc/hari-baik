"use client";

import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { useLang, useT } from "@/lib/content/LangProvider";
import { TESTIMONI } from "@/lib/content/testimoni";
import { teks } from "@/lib/harga";

/** Jeda antar geseran otomatis. Cukup lama untuk satu kutipan selesai dibaca. */
const JEDA = 6500;

/**
 * Kata pelanggan sebagai deret yang berjalan sendiri.
 *
 * Digeser dengan `scrollTo` pada kartu yang dituju, bukan dengan menghitung
 * lebar lalu menggeser sejauh itu. Jumlah kartu yang terlihat berubah menurut
 * lebar layar (satu, dua, lalu tiga), dan perhitungan lebar akan meleset tiap
 * kali titik pindahnya terlewat. Menanyakan posisi kartunya sendiri selalu
 * benar, berapa pun yang sedang terlihat.
 *
 * Gerakan otomatis berhenti saat kursor masuk, saat ada yang menerima fokus
 * papan ketik, dan saat jari menyentuhnya. Deret yang tetap berjalan sementara
 * orang sedang membaca satu kutipan bukan hiasan, itu gangguan.
 *
 * Yang meminta gerakan dikurangi lewat pengaturan sistemnya tidak mendapat
 * gerakan otomatis sama sekali, dan panah serta titiknya tetap bisa dipakai.
 */
export function TestimoniSlider() {
  const t = useT();
  const { lang } = useLang();
  const trek = useRef<HTMLDivElement>(null);
  const [aktif, setAktif] = useState(0);
  const [berhenti, setBerhenti] = useState(false);

  const keKartu = useCallback((i: number) => {
    const el = trek.current;
    const kartu = el?.children[i] as HTMLElement | undefined;
    if (!el || !kartu) return;
    el.scrollTo({ left: kartu.offsetLeft - el.offsetLeft, behavior: "smooth" });
  }, []);

  // Posisi dibaca dari gulirannya sendiri, bukan disimpan terpisah. Orang bisa
  // menggeser deret ini dengan jari atau trackpad, dan titik penanda harus
  // ikut yang benar-benar terlihat, bukan yang terakhir kali kita perintahkan.
  useEffect(() => {
    const el = trek.current;
    if (!el) return;
    const baca = () => {
      const anak = [...el.children] as HTMLElement[];
      const kiri = el.scrollLeft + el.offsetLeft;
      let dekat = 0;
      let jarak = Infinity;
      anak.forEach((k, i) => {
        const d = Math.abs(k.offsetLeft - kiri);
        if (d < jarak) {
          jarak = d;
          dekat = i;
        }
      });
      setAktif(dekat);
    };
    el.addEventListener("scroll", baca, { passive: true });
    return () => el.removeEventListener("scroll", baca);
  }, []);

  /*
   * Timernya dipasang sekali, bukan dipasang ulang tiap kali kartunya berganti.
   *
   * Versi pertama menaruh `aktif` di daftar dependensi, jadi setiap perubahan
   * posisi membuang timer lama dan memasang yang baru. Hitungan mundurnya
   * ikut mulai dari nol setiap kali, dan cukup satu peristiwa guliran yang
   * datang tepat sebelum waktunya untuk membuat deretnya tidak pernah sampai
   * ke geseran berikutnya. Posisi sekarang dibaca dari ref, yang boleh berubah
   * tanpa memicu apa pun.
   */
  const posisi = useRef(0);
  useEffect(() => {
    posisi.current = aktif;
  }, [aktif]);

  useEffect(() => {
    if (berhenti) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const jam = setInterval(() => {
      const el = trek.current;
      if (!el) return;
      // Tab yang tidak terlihat tidak perlu digeser: yang terjadi cuma
      // menghabiskan baterai lalu menyodorkan kartu acak saat orangnya kembali.
      if (document.visibilityState !== "visible") return;
      // Berhenti di ujung berarti kembali ke awal, bukan mentok diam.
      const diUjung = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      keKartu(diUjung ? 0 : posisi.current + 1);
    }, JEDA);
    return () => clearInterval(jam);
  }, [berhenti, keKartu]);

  if (TESTIMONI.length === 0) return null;

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={t("landing.voices.title")}
      onMouseEnter={() => setBerhenti(true)}
      onMouseLeave={() => setBerhenti(false)}
      onFocusCapture={() => setBerhenti(true)}
      onBlurCapture={() => setBerhenti(false)}
      // Sentuhan menghentikan sementara, bukan selamanya. Versi pertama tidak
      // punya pasangan yang menyalakannya lagi, jadi sekali digeser dengan jari
      // deretnya diam untuk seterusnya.
      onTouchStart={() => setBerhenti(true)}
      onTouchEnd={() => setBerhenti(false)}
      onTouchCancel={() => setBerhenti(false)}
    >
      <div
        ref={trek}
        // Bilah guliran disembunyikan, tapi gulirannya sendiri tetap ada:
        // menggeser dengan jari atau trackpad harus tetap bekerja.
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TESTIMONI.map((x) => (
          <Card
            key={x.nama}
            className="flex w-[85%] shrink-0 snap-start flex-col p-6 sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)]"
          >
            <Quote className="h-5 w-5 shrink-0 text-accent-deep" aria-hidden />
            <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-soft">
              &ldquo;{teks(x.kutipan, lang)}&rdquo;
            </blockquote>
            <figcaption className="mt-4 border-t border-border-soft pt-3">
              <p className="text-sm font-semibold text-ink">{x.nama}</p>
              <p className="text-xs text-ink-faint">
                {teks(x.peran, lang)} · {x.asal}
              </p>
            </figcaption>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <Panah arah="kiri" onClick={() => keKartu(Math.max(0, aktif - 1))} />
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {TESTIMONI.map((x, i) => (
            <button
              key={x.nama}
              onClick={() => keKartu(i)}
              aria-label={t("landing.voices.goTo", { n: i + 1 })}
              aria-current={i === aktif}
              className={`h-1.5 rounded-pill transition-[width,background-color] duration-200 ${
                i === aktif ? "w-6 bg-accent-deep" : "w-1.5 bg-border-soft hover:bg-ink-faint"
              }`}
            />
          ))}
        </div>
        <Panah
          arah="kanan"
          onClick={() => keKartu(Math.min(TESTIMONI.length - 1, aktif + 1))}
        />
      </div>
    </div>
  );
}

function Panah({ arah, onClick }: { arah: "kiri" | "kanan"; onClick: () => void }) {
  const t = useT();
  const Ikon = arah === "kiri" ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      aria-label={t(arah === "kiri" ? "landing.voices.prev" : "landing.voices.next")}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-pill bg-surface text-ink-soft hb-raise-1 transition-colors hover:text-ink"
    >
      <Ikon className="h-4 w-4" aria-hidden />
    </button>
  );
}
