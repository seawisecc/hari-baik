"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Input, Label } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-heading text-xl font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

const KATEGORI = [
  {
    key: "guru",
    nama: "Hari Mengalir",
    tagline: "Energi mendukung, langkah terasa ringan.",
    cls: "bg-guru",
  },
  {
    key: "ratu",
    nama: "Hari Tenang",
    tagline: "Stabil dan produktif: jalankan yang sudah dimulai.",
    cls: "bg-ratu",
  },
  {
    key: "lara",
    nama: "Hari Mawas",
    tagline: "Kurangi tergesa, perbanyak pertimbangan.",
    cls: "bg-lara",
  },
  {
    key: "pati",
    nama: "Hari Istirahat",
    tagline: "Hari terbaik untuk memulihkan diri.",
    cls: "bg-pati",
  },
];

export default function StyleguidePage() {
  const [tab, setTab] = useState("Kalender");
  const [filter, setFilter] = useState(true);

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 space-y-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold text-ink">Styleguide</h1>
          <p className="mt-1 text-ink-soft">Hari Baik: sistem desain</p>
        </div>
        <ThemeToggle />
      </header>

      <Section title="Color Tokens">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {[
            { label: "Accent", cls: "bg-accent" },
            { label: "Surface", cls: "bg-surface" },
            { label: "Sunk", cls: "bg-surface-sunk" },
            { label: "Canvas", cls: "bg-canvas" },
          ].map((s) => (
            <div key={s.label} className="space-y-2 text-center">
              <div className={`aspect-square rounded-xl hb-raise-2 ${s.cls}`} />
              <p className="text-sm font-medium text-ink">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {KATEGORI.map((k) => (
            <div key={k.key} className="space-y-2 text-center">
              <div className={`aspect-square rounded-xl hb-raise-2 ${k.cls}`} />
              <p className="text-sm font-medium text-ink">{k.nama}</p>
              <p className="text-xs text-ink-faint">{k.key.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <Card className="space-y-4 p-7">
          <p className="font-heading text-5xl font-bold text-ink">Display</p>
          <p className="font-heading text-3xl font-semibold text-ink">Heading</p>
          <p className="text-lg text-ink">Body large: teks paragraf utama.</p>
          <p className="text-[15px] text-ink-soft">Body: teks pendukung.</p>
          <p className="text-sm text-ink-faint">Caption: keterangan kecil.</p>
        </Card>
      </Section>

      <Section title="Elevation">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {([1, 2, 3, 4] as const).map((lvl) => (
            <Card key={lvl} elevation={lvl} className="grid h-24 place-items-center">
              <span className="text-sm text-ink-soft">Level {lvl}</span>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Aksi Utama</Button>
          <Button variant="surface">Sekunder</Button>
          <Button variant="ghost">Tersier</Button>
          <Button variant="danger">Hapus</Button>
          <Button disabled>Nonaktif</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Inputs">
        <div className="space-y-2">
          <Label htmlFor="sg-date">Tanggal lahir</Label>
          <Input id="sg-date" type="date" />
        </div>
        <div className="relative">
          <Input placeholder="Cari hari baik…" className="pr-12" aria-label="Cari" />
          <Search
            className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
            aria-hidden
          />
        </div>
      </Section>

      <Section title="Chips">
        <div className="flex flex-wrap gap-2.5">
          <Chip selected={filter} onClick={() => setFilter((v) => !v)}>
            Hari Mengalir
          </Chip>
          <Chip>Purnama</Chip>
          <Chip>Tilem</Chip>
          <Chip disabled>Nonaktif</Chip>
        </div>
      </Section>

      <Section title="Tabs">
        <div
          role="tablist"
          className="inline-flex gap-1 rounded-pill bg-surface-sunk p-1 hb-sink"
        >
          {["Hari Ini", "Kalender", "Profil"].map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-pill px-5 py-2 text-sm font-medium transition-[box-shadow,background-color] duration-150 ${
                tab === t
                  ? "bg-accent text-accent-ink hb-raise-1"
                  : "text-ink-faint hover:text-ink-soft"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Alerts">
        <div className="space-y-3">
          <Alert tone="success">Langganan berhasil diaktifkan.</Alert>
          <Alert tone="warning">Trial berakhir dalam 2 hari.</Alert>
          <Alert tone="error">Tanggal lahir belum diisi.</Alert>
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid gap-5 sm:grid-cols-2">
          {KATEGORI.slice(0, 2).map((k) => (
            <Card key={k.key}>
              <CardHeader className="flex items-center gap-3">
                <span className={`h-9 w-9 rounded-pill hb-raise-1 ${k.cls}`} aria-hidden />
                <CardTitle>{k.nama}</CardTitle>
              </CardHeader>
              <CardBody>
                <p className="text-sm leading-relaxed text-ink-soft">{k.tagline}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}
