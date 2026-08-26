"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { getDayMarkers, getKategoriHari, toDateString, type KategoriName } from "@/lib/wariga";

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const TONE: Record<KategoriName, string> = {
  GURU: "bg-guru",
  RATU: "bg-ratu",
  LARA: "bg-lara",
  PATI: "bg-pati",
};

export interface CalendarDay {
  date: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  kategori: KategoriName | null;
  isPurnama: boolean;
  isTilem: boolean;
  isLibur: boolean;
  isRaya: boolean;
}

/**
 * Bangun grid 6×7 untuk satu bulan, termasuk hari pinggiran dari bulan
 * sebelah supaya baris selalu penuh dan tinggi kalender tidak berubah-ubah
 * saat ganti bulan.
 */
export function buildMonth(
  year: number,
  month: number,
  birthDate: string | null,
  today: string,
): CalendarDay[] {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const date = toDateString(d);
    const markers = getDayMarkers(date, birthDate);
    return {
      date,
      day: d.getDate(),
      inMonth: d.getMonth() === month,
      isToday: date === today,
      kategori: birthDate ? getKategoriHari(birthDate, date).name : null,
      isPurnama: markers.isPurnama,
      isTilem: markers.isTilem,
      isLibur: markers.isLiburNasional,
      isRaya: markers.isHariRayaHindu,
    };
  });
}

interface Props {
  year: number;
  month: number;
  birthDate: string | null;
  selected: string | null;
  onSelect: (date: string) => void;
}

export function CalendarGrid({ year, month, birthDate, selected, onSelect }: Props) {
  const today = toDateString(new Date());
  const days = useMemo(
    () => buildMonth(year, month, birthDate, today),
    [year, month, birthDate, today],
  );

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1.5">
        {HARI.map((h) => (
          <div key={h} className="py-1 text-center text-[11px] font-medium text-ink-faint">
            {h}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const isSelected = d.date === selected;
          return (
            <button
              key={d.date}
              onClick={() => onSelect(d.date)}
              aria-pressed={isSelected}
              aria-label={d.date}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center gap-1 rounded-md",
                "transition-[box-shadow,background-color] duration-150",
                d.inMonth ? "bg-surface" : "bg-transparent",
                isSelected
                  ? "bg-surface-sunk hb-sink"
                  : d.inMonth
                    ? "hb-raise-1 hover:hb-raise-2"
                    : "",
                !d.inMonth && "opacity-40",
              )}
            >
              <span
                className={cn(
                  "text-[13px] leading-none",
                  d.isToday ? "font-bold text-ink" : "font-medium text-ink-soft",
                  d.isLibur && d.inMonth && "text-error",
                )}
              >
                {d.day}
              </span>

              {/* Titik kategori: penanda utama, selalu dirender bila
                  tanggal lahir sudah diketahui. */}
              {d.kategori && (
                <span
                  aria-hidden
                  className={cn("h-1.5 w-1.5 rounded-full", TONE[d.kategori])}
                />
              )}

              {/* Purnama/Tilem di pojok, tidak boleh menutupi titik kategori. */}
              {(d.isPurnama || d.isTilem) && (
                <span
                  aria-hidden
                  title={d.isPurnama ? "Purnama" : "Tilem"}
                  className={cn(
                    "absolute right-1 top-1 h-1.5 w-1.5 rounded-full border",
                    d.isPurnama
                      ? "border-ink-faint bg-surface"
                      : "border-ink-faint bg-ink-faint",
                  )}
                />
              )}

              {/* Hari raya Hindu ditandai garis tipis di bawah. */}
              {d.isRaya && d.inMonth && (
                <span
                  aria-hidden
                  className="absolute bottom-1 h-0.5 w-3 rounded-full bg-accent-strong"
                />
              )}

              {d.isToday && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-inset ring-accent-strong/50"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
