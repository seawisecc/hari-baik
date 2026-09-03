"use client";

import {
  ArrowRight,
  BookOpen,
  Calculator,
  CalendarDays,
  CalendarSearch,
  Check,
  FileText,
  Fingerprint,
  Gift,
  Heart,
  Route,
  ShieldCheck,
  Sparkles,
  Store,
  Sun,
  Tag,
  User,
  UserPlus,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { BilahPromo, SASARAN } from "@/components/BilahPromo";
import { HitungMundur } from "@/components/HitungMundur";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LangToggle } from "@/components/ui/LangToggle";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { WhatsAppCard } from "@/components/WhatsAppCard";
import { useLang, useT } from "@/lib/content/LangProvider";
import { TestimoniSlider } from "@/components/TestimoniSlider";
import { TESTIMONI } from "@/lib/content/testimoni";
import { PerbandinganPaket } from "@/components/PerbandinganPaket";
import { rupiah, teks, type PengaturanHarga } from "@/lib/harga";
import {
  hematPromo,
  nilaiHemat,
  perTahunPromo,
  type PaketPromo,
  type SisaPromo,
} from "@/lib/promo";
import { HARI_TRIAL } from "@/lib/subscription";

const LANGKAH: { icon: LucideIcon; n: number }[] = [
  { icon: UserPlus, n: 1 },
  { icon: CalendarDays, n: 2 },
  { icon: Sun, n: 3 },
];

/**
 * Daftar fitur mengikuti apa yang benar-benar ada di aplikasi, lengkap dengan
 * penanda tingkatnya. Calon pelanggan berhak tahu batasnya sebelum membayar,
 * bukan setelahnya.
 *
 * Tiga tingkat, bukan dua: yang termasuk langganan, yang butuh langganan, dan
 * yang dibeli terpisah. Add-on dulu hanya muncul di daftar harga di bawah,
 * jadi pengunjung yang memindai bagian fitur tidak pernah tahu fitur itu ada.
 */
type Tingkat = "termasuk" | "pro" | "addon";

const FITUR: { icon: LucideIcon; kunci: string; tingkat: Tingkat }[] = [
  { icon: Sun, kunci: "today", tingkat: "termasuk" },
  { icon: CalendarDays, kunci: "calendar", tingkat: "termasuk" },
  { icon: User, kunci: "traits", tingkat: "termasuk" },
  { icon: Sparkles, kunci: "name", tingkat: "pro" },
  { icon: Heart, kunci: "match", tingkat: "pro" },
  { icon: Route, kunci: "journey", tingkat: "pro" },
  { icon: CalendarSearch, kunci: "finder", tingkat: "addon" },
  { icon: UsersRound, kunci: "family", tingkat: "addon" },
  { icon: FileText, kunci: "report", tingkat: "addon" },
];

/** Penanda tingkat. Add-on dibedakan dari Pro supaya tidak dikira sudah termasuk. */
const TINGKAT_LABEL: Record<Tingkat, string> = {
  termasuk: "landing.features.free",
  pro: "landing.features.pro",
  addon: "landing.features.addon",
};

const TINGKAT_GAYA: Record<Tingkat, string> = {
  termasuk: "bg-surface-sunk text-ink-faint",
  pro: "bg-accent text-accent-ink",
  addon: "bg-lara/15 text-lara-teks",
};

const KATEGORI = ["guru", "ratu", "lara", "pati"] as const;
const KATEGORI_BG: Record<(typeof KATEGORI)[number], string> = {
  guru: "bg-guru",
  ratu: "bg-ratu",
  lara: "bg-lara",
  pati: "bg-pati",
};

const FAQ = [1, 2, 3, 4, 5, 6] as const;

/**
 * Tiga bentuk dari satu masalah yang sama.
 *
 * Halaman ini dulu langsung memperkenalkan produknya. Yang membuka halaman
 * depan belum tentu sedang mencari kalender wariga; sebagian besar sedang
 * memikirkan sesuatu yang tidak berjalan. Tiga kartu ini menyebutkan hal itu
 * lebih dulu, baru produknya diperkenalkan sebagai jawabannya.
 */
const MASALAH = [1, 2, 3] as const;

