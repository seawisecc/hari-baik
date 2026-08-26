/** Kategori siklus personal: hasil pertemuan urip lahir dengan urip hari berjalan. */
export type KategoriName = "GURU" | "RATU" | "LARA" | "PATI";

export interface KategoriHari {
  name: KategoriName;
  /** Label internal (dipakai untuk kelas warna: guru/ratu/lara/pati). */
  color: "guru" | "ratu" | "lara" | "pati";
  label: string;
  uripLahir: number;
  uripHariIni: number;
  total: number;
  sisa: number;
}

export interface WukuInfo {
  name: string;
  index: number;
  /** 0–6, posisi hari di dalam wuku. */
  dayInWuku: number;
}

export interface PatraInfo {
  name: string;
  number: number;
  label: string;
}

export type LunarPhase = "Penanggal" | "Panglong";

export interface LunarInfo {
  phase: LunarPhase;
  /** 1–15 */
  day: number;
}

/** Semua atribut wariga untuk satu tanggal Masehi. */
export interface WarigaDay {
  date: string;
  saptaWara: string;
  pancaWara: string;
  wuku: string;
  triWara: string;
  caturWara: string;
  sadWara: string;
  astaWara: string;
  sangaWara: string;
  dasaWara: string;
  lintang: string;
  watek: string;
  pratima: "Pepet" | "Menga";
  patra: string;
  patraName: string;
  patraNum: number;
  lunarDay: string;
  sasih: string;
  uripSapta: number;
  uripPanca: number;
  uripTotal: number;
  hariLibur: string | null;
  hariRayaHindu: string[] | null;
  isPurnama: boolean;
  isTilem: boolean;
  isGalungan: boolean;
  isKuningan: boolean;
  /** null bila tanggal lahir belum diketahui. */
  kategori: KategoriHari | null;
  dewasaAyu: boolean;
}

/** Ringkasan penanda hari untuk sel kalender: lebih murah daripada WarigaDay penuh. */
export interface DayMarkers {
  isLiburNasional: boolean;
  namaLibur: string | null;
  isHariRayaHindu: boolean;
  namaHariRaya: string[] | null;
  isPurnama: boolean;
  isTilem: boolean;
  statusHari: string | null;
}
