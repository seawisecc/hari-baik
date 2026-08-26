/**
 * Tanggal yang ditetapkan pemerintah lewat SKB, bukan diturunkan dari
 * kalender manapun. Ini satu-satunya bagian yang memang harus ditambah
 * tiap tahun.
 */

/**
 * Hari raya Hindu yang belum punya rumus.
 *
 * Kosong untuk sekarang: Galungan, Kuningan, Saraswati, Pagerwesi, Nyepi,
 * Siwaratri, Purnama, dan Tilem semuanya dihitung di `hariraya.ts`, beserta
 * hari-hari turunannya seperti Penampahan, Manis, Tawur Agung, dan Ngembak
 * Geni.
 *
 * Isi di sini hanya bila ada hari raya yang benar-benar tidak bisa
 * diturunkan dari pawukon maupun sasih.
 */
export const HARI_RAYA_HINDU: Record<string, string> = {};

export const LIBUR_NASIONAL: Record<string, string> = {
  "2026-01-01": "Tahun Baru 2026 Masehi",
  "2026-01-16": "Isra Mikraj Nabi Muhammad S.A.W.",
  "2026-02-17": "Tahun Baru Imlek 2576 Kongzili",
  "2026-03-19": "Hari Suci Nyepi (Tahun Baru Saka 1948)",
  "2026-03-21": "Idulfitri 1447 Hijriah",
  "2026-03-22": "Idulfitri 1447 Hijriah (Hari Kedua)",
  "2026-04-03": "Wafat Yesus Kristus",
  "2026-04-05": "Kebangkitan Yesus Kristus (Paskah)",
  "2026-05-01": "Hari Buruh Internasional",
  "2026-05-14": "Kenaikan Yesus Kristus",
  "2026-05-27": "Iduladha 1447 Hijriah",
  "2026-05-31": "Hari Raya Waisak 2570 BE",
  "2026-06-01": "Hari Lahir Pancasila",
  "2026-06-16": "Tahun Baru Islam 1448 Hijriah",
  "2026-08-17": "Proklamasi Kemerdekaan RI",
  "2026-08-25": "Maulid Nabi Muhammad S.A.W.",
  "2026-12-25": "Kelahiran Yesus Kristus (Natal)",
};

/** Tahun terakhir yang sudah punya data libur. Dipakai untuk memberi peringatan di admin. */
export const HOLIDAY_DATA_UNTIL = 2027;