/**
 * Tiga tradisi yang benar-benar dipakai di dalam aplikasi, bukan sekadar
 * disebut. Kalau suatu hari salah satunya dibuang dari produk, kartunya harus
 * ikut dibuang dari sini.
 *
 * Kuncinya menyebut nama sistem perhitungannya (wariga, primbon, fengshui),
 * bukan nama daerah asalnya. Judul yang berbunyi "Wariga Bali" dan "Primbon
 * Jawa" membuat pembaca dari daerah lain menyimpulkan aplikasinya bukan
 * untuk mereka, padahal hitungannya sama untuk siapa pun.
 */
const WARISAN = [
  { icon: Sun, kunci: "wariga" },
  { icon: BookOpen, kunci: "primbon" },
  { icon: Store, kunci: "fengshui" },
] as const;

/** Tiga alasan kenapa ini perhitungan, bukan ramalan. */
const ALASAN = [
  { icon: Calculator, kunci: "point1" },
  { icon: ShieldCheck, kunci: "point2" },
  { icon: Fingerprint, kunci: "point3" },
] as const;

function Section({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="space-y-3 text-center">
        <h2 className="font-heading text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
        {lead && (
          <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-ink-soft">{lead}</p>
        )}
      </div>
      {children}
    </section>
  );
}

/**
 * Dua tombol, bukan satu, dan urutannya disengaja.
 *
 * Yang lebih menonjol adalah promonya, karena itu yang sedang ditawarkan dan
 * karena ia punya batas waktu. Coba gratis tetap ada di sebelahnya dengan
 * bobot lebih ringan: sebagian besar pengunjung belum siap membayar pada menit
 * pertama, dan menghapus pintu masuk gratisnya akan memulangkan mereka
 * daripada menaikkan mereka satu tingkat.
 *
 * Tombol promo turun ke bagian perbandingan di halaman yang sama, bukan
 * langsung ke pendaftaran. Menjual sebelum menunjukkan angkanya membuat
 * tombolnya cuma menjadi salinan kedua dari tombol di sebelahnya.
 */
function TombolAwal({ adaPromo }: { adaPromo: boolean }) {
  const t = useT();
  return (
    <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
      {adaPromo && (
        <a href="#promo" className="relative sm:w-auto">
          {/* Cincin yang berdenyut di belakang tombolnya, bukan di tombolnya.
              Tombol yang ikut membesar akan menggeser teks yang sedang dibaca
              dan memindahkan sasaran tepat saat jari sudah mengarah ke sana. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-pill bg-accent-strong/45 hb-degup"
          />
          <Button size="lg" block variant="promo" className="relative sm:w-auto">
            <span className="relative z-10">{t("landing.cta.promo")}</span>
            <ArrowRight className="relative z-10 h-4 w-4" aria-hidden />
            {/* Kilau yang menyapu. Berada di dalam tombol yang
                `overflow-hidden`, jadi dia terpotong rapi oleh sudut
                membulatnya alih-alih melewatinya. */}
            <span
              aria-hidden
              className="absolute inset-y-0 -left-10 w-12 bg-white/45 blur-[4px] hb-kilau"
            />
          </Button>
        </a>
      )}
      <Link href="/register" className="sm:w-auto">
        <Button
          size="lg"
          block
          variant={adaPromo ? "surface" : "primary"}
          className="sm:w-auto"
        >
          {t("landing.cta.trial", { n: HARI_TRIAL })}
          {!adaPromo && <ArrowRight className="h-4 w-4" aria-hidden />}
        </Button>
      </Link>
    </div>
  );
}

/**
 * Pita promo di hero: berapa potongannya, berapa rupiah yang dihemat, dan
 * berapa lama lagi.
 *
 * Menggantikan lencana satu baris yang berbunyi "Promo, potongan 25%,
 * berakhir 27 hari lagi". Kalimat itu benar dan hampir tidak berbunyi apa-
 * apa: persen menuntut pembacanya mengalikan sendiri sebelum tahu artinya,
 * dan "27 hari lagi" terbaca seperti sesuatu yang bisa diurus minggu depan.
 * Tiga hal yang berubah di sini, dan ketiganya tentang mengubah keterangan
 * jadi alasan untuk bergerak sekarang: angkanya disebut dalam rupiah, bonusnya
 * disebut ada, dan batas waktunya berdetak.
 *
 * Baris terakhir sengaja menjelaskan bahwa harganya kembali normal sendiri
 * setelah tanggal itu. Itu bukan tekanan tambahan, itu kebalikannya: janji
 * yang bisa diperiksa, dan pembeda antara promo berjangka dengan potongan
 * yang terpasang selamanya sampai ada yang ingat mencabutnya.
 */
