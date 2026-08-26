import { getLunar, getSasihInfo, pancawaraName, saptawaraName, wukuName } from "./pawukon";

/**
 * Hari raya Hindu Bali yang bisa dihitung.
 *
 * Sebagian besar hari raya jatuh pada pertemuan wara dan wuku tertentu, atau
 * pada fase bulan di sasih tertentu. Semuanya bisa diturunkan, jadi tidak
 * perlu ditulis manual tiap tahun dan tidak bisa salah ketik.
 *
 * Yang TIDAK ada di sini: libur nasional, karena tanggalnya ditetapkan lewat
 * SKB pemerintah dan tidak mengikuti aturan apa pun yang bisa dihitung.
 */

/** Galungan: Budha Kliwon wuku Dunggulan, tiap 210 hari. */
export const isGalungan = (t: string) =>
  saptawaraName(t) === "Budha" && pancawaraName(t) === "Kliwon" && wukuName(t) === "Dunggulan";

/** Kuningan: Saniscara Kliwon wuku Kuningan, sepuluh hari setelah Galungan. */
export const isKuningan = (t: string) =>
  saptawaraName(t) === "Saniscara" &&
  pancawaraName(t) === "Kliwon" &&
  wukuName(t) === "Kuningan";

/** Saraswati: Saniscara Umanis wuku Watugunung, hari turunnya ilmu pengetahuan. */
export const isSaraswati = (t: string) =>
  saptawaraName(t) === "Saniscara" &&
  pancawaraName(t) === "Umanis" &&
  wukuName(t) === "Watugunung";

/** Pagerwesi: Budha Kliwon wuku Sinta, empat hari setelah Saraswati. */
export const isPagerwesi = (t: string) =>
  saptawaraName(t) === "Budha" && pancawaraName(t) === "Kliwon" && wukuName(t) === "Sinta";

/**
 * Nyepi: Penanggal 1 sasih Kadasa, tahun baru Saka.
 *
 * Sasih dicocokkan lewat nama dasarnya, bukan nama tampil, supaya bulan
 * sisipan tidak pernah keliru terbaca sebagai bulan aslinya. Kadasa memang
 * tidak pernah dilipat, tapi mencocokkan dasar membuat aturan ini tetap benar
 * kalau nanti ada hari raya lain yang jatuh di Jyestha atau Sadha.
 */
export const isNyepi = (t: string) => {
  const l = getLunar(t);
  const s = getSasihInfo(t);
  return l.phase === "Penanggal" && l.day === 1 && s.dasar === "Kadasa" && !s.mala;
};

/**
 * Siwaratri: purwaning tilem, yaitu Panglong 14 sasih Kapitu, malam sebelum
 * bulan mati. Malam perenungan, jatuh sekali dalam setahun Saka.
 */
export const isSiwaratri = (t: string) => {
  const l = getLunar(t);
  const s = getSasihInfo(t);
  return l.phase === "Panglong" && l.day === 14 && s.dasar === "Kapitu" && !s.mala;
};

function geser(t: string, hari: number): string {
  const d = new Date(t + "T12:00:00");
  d.setDate(d.getDate() + hari);
  return d.toISOString().slice(0, 10);
}

/** Hari raya yang posisinya ditentukan relatif terhadap hari raya lain. */
const TURUNAN: { nama: string; dari: (t: string) => boolean; selisih: number }[] = [
  { nama: "Penampahan Galungan", dari: isGalungan, selisih: -1 },
  { nama: "Manis Galungan", dari: isGalungan, selisih: 1 },
  { nama: "Manis Kuningan", dari: isKuningan, selisih: 1 },
  { nama: "Tawur Agung Kesanga", dari: isNyepi, selisih: -1 },
  { nama: "Ngembak Geni", dari: isNyepi, selisih: 1 },
];

const UTAMA: { nama: string; uji: (t: string) => boolean }[] = [
  { nama: "Hari Raya Galungan", uji: isGalungan },
  { nama: "Hari Raya Kuningan", uji: isKuningan },
  { nama: "Hari Raya Saraswati", uji: isSaraswati },
  { nama: "Hari Raya Pagerwesi", uji: isPagerwesi },
  { nama: "Hari Suci Nyepi", uji: isNyepi },
  { nama: "Hari Suci Siwa Ratri", uji: isSiwaratri },
];

/**
 * Semua hari raya Hindu yang jatuh pada satu tanggal.
 * Satu tanggal bisa memuat lebih dari satu, mis. Purnama yang bertepatan
 * dengan Galungan.
 */
export function hariRayaTerhitung(t: string): string[] {
  const hasil = UTAMA.filter((h) => h.uji(t)).map((h) => h.nama);

  for (const d of TURUNAN) {
    // Diperiksa mundur: tanggal ini turunan bila hari acuannya jatuh pada
    // jarak yang ditentukan.
    if (d.dari(geser(t, -d.selisih))) hasil.push(d.nama);
  }

  return hasil;
}
