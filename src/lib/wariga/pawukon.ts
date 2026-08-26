import {
  ASTAWARA,
  ASTAWARA_EPOCH,
  ASTAWARA_EPOCH_INDEX,
  CATURWARA,
  CATURWARA_EPOCH,
  CATURWARA_EPOCH_INDEX,
  DASAWARA,
  LINTANG,
  MS_PER_DAY,
  NEW_MOON_EPOCH_MS,
  PANCAWARA,
  PANCAWARA_EPOCH,
  PANCAWARA_EPOCH_INDEX,
  PATRA_OFFSET,
  PAWUKON_EPOCH,
  SADWARA,
  SADWARA_EPOCH,
  SADWARA_EPOCH_INDEX,
  SADWARA_URIP,
  SANGAWARA,
  SANGAWARA_EPOCH,
  SAPTAWARA,
  SASIH,
  SASIH_OFFSET,
  SYNODIC_MONTH_DAYS,
  HALF_SYNODIC,
  TRIWARA,
  WATEK_PANCAWARA,
  WATEK_SAPTAWARA,
  WUKU,
  type Wara,
} from "./constants";
import type { LunarInfo, PatraInfo, WukuInfo } from "./types";

/**
 * Semua perhitungan memakai string tanggal "YYYY-MM-DD" dan aritmetika UTC,
 * supaya bebas dari zona waktu dan DST: satu tanggal selalu memberi hasil
 * yang sama di perangkat manapun.
 */

