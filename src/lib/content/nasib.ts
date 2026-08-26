/**
 * Perjalanan hidup: peta rejeki & kesehatan per periode usia 6-tahunan.
 *
 * Matriks dibaca dengan kolom = urip lahir − 7. Urip lahir hanya bisa
 * bernilai 7–18 (Saptawara 3–9 + Pancawara 4–9), jadi kolom selalu 0–11.
 * Entri `null` berarti periode itu tidak dipetakan untuk urip tersebut.
 */

export type NasibTone = "accent" | "guru" | "ratu" | "lara" | "pati";

/** Rentang [usiaMin, usiaMax] tiap periode. */
const PERIODE_USIA: [number, number][] = [
  [0, 6],
  [7, 12],
  [13, 18],
  [19, 24],
  [25, 30],
  [31, 36],
  [37, 42],
  [43, 48],
  [49, 54],
  [55, 60],
  [61, 66],
  [67, 72],
  [73, 78],
  [79, 84],
  [85, 90],
  [91, 96],
  [97, 102],
  [103, 108],
];

/** 18 periode × 12 kolom urip. */
const PERIODE_NILAI: (number | null)[][] = [
  [4, 4, 2, 1, 2, 0, 0, 1, 2, 0, 1, 2],
  [1, 1, 2, 0, 4, 5, 1, 0, 0, 3, 1, 5],
  [4, 0, 1, 4, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 1, 0, 1, 1, 0, 5, 4, 1, 2, 5, 0],
  [0, 0, 4, 1, 8, 4, 0, 4, 5, 0, 0, 5],
  [2, 3, 1, 3, 1, 0, 1, 0, 2, 1, 1, 1],
  [0, 0, 4, 0, 0, 1, 1, 1, 0, 3, 1, 4],
  [null, 7, 0, 0, 1, 0, 5, 4, 1, 1, 5, 0],
  [null, null, 7, 4, 2, 1, 2, 1, 2, 2, 2, 1],
  [null, null, null, 4, 0, 4, 0, 4, 5, 1, 0, 4],
  [null, null, null, null, 2, 4, 1, 4, 5, 2, 1, 4],
  [null, null, null, null, null, 0, 2, 1, 1, 0, 2, 0],
  [null, null, null, null, null, null, 5, 1, 0, 1, 5, 0],
  [null, null, null, null, null, null, null, 0, 4, 1, 5, 2],
  [null, null, null, null, null, null, null, null, 4, 0, 1, 1],
  [null, null, null, null, null, null, null, null, null, 2, 0, 4],
  [null, null, null, null, null, null, null, null, null, null, 4, 0],
  [null, null, null, null, null, null, null, null, null, null, null, 0],
];

export const NASIB_LABEL: Record<number, { label: string; tone: NasibTone }> = {
  "0": {
    label: "Masa Ujian",
    tone: "pati",
  },
  "1": {
    label: "Tumbuh Perlahan",
    tone: "lara",
  },
  "2": {
    label: "Stabil Berkembang",
    tone: "lara",
  },
  "3": {
    label: "Masa Baik",
    tone: "guru",
  },
  "4": {
    label: "Masa Cerah",
    tone: "guru",
  },
  "5": {
    label: "Masa Suka Cita",
    tone: "ratu",
  },
  "7": {
    label: "Masa Berlimpah",
    tone: "accent",
  },
  "8": {
    label: "Masa Puncak",
    tone: "accent",
  },
};

export const NASIB_REJEKI: Record<number, string> = {
  "0": "Periode ini mengajakmu untuk memperkuat diri dari dalam. Ujian terberat sering kali adalah guru terbaik. Fokus pada kesehatan, doa, dan menabung karma baik.",
  "1": "Rezeki mengalir dalam takaran yang cukup. Ini adalah waktu yang baik untuk membangun kebiasaan keuangan yang sehat dan bersyukur atas yang ada.",
  "2": "Kondisi yang cukup dan stabil: fondasi terbaik untuk bertumbuh. Gunakan periode ini untuk membangun dan memperluas apa yang sudah ada.",
  "3": "Energi dan rezeki mengalir dengan baik. Manfaatkan momentum ini untuk hal-hal yang sudah lama ingin kamu wujudkan.",
  "4": "Periode penuh dukungan: rezeki, kesehatan, dan kondisi umum cenderung menguntungkan. Bergeraklah dengan percaya diri.",
  "5": "Ketenangan dan kebahagiaan hadir dalam periode ini. Nikmati, bagikan, dan jadikan ini bahan bakar untuk memberi lebih banyak ke orang sekitarmu.",
  "7": "Kelimpahan dalam berbagai bentuk hadir di periode ini. Gunakan dengan bijak: rezeki yang disyukuri dan dibagi cenderung terus bertumbuh.",
  "8": "Ini adalah periode terbaik dalam siklus hidupmu. Ambil langkah-langkah besar yang sudah lama kamu persiapkan. Puncak dicapai bukan hanya dengan kerja keras, tapi juga dengan syukur.",
};

export const NASIB_SARAN: Record<number, string> = {
  "0": "Prioritaskan kesehatan fisik dan mental. Hindari keputusan besar yang berisiko tinggi.",
  "1": "Bijak mengelola pengeluaran. Fokus membangun fondasi sebelum berekspansi.",
  "2": "Waktu yang baik untuk memulai proyek kecil yang konsisten. Jaga stabilitas yang sudah ada.",
  "3": "Gunakan momentum ini. Mulai hal yang sudah lama kamu tunda.",
  "4": "Berani ambil langkah lebih besar. Energi mendukung usaha dan pertumbuhan.",
  "5": "Bagikan kebahagiaan ini. Investasi dalam hubungan dan kenangan indah.",
  "7": "Kelola kelimpahan dengan bijak. Sisihkan untuk masa depan dan berbagi.",
  "8": "Ini saatnya. Wujudkan mimpi terbesar yang sudah kamu persiapkan.",
};

export interface PeriodeHidup {
  ageMin: number;
  ageMax: number;
  /** null bila kombinasi urip × periode tidak terpetakan. */
  value: number | null;
  label: string | null;
  tone: NasibTone | null;
  rejeki: string | null;
  saran: string | null;
}

export function petaPerjalananHidup(uripLahir: number): PeriodeHidup[] {
  const kolom = uripLahir - 7;
  const valid = kolom >= 0 && kolom < 12;
  return PERIODE_USIA.map(([ageMin, ageMax], i) => {
    const value = valid ? PERIODE_NILAI[i][kolom] : null;
    const meta = value !== null ? NASIB_LABEL[value] : undefined;
    return {
      ageMin,
      ageMax,
      value,
      label: meta?.label ?? null,
      tone: meta?.tone ?? null,
      rejeki: value !== null ? (NASIB_REJEKI[value] ?? null) : null,
      saran: value !== null ? (NASIB_SARAN[value] ?? null) : null,
    };
  });
}

/** Usia penuh pada tanggal `pada` (default: hari ini). */
export function hitungUsia(tanggalLahir: string, pada: Date = new Date()): number {
  const lahir = new Date(tanggalLahir + "T12:00:00");
  let usia = pada.getFullYear() - lahir.getFullYear();
  const selisihBulan = pada.getMonth() - lahir.getMonth();
  if (selisihBulan < 0 || (selisihBulan === 0 && pada.getDate() < lahir.getDate())) usia -= 1;
  return usia;
}

/** Index periode yang sedang dijalani, atau -1 bila di luar rentang. */
export function periodeSaatIni(periode: PeriodeHidup[], usia: number): number {
  return periode.findIndex((p) => usia >= p.ageMin && usia <= p.ageMax);
}
