"use client";

import {
  ArrowRight,
  CalendarDays,
  Heart,
  Route,
  Sparkles,
  Star,
  Sun,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LangToggle } from "@/components/ui/LangToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { WhatsAppCard } from "@/components/WhatsAppCard";
import { useT } from "@/lib/content/LangProvider";

const LANGKAH = [
  { icon: UserPlus, title: "Daftar", desc: "Buat akun gratis dalam hitungan detik." },
  { icon: CalendarDays, title: "Isi tanggal lahir", desc: "Masukkan tanggal lahir Masehi-mu." },
  { icon: Sun, title: "Lihat kalender siklus", desc: "Ketahui energi personalmu tiap hari." },
];

const FITUR = [
  {
    icon: CalendarDays,
    title: "Kalender energi harian",
    desc: "Kategori energi setiap hari, dihitung dari siklus kelahiranmu.",
  },
  {
    icon: Sparkles,
    title: "Makna nama",
    desc: "Analisis nama berdasarkan aksara Bali dan energi yang dikandungnya.",
  },
  {
    icon: Heart,
    title: "Kecocokan pasangan",
    desc: "Hitung petemon lanang istri dari dua tanggal lahir.",
  },
  {
    icon: Route,
    title: "Perjalanan hidup",
    desc: "Peta siklus rejeki dan kesehatan dari lahir hingga usia senja.",
  },
];

const KATEGORI = ["guru", "ratu", "lara", "pati"] as const;
const KATEGORI_BG: Record<(typeof KATEGORI)[number], string> = {
  guru: "bg-guru",
  ratu: "bg-ratu",
  lara: "bg-lara",
  pati: "bg-pati",
};

const TESTIMONI = [
  {
    teks: "Sangat membantu saya merencanakan acara penting. Sekarang saya tahu hari terbaik untuk ambil keputusan besar.",
    nama: "Komang A.",
  },
  {
    teks: "Fitur Petemon-nya akurat banget. Saya pakai sebelum mempertimbangkan calon pasangan.",
    nama: "Wayan S.",
  },
  {
    teks: "Panduan harian memberi saya arah yang jelas setiap pagi.",
    nama: "Ni Luh M.",
  },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <h2 className="text-center font-heading text-2xl font-bold text-ink sm:text-3xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function LandingPage() {
  const t = useT();

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 sm:px-8">
      <header className="flex items-center justify-between gap-3 py-6">
        <p className="font-heading text-xl font-bold italic text-ink">Hari Baik</p>
        <div className="flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
          <Link href="/login">
            <Button variant="surface" size="sm">
              Masuk
            </Button>
          </Link>
        </div>
      </header>

      <section className="py-16 text-center sm:py-28">
        <h1 className="font-heading text-5xl font-bold italic text-ink sm:text-7xl">
          Hari Baik
        </h1>
        <p className="mx-auto mt-6 max-w-xl font-heading text-lg font-semibold text-ink sm:text-2xl">
          &ldquo;{t("app.tagline")}&rdquo;
        </p>
        <p className="mx-auto mt-4 max-w-lg leading-relaxed text-ink-soft">
          {t("app.subtitle")} Temukan waktu terbaik untuk setiap keputusan hidupmu.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link href="/register">
            <Button size="lg">
              Daftar di sini: gratis 3 hari
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
          <p className="text-xs italic text-ink-faint">
            Tanpa kartu kredit. Coba gratis 3 hari.
          </p>
        </div>
      </section>

      <div className="space-y-24">
        <Section title="Cara kerja kalender siklus personal">
          <div className="grid gap-5 sm:grid-cols-3">
            {LANGKAH.map((l, i) => (
              <Card key={l.title} className="p-6 text-center">
                <span className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-pill bg-accent-wash hb-raise-1">
                  <l.icon className="h-5 w-5 text-accent-deep" aria-hidden />
                </span>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                  Langkah {i + 1}
                </p>
                <h3 className="mt-1 font-heading text-lg font-semibold text-ink">{l.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{l.desc}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section title={t("energy")}>
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

        <Section title="Fitur unggulan">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FITUR.map((f) => (
              <Card key={f.title} className="p-6">
                <span className="mb-4 grid h-11 w-11 place-items-center rounded-pill bg-accent-wash hb-raise-1">
                  <f.icon className="h-5 w-5 text-accent-deep" aria-hidden />
                </span>
                <h3 className="font-heading text-lg font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Apa kata mereka">
          <div className="grid gap-4 lg:grid-cols-3">
            {TESTIMONI.map((tm) => (
              <Card key={tm.nama} className="p-6">
                <div className="mb-2 flex gap-0.5" aria-hidden>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-lara text-lara" />
                  ))}
                </div>
                <p className="text-[15px] italic leading-relaxed text-ink-soft">
                  &ldquo;{tm.teks}&rdquo;
                </p>
                <p className="mt-auto pt-3 text-sm font-medium text-ink">{tm.nama}</p>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Harga terjangkau">
          <Card elevation={3} className="mx-auto max-w-lg p-10 text-center">
            <p className="font-heading text-4xl font-bold text-ink">Rp 150.000</p>
            <p className="mt-1.5 text-sm text-ink-soft">per tahun · ≈ Rp 12.500 per bulan</p>
            <p className="mt-4 text-sm text-ink-soft">
              Akses penuh semua fitur Pro selama setahun.
            </p>
            <p className="mt-2 text-xs text-ink-faint">
              ✓ Trial gratis 3 hari · tanpa kartu kredit
            </p>
            <Link href="/register" className="mt-6 inline-block">
              <Button size="lg">
                Daftar di sini: gratis 3 hari
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
          </Card>
        </Section>

        <div className="mx-auto max-w-lg">
          <WhatsAppCard />
        </div>
      </div>

      <footer className="mt-16 text-center text-xs text-ink-faint">
        © {new Date().getFullYear()} Hari Baik · Kalender Siklus Personal
      </footer>
    </div>
  );
}