function PitaPromo({
  diskonMaks,
  hemat,
  adaBonus,
  sisaHari,
  sisaRinci,
  berakhirPromo,
}: {
  diskonMaks: number;
  /** Rupiah yang dihemat pada paket terbaik. Nol berarti tidak disebut. */
  hemat: number;
  adaBonus: boolean;
  sisaHari: number;
  sisaRinci: SisaPromo | null;
  berakhirPromo: string | null;
}) {
  const t = useT();
  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-accent-wash px-5 py-5 hb-raise-2">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-ink">
          <Tag className="h-3 w-3" aria-hidden />
          {t("promo.badge")}
        </span>
        <span className="font-heading text-xl font-bold text-ink sm:text-2xl">
          {t("promo.upTo", { n: diskonMaks })}
        </span>
      </div>

      {hemat > 0 && (
        <p className="mt-2.5 text-center text-sm font-semibold text-guru-teks">
          {t("promo.saveUpTo", { v: rupiah(hemat) })}
          {adaBonus && <span className="text-ink-soft"> · {t("promo.bonusFree")}</span>}
        </p>
      )}

      {/* Jam mundurnya butuh dua hal dari server sekaligus: tanggal berakhir
          dan sisa waktu saat dirender. Kalau salah satunya tidak ada, yang
          tampil kalimat lamanya, bukan jam yang mulai dari angka salah. */}
      <div className="mt-4">
        {sisaRinci && berakhirPromo ? (
          <HitungMundur berakhirPada={berakhirPromo} awal={sisaRinci} />
        ) : (
          <p className="text-center text-sm font-semibold text-accent-deep">
            {sisaHari <= 1 ? t("promo.endsToday") : t("promo.ends", { n: sisaHari })}
          </p>
        )}
      </div>

      <p className="mx-auto mt-3.5 max-w-xs text-center text-[11px] leading-relaxed text-ink-faint">
        {t("promo.after")}
      </p>
    </div>
  );
}

function TombolDaftar({ size = "lg" }: { size?: "md" | "lg" }) {
  const t = useT();
  return (
    <Link href="/register">
      <Button size={size}>
        {t("landing.cta.trial", { n: HARI_TRIAL })}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>
    </Link>
  );
}

