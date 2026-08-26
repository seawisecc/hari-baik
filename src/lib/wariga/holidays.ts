/**
 * Hari libur nasional & hari raya Hindu Bali yang tanggalnya tidak bisa
 * diturunkan murni dari perhitungan (mengikuti SKB / penetapan tahunan).
 *
 * Galungan, Kuningan, Purnama, dan Tilem TIDAK perlu didaftarkan di sini;
 * semuanya dihitung otomatis di `dewasa.ts`. Tabel ini hanya untuk tanggal
 * yang ditetapkan, dan perlu ditambah tiap tahun.
 */

export const HARI_RAYA_HINDU: Record<string, string> = {
  "2026-01-17": "Hari Suci Siwa Ratri",
  "2026-03-18": "Tawur Agung Kesanga",
  "2026-03-19": "Hari Suci Nyepi (Tahun Baru Saka 1948)",
  "2026-03-20": "Ngembak Geni",
  "2026-04-04": "Hari Raya Saraswati",
  "2026-04-08": "Hari Raya Pagerwesi",
  "2026-06-17": "Hari Raya Galungan",
  "2026-06-18": "Manis Galungan",
  "2026-06-27": "Hari Raya Kuningan",
  "2026-10-31": "Hari Raya Saraswati",
  "2026-11-04": "Hari Raya Pagerwesi",
  "2027-01-06": "Hari Suci Siwa Ratri",
  "2027-01-14": "Hari Raya Galungan",
  "2027-01-15": "Manis Galungan",
  "2027-01-24": "Hari Raya Kuningan",
  "2027-03-07": "Tawur Agung Kesanga",
  "2027-03-08": "Hari Suci Nyepi (Tahun Baru Saka 1949)",
  "2027-03-09": "Ngembak Geni",
  "2027-05-29": "Hari Raya Saraswati",
  "2027-06-02": "Hari Raya Pagerwesi",
  "2027-08-12": "Hari Raya Galungan",
  "2027-08-13": "Manis Galungan",
  "2027-08-22": "Hari Raya Kuningan",
};

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
