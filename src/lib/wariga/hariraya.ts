import { getLunar, getSasih, pancawaraName, saptawaraName, wukuName } from "./pawukon";

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

/*
 * BATAS PENTING untuk dua hari raya yang bergantung pada sasih.
 *
 * Galungan, Kuningan, Saraswati, dan Pagerwesi ditentukan siklus pawukon 210
 * hari, yang murni hitungan dan tepat selamanya. Nyepi dan Siwaratri berbeda:
 * keduanya ditentukan sasih, dan sasih di mesin ini belum lengkap.
 *
 * Kalender Saka itu luni-solar. Ada bulan sisipan, nampih sasih, kira-kira
 * tiap tiga tahun, supaya nama bulan tetap sejajar musim. Mesin ini menghitung
 * sasih sebagai 12 bulan lunar berputar tanpa sisipan, jadi namanya meleset
 * sekitar 11 hari setiap tahun dan bergeser satu bulan penuh tiap tiga tahun.
 *
 * Terlihat jelas pada Penanggal 1 di bulan Maret, yang seharusnya selalu
 * Kadasa karena Nyepi selalu jatuh di bulan Maret:
 *
 *   2025 Kadasa    2026 Kadasa    2027 Kadasa
 *   2028 Jyestha   2031 Sadha     2033 Kasa
 *
 * Karena itu keduanya dibatasi pada rentang yang sudah diverifikasi. Di luar
 * rentang ini aplikasi tidak menampilkan apa pun, bukan menampilkan tanggal
 * yang salah: pengguna memakai aplikasi ini untuk memilih hari, jadi hari raya
 * yang keliru lebih merugikan daripada hari raya yang tidak muncul.
 *
 * Untuk mencabut batas ini dibutuhkan aturan nampih sasih, atau satu tanggal
 * acuan Nyepi per tahun Saka. Keduanya harus datang dari sumber yang paham
 * kalender Bali, bukan ditebak dari pola.
 */
const SASIH_TERVERIFIKASI = { dari: "2025-01-01", sampai: "2027-12-31" } as const;

const sasihTepercaya = (t: string) =>
  t >= SASIH_TERVERIFIKASI.dari && t <= SASIH_TERVERIFIKASI.sampai;

/** Nyepi: Penanggal 1 sasih Kadasa, tahun baru Saka. */
export const isNyepi = (t: string) => {
  if (!sasihTepercaya(t)) return false;
  const l = getLunar(t);
  return l.phase === "Penanggal" && l.day === 1 && getSasih(t) === "Kadasa";
};

/**
 * Siwaratri: purwaning tilem, yaitu Panglong 14 sasih Kapitu, malam sebelum
 * bulan mati. Malam perenungan, jatuh sekali dalam setahun Saka.
 *
 * Aturannya sekarang ditulis persis seperti sumber tradisional. Sebelumnya
 * ditulis "Kaulu" untuk mengakali `getSasih` yang keliru membulatkan; setelah
 * getSasih diperbaiki, tanggal yang dihasilkan tetap sama dan namanya menjadi
 * benar.
 */
export const isSiwaratri = (t: string) => {
  if (!sasihTepercaya(t)) return false;
  const l = getLunar(t);
  return l.phase === "Panglong" && l.day === 14 && getSasih(t) === "Kapitu";
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