export function LandingClient({
  harga,
  paketPromo,
  sisaPromo,
  sisaRinci,
  berakhirPromo,
  tahun,
}: {
  harga: PengaturanHarga;
  /** Paket aktif berikut harga promonya, dihitung di server. */
  paketPromo: PaketPromo[];
  /** Sisa hari promo, null bila tidak ada promo berjalan. Dari server. */
  sisaPromo: number | null;
  /**
   * Sisa promo terperinci saat halaman dirender, untuk nilai awal jam
   * mundurnya. Dari server dengan alasan yang sama seperti `sisaPromo`, dan
   * lebih tegas lagi: yang berbeda antara HTML dan hidrasi bukan cuma tanggal
   * di sekitar tengah malam, melainkan detiknya, tiap kali.
   */
  sisaRinci: SisaPromo | null;
  /** ISO tanggal berakhirnya promo, untuk jam mundur di peramban. */
  berakhirPromo: string | null;
  /** Tahun untuk footer, ditentukan di server supaya hidrasi tidak berbeda. */
  tahun: number;
}) {
  const t = useT();
  const { lang } = useLang();

  const addOn = harga.addOn.filter((a) => a.aktif);
  const diskonMaks = Math.max(0, ...paketPromo.map((p) => p.diskonPersen));
  const adaPromo = sisaPromo !== null && diskonMaks > 0;

  /* Yang paling banyak dihemat di antara semua paket, dalam rupiah. Dipakai
     di pita hero dan di bilah melayang, jadi keduanya menyebut angka yang
     sama persis: dua angka berbeda untuk penawaran yang sama membuat
     pembacanya berhenti mempercayai keduanya. */
  const hematMaks = Math.max(0, ...paketPromo.map((p) => nilaiHemat(p, addOn)));
  const adaBonus = paketPromo.some((p) => p.bonusAddOn.length > 0);

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 sm:px-8">
      {/* Di layar sempit toggle dipadatkan jadi ikon dan boleh turun baris.
          Sebelumnya keempat elemen dipaksa satu baris, dan wordmark-nya patah
          dua baris lalu tertimpa toggle di sebelahnya. */}
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-3 py-6">
        <Wordmark size={26} />
        <div className="flex items-center gap-2">
          <LangToggle compact className="sm:hidden" />
          <ThemeToggle compact className="sm:hidden" />
          <LangToggle className="hidden sm:inline-flex" />
          <ThemeToggle className="hidden sm:inline-flex" />
          <Link href="/login">
            <Button variant="surface" size="sm">
              {t("auth.login")}
            </Button>
          </Link>
        </div>
      </header>

      {/*
       * Hero dibuka dengan pertanyaan, bukan dengan nama produk.
       *
       * Nama Hari Baik tetap terbaca di wordmark header tepat di atasnya, jadi
       * tidak ada yang hilang. Yang berubah urutan perhatiannya: pengunjung
       * pertama kali belum peduli pada nama sebuah aplikasi, dia peduli pada
       * hal yang sedang mengganjal di kepalanya. Tagline lama tetap ada,
       * turun satu tingkat jadi penutup bagian ini.
       */}
      <section className="py-16 text-center sm:py-24">
        <Logo size={68} className="mx-auto mb-7" />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
          {t("landing.hero.eyebrow")}
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl font-heading text-3xl font-bold leading-tight text-ink sm:text-5xl">
          {t("landing.hero.hook")}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl font-heading text-lg font-semibold leading-snug text-ink sm:text-xl">
          {t("landing.hero.sub")}
        </p>
        <p className="mx-auto mt-4 max-w-lg leading-relaxed text-ink-soft">
          {t("landing.hero.lead")}
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          {adaPromo && (
            <PitaPromo
              diskonMaks={diskonMaks}
              hemat={hematMaks}
              adaBonus={adaBonus}
              sisaHari={sisaPromo}
              sisaRinci={sisaRinci}
              berakhirPromo={berakhirPromo}
            />
          )}
          <TombolAwal adaPromo={adaPromo} />
          <p className="text-xs italic text-ink-faint">{t("landing.cta.noCard")}</p>
          <p className="text-sm font-medium text-ink-soft">{t("landing.hero.proof")}</p>
        </div>
      </section>

      <div className="space-y-24">
        <Section title={t("landing.problem.title")} lead={t("landing.problem.lead")}>
          <div className="grid gap-5 sm:grid-cols-3">
            {MASALAH.map((n) => (
              <Card key={n} className="p-6">
                <h3 className="font-heading text-lg font-semibold text-ink">
                  {t(`landing.problem.${n}.title`)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {t(`landing.problem.${n}.desc`)}
                </p>
              </Card>
            ))}
          </div>
        </Section>

        {/* Jawaban atas bagian di atas, dan sekaligus tempat menegaskan bahwa
            ini perhitungan, bukan ramalan. Itu keberatan pertama yang muncul
            di kepala kebanyakan orang, dan lebih baik dijawab sebelum
            ditanyakan. */}
        <Section title={t("landing.why.title")}>
          <Card className="p-8 text-center">
            <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-ink-soft">
              {t("landing.why.body")}
            </p>
            <p className="mx-auto mt-5 max-w-xl font-heading text-lg font-semibold text-ink">
              &ldquo;{t("app.tagline")}&rdquo;
            </p>
          </Card>

          <div className="grid gap-5 sm:grid-cols-3">
            {ALASAN.map((a) => (
              <Card key={a.kunci} className="p-6">
                <span className="mb-4 grid h-11 w-11 place-items-center rounded-pill bg-accent-wash hb-raise-1">
                  <a.icon className="h-5 w-5 text-accent-deep" aria-hidden />
                </span>
                <h3 className="font-heading text-lg font-semibold text-ink">
                  {t(`landing.why.${a.kunci}.title`)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {t(`landing.why.${a.kunci}.desc`)}
                </p>
              </Card>
            ))}
          </div>
        </Section>

        {/*
         * Tiga sumbernya disebutkan terang-terangan.
         *
         * Halaman ini dulu hanya menyebut satu daerah, dan itu membuat
         * sebagian pembaca menyimpulkan aplikasinya bukan untuk mereka sebelum
         * sempat melihat isinya. Ketiganya memang sudah ada di dalam aplikasi
         * sejak awal: pawukon dan wewaran dari wariga, weton dan pangarasan
         * dan pancasuda dari primbon, dan sistem 81 angka untuk nama usaha.
         * Yang disebut sistemnya, bukan sukunya.
         */}
        <Section title={t("landing.roots.title")} lead={t("landing.roots.lead")}>
          <div className="grid gap-5 sm:grid-cols-3">
            {WARISAN.map((w) => (
              <Card key={w.kunci} className="p-6">
                <span className="mb-4 grid h-11 w-11 place-items-center rounded-pill bg-accent-wash hb-raise-1">
                  <w.icon className="h-5 w-5 text-accent-deep" aria-hidden />
                </span>
                <h3 className="font-heading text-lg font-semibold text-ink">
                  {t(`landing.roots.${w.kunci}.title`)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {t(`landing.roots.${w.kunci}.desc`)}
                </p>
              </Card>
            ))}
          </div>
        </Section>

        <Section title={t("landing.how.title")}>
          <div className="grid gap-5 sm:grid-cols-3">
            {LANGKAH.map((l) => (
              <Card key={l.n} className="p-6 text-center">
                <span className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-pill bg-accent-wash hb-raise-1">
                  <l.icon className="h-5 w-5 text-accent-deep" aria-hidden />
                </span>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                  {t("landing.how.step", { n: l.n })}
                </p>
                <h3 className="mt-1 font-heading text-lg font-semibold text-ink">
                  {t(`landing.how.${l.n}.title`)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {t(`landing.how.${l.n}.desc`)}
                </p>
              </Card>
            ))}
          </div>
        </Section>

        <Section title={t("landing.energy.title")} lead={t("landing.energy.lead")}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {KATEGORI.map((k) => (
              <Card key={k} className="flex items-start gap-4 p-6 lg:flex-col lg:gap-3">
                <span
                  aria-hidden
                  className={`mt-0.5 h-8 w-8 shrink-0 rounded-pill hb-raise-1 ${KATEGORI_BG[k]}`}
                />
                <div>
                  <h3 className="font-heading text-lg font-semibold text-ink">
                    {t(`day.${k}`)}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {t(`day.${k}.tagline`)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        <Section title={t("landing.features.title")} lead={t("landing.features.lead")}>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FITUR.map((f) => (
              <Card key={f.kunci} className="p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-pill bg-accent-wash hb-raise-1">
                    <f.icon className="h-5 w-5 text-accent-deep" aria-hidden />
                  </span>
                  <span
                    className={`rounded-pill px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${TINGKAT_GAYA[f.tingkat]}`}
                  >
                    {t(TINGKAT_LABEL[f.tingkat])}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-ink">
                  {t(`landing.f.${f.kunci}.title`)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {t(`landing.f.${f.kunci}.desc`)}
                </p>
              </Card>
            ))}
          </div>
        </Section>

        {/*
         * Kata pelanggan, hanya kalau memang ada.
         *
         * Bagian ini hilang seluruhnya ketika daftarnya kosong, bukan tampil
         * sebagai kartu kosong atau tulisan "belum ada testimoni". Halaman
         * yang mengakui dirinya belum punya pelanggan lebih melemahkan
         * daripada halaman yang memang tidak menyinggungnya.
         *
         * Letaknya sesudah daftar fitur dan sebelum harga, karena di situlah
         * orang berhenti menimbang apa yang didapat dan mulai menimbang
         * apakah ini layak dibayar.
         */}
        {/*
         * Kata pelanggan, hanya kalau memang ada.
         *
         * Bagian ini hilang seluruhnya ketika daftarnya kosong, bukan tampil
         * sebagai deret kosong. Letaknya sesudah daftar fitur dan sebelum
         * harga, karena di situlah orang berhenti menimbang apa yang didapat
         * dan mulai menimbang apakah ini layak dibayar.
         */}
        {TESTIMONI.length > 0 && (
          <Section title={t("landing.voices.title")} lead={t("landing.voices.lead")}>
            <TestimoniSlider />
          </Section>
        )}

        <Section title={t("landing.price.title")} lead={t("landing.price.lead")}>
          {/* Anchor tombol hero. Ditaruh di bagian harga, bukan di tabel
              perbandingan, supaya yang turun mendarat pada angkanya lebih
              dulu dan tabelnya menyusul tepat di bawah. */}
          <div id="promo" className="scroll-mt-8" />

          {/* Batas waktunya diulang di sini, tepat di atas angkanya.
              Pengunjung yang mendarat di halaman ini lewat tautan ke #promo
              tidak pernah melihat pita di hero, dan yang menggulir sampai
              sini sudah melewatinya jauh di atas. */}
          {adaPromo && (
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-sm">
              {sisaRinci && berakhirPromo ? (
                <>
                  <span className="font-medium text-accent-deep">{t("promo.countdown")}</span>
                  <HitungMundur berakhirPada={berakhirPromo} awal={sisaRinci} ringkas />
                </>
              ) : (
                <span className="font-medium text-accent-deep">
                  {sisaPromo <= 1 ? t("promo.endsToday") : t("promo.ends", { n: sisaPromo })}
                </span>
              )}
            </div>
          )}

          {/* Deret ini yang diamati bilah promo untuk tahu kapan dia harus
              menyingkir. Jangkar `#promo` di atas tidak bisa dipakai untuk
              itu: tingginya nol. Lihat catatan di BilahPromo. */}
          <div id={SASARAN} className="grid gap-5 sm:grid-cols-3">
            {paketPromo.map((item) => {
              const p = item.paket;
              const diskon = hematPromo(item, paketPromo);
              const hematRp = nilaiHemat(item, addOn);
              return (
                <Card
                  key={p.id}
                  elevation={p.populer ? 3 : 2}
                  className={`flex flex-col p-7 text-center ${
                    p.populer ? "ring-2 ring-accent-strong/45" : ""
                  }`}
                >
                  <div className="mb-4 flex min-h-6 items-center justify-center gap-2">
                    {p.populer && (
                      <span className="inline-flex items-center gap-1 rounded-pill bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-ink">
                        <Sparkles className="h-2.5 w-2.5" aria-hidden />
                        {t("price.mostPopular")}
                      </span>
                    )}
                    {item.diskonPersen > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-pill bg-guru/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-guru-teks">
                        {t("promo.off", { n: item.diskonPersen })}
                      </span>
                    )}
                  </div>

                  <p className="font-heading text-lg font-semibold text-ink">
                    {teks(p.nama, lang)}
                  </p>

                  {/* Harga asli dicoret di atas harga promo, bukan di
                      sebelahnya: di kartu selebar ini keduanya berdampingan
                      akan membungkus, dan angka yang membungkus terbaca
                      seperti satu angka panjang. */}
                  <p className="mt-3 min-h-5 text-sm text-ink-faint">
                    {item.diskonPersen > 0 ? (
                      <>
                        <span className="sr-only">{t("promo.normalPrice")} </span>
                        <span className="line-through">{rupiah(item.hargaAsli)}</span>
                      </>
                    ) : (
                      ""
                    )}
                  </p>
                  <p className="font-heading text-3xl font-bold text-ink">
                    {rupiah(item.harga)}
                  </p>
                  <p className="mt-1.5 text-xs text-ink-soft">
                    {rupiah(perTahunPromo(item))} {t("price.perYear")}
                  </p>
                  <p className="mt-1 min-h-5 text-xs font-medium text-guru-teks">
                    {diskon > 0 ? t("price.saveShort", { n: diskon }) : ""}
                  </p>

                  {/* Angka hemat dalam rupiah, bukan cuma persen di lencana
                      atas. Persen menjawab "berapa turunnya"; rupiah menjawab
                      "berapa yang tidak jadi saya bayar", dan itu pertanyaan
                      yang sebenarnya sedang ditimbang orangnya. Nilainya
                      sudah termasuk harga bonus yang ikut. */}
                  {hematRp > 0 && (
                    <p className="mt-3 inline-flex items-center gap-1.5 self-center rounded-pill bg-guru/15 px-3 py-1 text-xs font-semibold text-guru-teks">
                      <Gift className="h-3 w-3" aria-hidden />
                      {t("promo.saveTotal", { v: rupiah(hematRp) })}
                    </p>
                  )}

                  {/* Bonus disebut namanya, bukan dihitung jumlahnya.
                      "Plus 2 bonus" tidak memberi tahu apa pun tentang apa
                      yang didapat, dan yang menimbang paket panjang menimbang
                      isinya, bukan angkanya. */}
                  {item.bonusAddOn.length > 0 && (
                    <div className="mt-5 border-t border-border-soft pt-4 text-left">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                        {t("promo.bonusTitle")}
                      </p>
                      <ul className="space-y-1.5">
                        {item.bonusAddOn.map((id) => {
                          const a = addOn.find((x) => x.id === id);
                          if (!a) return null;
                          return (
                            <li key={id} className="flex items-start gap-2 text-xs text-ink">
                              <Check
                                className="mt-0.5 h-3 w-3 shrink-0 text-guru-teks"
                                aria-hidden
                              />
                              <span>
                                {teks(a.nama, lang)}
                                <span className="ml-1.5 text-ink-faint line-through">
                                  {rupiah(a.harga)}
                                </span>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/*
                   * Tiap kartu punya tombolnya sendiri.
                   *
                   * Sebelumnya seluruh bagian harga cuma punya satu tombol di
                   * paling bawah, sesudah tabel perbandingan dan sesudah
                   * daftar add-on, dan bunyinya "Coba gratis". Artinya orang
                   * yang baru saja memutuskan paket mana yang dia mau tidak
                   * punya apa pun untuk ditekan di tempat dia memutuskannya:
                   * dia harus menggulir melewati dua blok lain dulu, dan yang
                   * ditemukannya di sana menawarkan hal yang berbeda.
                   * `mt-auto` menahan tombolnya sejajar di ketiga kartu walau
                   * daftar bonusnya berbeda panjang.
                   */}
                  <div className="mt-auto pt-6">
                    <Link href="/register" className="block">
                      <Button block variant={p.populer ? "promo" : "surface"}>
                        <span className="relative z-10">
                          {adaPromo ? t("promo.take") : t("landing.cta.subscribe")}
                        </span>
                        {p.populer && (
                          <span
                            aria-hidden
                            className="absolute inset-y-0 -left-10 w-12 bg-white/45 blur-[4px] hb-kilau"
                          />
                        )}
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="pt-2">
            <h3 className="mb-2 text-center font-heading text-xl font-bold text-ink">
              {t("landing.compare.title")}
            </h3>
            <p className="mx-auto mb-6 max-w-2xl text-center text-[15px] leading-relaxed text-ink-soft">
              {t("landing.compare.lead")}
            </p>
            <PerbandinganPaket harga={harga} paket={paketPromo} />
          </div>

          {addOn.length > 0 && (
            <div className="mx-auto max-w-2xl">
              <p className="mb-1 text-center text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                {t("price.addonsPublic")}
              </p>
              <p className="mb-4 text-center text-xs text-ink-faint">
                {t("price.addonsPublicHint")}
              </p>
              <ul className="space-y-2.5">
                {addOn.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 rounded-md bg-surface-sunk px-4 py-3.5 hb-sink"
                  >
                    <Check
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-deep"
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">{teks(a.nama, lang)}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                        {teks(a.deskripsi, lang)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium text-ink">{rupiah(a.harga)}</p>
                      <p className="text-[10px] text-ink-faint">
                        {a.sekali ? t("price.oneTimeTag") : t("price.perTerm")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col items-center gap-3 pt-2">
            <TombolDaftar />
            <p className="text-xs text-ink-faint">
              {t("landing.price.trialNote", { n: HARI_TRIAL })}
            </p>
            <p className="text-xs text-ink-faint">{t("landing.price.manual")}</p>
          </div>
        </Section>

        <Section title={t("landing.faq.title")}>
          <div className="mx-auto max-w-2xl space-y-3">
            {FAQ.map((n) => (
              <Card key={n} className="p-6">
                <h3 className="font-heading text-base font-semibold text-ink">
                  {t(`landing.faq.${n}.q`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {t(`landing.faq.${n}.a`)}
                </p>
              </Card>
            ))}
          </div>
        </Section>

        <div className="mx-auto max-w-lg">
          <WhatsAppCard />
        </div>
      </div>

      {/* Bilah melayang: membawa penawarannya ikut turun bersama pembaca di
          halaman sepanjang ini. Bisa ditutup, dan menghilang sendiri begitu
          bagian harga terlihat. Lihat catatan di berkasnya. */}
      {adaPromo && sisaRinci && berakhirPromo && (
        <BilahPromo
          berakhirPada={berakhirPromo}
          awal={sisaRinci}
          hemat={rupiah(hematMaks)}
          diskonMaks={diskonMaks}
        />
      )}

      <footer className="mt-16 flex flex-col items-center gap-1.5 text-center text-xs text-ink-faint">
        <p>
          © {tahun} Hari Baik · {t("landing.footer.tagline")}
        </p>
        <p className="font-medium text-ink-soft">{t("studio.by")}</p>
      </footer>
    </div>
  );
}
