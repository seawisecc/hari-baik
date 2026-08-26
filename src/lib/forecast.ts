import { getWarigaDay, toDateString, type KategoriName, type WarigaDay } from "@/lib/wariga";

export interface HariPerkiraan {
  date: string;
  /** Selisih hari dari hari ini: 0 = hari ini. */
  offset: number;
  wariga: WarigaDay;
  kategori: KategoriName;
}

/** Urutan kualitas untuk memilih hari terbaik/terberat dalam rentang. */
const PERINGKAT: Record<KategoriName, number> = { GURU: 3, RATU: 2, LARA: 1, PATI: 0 };

export function tanggalPlus(dateStr: string, hari: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + hari);
  return toDateString(d);
}

/**
 * Perkiraan `jumlah` hari mulai dari `mulai` (default hari ini).
 * Butuh tanggal lahir: tanpa itu kategori tidak bisa dihitung.
 */
export function buatPerkiraan(
  birthDate: string,
  jumlah = 7,
  mulai: string = toDateString(new Date()),
): HariPerkiraan[] {
  return Array.from({ length: jumlah }, (_, i) => {
    const date = tanggalPlus(mulai, i);
    const wariga = getWarigaDay(date, birthDate);
    return { date, offset: i, wariga, kategori: wariga.kategori!.name };
  });
}

/**
 * Hari terbaik dalam rentang, tidak termasuk hari ini: gunanya untuk
 * merencanakan ke depan, bukan mengulang yang sudah berjalan.
 * Kalau ada seri, yang paling dekat menang.
 */
export function hariTerbaik(perkiraan: HariPerkiraan[]): HariPerkiraan | null {
  const kandidat = perkiraan.filter((h) => h.offset > 0);
  if (kandidat.length === 0) return null;
  return kandidat.reduce((terbaik, h) =>
    PERINGKAT[h.kategori] > PERINGKAT[terbaik.kategori] ? h : terbaik,
  );
}

/** Hari yang paling menuntut kehati-hatian dalam rentang, selain hari ini. */
export function hariTerberat(perkiraan: HariPerkiraan[]): HariPerkiraan | null {
  const kandidat = perkiraan.filter((h) => h.offset > 0);
  if (kandidat.length === 0) return null;
  return kandidat.reduce((terberat, h) =>
    PERINGKAT[h.kategori] < PERINGKAT[terberat.kategori] ? h : terberat,
  );
}

/** Hari raya / purnama / tilem dalam rentang, untuk ditonjolkan. */
export function penandaPenting(
  perkiraan: HariPerkiraan[],
): { date: string; offset: number; label: string }[] {
  const out: { date: string; offset: number; label: string }[] = [];
  for (const h of perkiraan) {
    const w = h.wariga;
    for (const raya of w.hariRayaHindu ?? []) {
      out.push({ date: h.date, offset: h.offset, label: raya });
    }
    if (w.hariLibur) out.push({ date: h.date, offset: h.offset, label: w.hariLibur });
  }
  return out;
}
