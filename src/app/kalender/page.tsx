"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { DayDetail } from "@/components/calendar/DayDetail";
import { Legend } from "@/components/calendar/Legend";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { LangToggle } from "@/components/ui/LangToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLang } from "@/lib/content/LangProvider";
import { useBirthDate } from "@/lib/useBirthDate";
import { toDateString } from "@/lib/wariga";

export default function KalenderPage() {
  const { birthDate, setBirthDate, loaded } = useBirthDate();
  const { lang } = useLang();
  const today = toDateString(new Date());
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selected, setSelected] = useState(today);
  const [draft, setDraft] = useState("");

  const shiftMonth = (delta: number) => {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(
    lang === "en" ? "en-GB" : "id-ID",
    { month: "long", year: "numeric" },
  );

  if (!loaded) {
    return <main className="mx-auto max-w-2xl px-6 py-16 text-ink-faint">Memuat…</main>;
  }

  if (!birthDate) {
    return (
      <main className="mx-auto max-w-md px-6 py-20">
        <Card elevation={3}>
          <CardHeader>
            <CardTitle>Isi tanggal lahir</CardTitle>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              Kalender siklus dihitung dari tanggal lahirmu, jadi ini harus diisi
              lebih dulu.
            </p>
          </CardHeader>
          <CardBody>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (draft) setBirthDate(draft);
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="lahir">Tanggal lahir Masehi</Label>
                <Input
                  id="lahir"
                  type="date"
                  value={draft}
                  max={today}
                  onChange={(e) => setDraft(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" block disabled={!draft}>
                Mulai
              </Button>
            </form>
          </CardBody>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-bold italic text-ink">Hari Baik</h1>
        <div className="flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
        </div>
      </header>

      <Card elevation={2}>
        <CardBody className="pt-6">
          <div className="mb-5 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => shiftMonth(-1)}
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="font-heading text-lg font-semibold capitalize text-ink">
              {monthLabel}
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => shiftMonth(1)}
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <CalendarGrid
            year={cursor.year}
            month={cursor.month}
            birthDate={birthDate}
            selected={selected}
            onSelect={setSelected}
          />

          <div className="mt-6 border-t border-border-soft pt-5">
            <Legend />
          </div>
        </CardBody>
      </Card>

      <DayDetail date={selected} birthDate={birthDate} />

      <p className="pt-2 text-center text-xs text-ink-faint">
        Tanggal lahir: {birthDate} ·{" "}
        <button
          onClick={() => setBirthDate(null)}
          className="underline underline-offset-2 hover:text-ink-soft"
        >
          ubah
        </button>
      </p>
    </main>
  );
}