function toUTC(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Selisih hari penuh antara dua tanggal. */
function daysBetween(a: string, b: string): number {
  return Math.round((toUTC(a) - toUTC(b)) / MS_PER_DAY);
}

/** Modulo yang selalu mengembalikan hasil non-negatif. */
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ── Wara ──────────────────────────────────────────────────────────────────

export function getSaptawara(dateStr: string): Wara {
  const [y, m, d] = dateStr.split("-").map(Number);
  return SAPTAWARA[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}
export const saptawaraName = (dateStr: string) => getSaptawara(dateStr).name;

export function getPancawara(dateStr: string): Wara {
  return PANCAWARA[mod(daysBetween(dateStr, PANCAWARA_EPOCH) + PANCAWARA_EPOCH_INDEX, 5)];
}
export const pancawaraName = (dateStr: string) => getPancawara(dateStr).name;

/** Posisi hari (0–209) di dalam siklus pawukon. */
export function pawukonIndex(dateStr: string): number {
  return mod(daysBetween(dateStr, PAWUKON_EPOCH), 210);
}

export function getWuku(dateStr: string): WukuInfo {
  const i = pawukonIndex(dateStr);
  return {
    name: WUKU[Math.floor(i / 7)],
    index: Math.floor(i / 7),
    dayInWuku: i % 7,
  };
}
export const wukuName = (dateStr: string) => getWuku(dateStr).name;

export function getTriwara(dateStr: string): string {
  return TRIWARA[pawukonIndex(dateStr) % 3];
}

export function getCaturwara(dateStr: string): string {
  return CATURWARA[mod(daysBetween(dateStr, CATURWARA_EPOCH) + CATURWARA_EPOCH_INDEX, 4)];
}

export function getSadwara(dateStr: string): string {
  return SADWARA[mod(daysBetween(dateStr, SADWARA_EPOCH) + SADWARA_EPOCH_INDEX, 6)];
}

export function getAstawara(dateStr: string): string {
  return ASTAWARA[mod(daysBetween(dateStr, ASTAWARA_EPOCH) + ASTAWARA_EPOCH_INDEX, 8)];
}

export function getSangawara(dateStr: string): string {
  return SANGAWARA[mod(daysBetween(dateStr, SANGAWARA_EPOCH), 9)];
}

/** Dasawara dipilih dari total urip Saptawara + Pancawara. */
export function getDasawara(dateStr: string): string {
  return DASAWARA[(getSaptawara(dateStr).urip + getPancawara(dateStr).urip) % 10];
}

// ── Turunan ───────────────────────────────────────────────────────────────

export function getLintang(dateStr: string): string {
  return LINTANG[pawukonIndex(dateStr) % 35];
}

/** Urip Sadwara: komponen tambahan khusus perhitungan petemon. */
export function uripSadwara(dateStr: string): number {
  return SADWARA_URIP[getSadwara(dateStr)] ?? 0;
}

/** Pratima: hari genap dalam pawukon = Pepet, ganjil = Menga. */
export function getPratima(dateStr: string): "Pepet" | "Menga" {
  return pawukonIndex(dateStr) % 2 === 0 ? "Pepet" : "Menga";
}

export function getWatek(dateStr: string): string {
  const madya = WATEK_PANCAWARA[pancawaraName(dateStr)] ?? "-";
  const alit = WATEK_SAPTAWARA[saptawaraName(dateStr)] ?? "-";
  return `${madya} - ${alit}`;
}

export function getPatra(dateStr: string): PatraInfo {
  const i = mod(pawukonIndex(dateStr) + PATRA_OFFSET, 30);
  return { name: WUKU[i], number: i + 1, label: `Mintuna Rasi ke-${i + 1}` };
}

/** Total urip hari: dasar perhitungan kategori siklus personal. */
export function uripHari(dateStr: string): number {
  return getSaptawara(dateStr).urip + getPancawara(dateStr).urip;
}

// ── Sasih & fase bulan ────────────────────────────────────────────────────

/**
 * Penanggal (bulan membesar) / Panglong (bulan mengecil), masing-masing 1–15,
 * dihitung dari umur bulan sinodis terhadap bulan baru referensi.
 */
export function getLunar(dateStr: string): LunarInfo {
  const [y, m, d] = dateStr.split("-").map(Number);
  const age = mod(
    (Date.UTC(y, m - 1, d, 12, 0, 0) - NEW_MOON_EPOCH_MS) / MS_PER_DAY,
    SYNODIC_MONTH_DAYS,
  );
  const half = HALF_SYNODIC;
  if (age < half) {
    return { phase: "Penanggal", day: Math.min(Math.floor(age / (half / 15)) + 1, 15) };
  }
  const rest = age - half;
  return { phase: "Panglong", day: Math.min(Math.floor(rest / (half / 15)) + 1, 15) };
}

export function lunarLabel(dateStr: string): string {
  const l = getLunar(dateStr);
  return `${l.phase} ${l.day}`;
}

/**
 * Sasih: bulan dalam kalender Bali.
 *
 * Dihitung dengan `floor`, bukan `round`. Sasih ditentukan oleh bulan lunar
 * yang sedang berjalan, yaitu berapa kali bulan baru sudah terlewati, jadi
 * yang dibutuhkan adalah bagian bulatnya, bukan yang terdekat.
 *
 * Dulu di sini memakai `round`, dan itu keliru untuk separuh kalender. Pada
 * hari-hari Panglong umur bulannya sudah lewat setengah siklus, sehingga
 * pembulatan melompat ke bulan berikutnya dan namanya berganti di tengah
 * bulan. Akibatnya Siwaratri, yang jatuh pada Panglong 14, terbaca sasih
 * Kaulu padahal seharusnya Kapitu.
 *
 * Kesalahannya bisa dilihat tanpa acuan luar sama sekali: dengan `round`,
 * nama sasih berganti dua kali dalam satu bulan lunar, dan jarak dari
 * Panglong 14 ke Penanggal 1 Kadasa yang 61 hari itu mustahil kalau bulannya
 * benar-benar Kaulu. Uji di hariraya.test.ts menjaga keduanya.
 */
export function getSasih(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const noon = Date.UTC(y, m - 1, d, 12, 0, 0);
  const lunations = Math.floor((noon - NEW_MOON_EPOCH_MS) / MS_PER_DAY / SYNODIC_MONTH_DAYS);
  return SASIH[mod(lunations - SASIH_OFFSET, 12)];
}

export function isPurnama(dateStr: string): boolean {
  const l = getLunar(dateStr);
  return l.phase === "Penanggal" && l.day === 15;
}

export function isTilem(dateStr: string): boolean {
  const l = getLunar(dateStr);
  return l.phase === "Panglong" && l.day === 15;
}
