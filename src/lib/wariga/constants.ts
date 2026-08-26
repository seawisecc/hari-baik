/**
 * Konstanta kalender Bali (Pawukon) + epoch referensi.
 * Nilai epoch di-verifikasi terhadap tanggal acuan pada `selftest.ts`.
 */

export interface Wara {
  name: string;
  urip: number;
}

/** Saptawara: siklus 7 hari, diambil langsung dari hari Masehi (Minggu = Redite). */
export const SAPTAWARA: Wara[] = [
  { name: "Redite", urip: 5 },
  { name: "Soma", urip: 4 },
  { name: "Anggara", urip: 3 },
  { name: "Budha", urip: 7 },
  { name: "Wraspati", urip: 8 },
  { name: "Sukra", urip: 6 },
  { name: "Saniscara", urip: 9 },
];

/** Pancawara: siklus 5 hari (pasaran). */
export const PANCAWARA: Wara[] = [
  { name: "Umanis", urip: 5 },
  { name: "Pahing", urip: 9 },
  { name: "Pon", urip: 7 },
  { name: "Wage", urip: 4 },
  { name: "Kliwon", urip: 8 },
];
export const PANCAWARA_EPOCH = "1993-06-30";
export const PANCAWARA_EPOCH_INDEX = 4; // 1993-06-30 = Kliwon

/** Wuku: 30 wuku x 7 hari = siklus 210 hari. */
export const WUKU: string[] = [
  "Sinta",
  "Landep",
  "Ukir",
  "Kulantir",
  "Tolu",
  "Gumbreg",
  "Wariga",
  "Warigadean",
  "Julungwangi",
  "Sungsang",
  "Dunggulan",
  "Kuningan",
  "Langkir",
  "Medangsia",
  "Pujut",
  "Pahang",
  "Krulut",
  "Merakih",
  "Tambir",
  "Medangkungan",
  "Matal",
  "Uye",
  "Menail",
  "Prangbakat",
  "Bala",
  "Ugu",
  "Wayang",
  "Klawu",
  "Dukut",
  "Watugunung",
];
/** Hari ke-0 dari wuku Sinta. Siklus pawukon dihitung dari sini. */
export const PAWUKON_EPOCH = "1993-06-27";

/** Triwara: siklus 3 hari, diturunkan dari posisi dalam pawukon. */
export const TRIWARA = ["Pasah", "Beteng", "Kajeng"] as const;

/** Caturwara: siklus 4 hari. */
export const CATURWARA = ["Sri", "Laba", "Jaya", "Menala"] as const;

/** Sadwara: siklus 6 hari, punya urip sendiri (dipakai di perhitungan petemon). */
export const SADWARA = ["Tungleh", "Aryang", "Urukung", "Paniron", "Was", "Maulu"] as const;
export const SADWARA_URIP: Record<string, number> = {
  Tungleh: 7,
  Aryang: 6,
  Urukung: 5,
  Paniron: 8,
  Was: 9,
  Maulu: 3,
};
export const SADWARA_EPOCH = "1993-06-30";
export const SADWARA_EPOCH_INDEX = 3;

/** Astawara: siklus 8 hari. */
export const ASTAWARA = [
  "Sri",
  "Indra",
  "Guru",
  "Yama",
  "Ludra",
  "Brahma",
  "Kala",
  "Uma",
] as const;

/** Sangawara: siklus 9 hari. */
export const SANGAWARA = [
  "Dangu",
  "Jangur",
  "Gigis",
  "Nohan",
  "Ogan",
  "Erangan",
  "Urungan",
  "Tulus",
  "Dadi",
] as const;

/** Dasawara: dipilih dari jumlah urip Saptawara + Pancawara. */
export const DASAWARA = [
  "Pandita",
  "Pati",
  "Suka",
  "Duka",
  "Sri",
  "Manuh",
  "Manusa",
  "Raja",
  "Dewa",
  "Raksasa",
] as const;

/** Lintang: 35 lintang, siklus dari posisi pawukon. */
export const LINTANG: string[] = [
  "Gajah",
  "Kiriman",
  "Jongsarad",
  "Ula",
  "Kelapa",
  "Kukus",
  "Asu",
  "Kartika",
  "Naga",
  "Angsa Angrem",
  "Panah",
  "Patrem",
  "Lembu",
  "Depat",
  "Sangkatikel",
  "Salah Ukur",
  "Perahu Pegat",
  "Puwuh Atarung",
  "Gajah Mina",
  "Lumbung",
  "Kumba",
  "Udang",
  "Begoong",
  "Tiwa-Tiwa",
  "Sugenge",
  "Pepet",
  "Pegelangan",
  "Kala",
  "Yuyu",
  "Lawe",
  "Kelapa Sungsang",
  "Ikan",
  "Magelut",
  "Tunggak Semi",
  "Bade",
];

/** Watek: gabungan watek Pancawara (madya) dan Saptawara (alit). */
export const WATEK_PANCAWARA: Record<string, string> = {
  Umanis: "Bhuta",
  Pahing: "Singa",
  Pon: "Gajah",
  Wage: "Watu",
  Kliwon: "Wong",
};
export const WATEK_SAPTAWARA: Record<string, string> = {
  Redite: "Lembu",
  Soma: "Uler",
  Anggara: "Lembu",
  Budha: "Lintah",
  Wraspati: "Lelipi",
  Sukra: "Gajah",
  Saniscara: "Kuda",
};

/** Offset pawukon → Pratiti / Patra (Mintuna Rasi). */
export const PATRA_OFFSET = 13;

/** Referensi bulan baru astronomis untuk perhitungan penanggal/panglong & sasih. */
export const NEW_MOON_EPOCH_MS = Date.UTC(2000, 0, 6, 18, 14, 0);
export const SYNODIC_MONTH_DAYS = 29.530588853;

export const SASIH: string[] = [
  "Kasa",
  "Karo",
  "Katiga",
  "Kapat",
  "Kalima",
  "Kanem",
  "Kapitu",
  "Kaulu",
  "Kasanga",
  "Kadasa",
  "Jyestha",
  "Sadha",
];
/**
 * Acuan tahun Saka: Nyepi 2026, yaitu Penanggal 1 sasih Kadasa, awal Saka 1948.
 * Semua penamaan sasih dihitung maju atau mundur dari titik ini.
 */
export const SAKA_ACUAN = { tanggal: "2026-03-19", tahun: 1948 } as const;

/**
 * Sisa bagi tahun Saka terhadap 19 yang menandai adanya bulan sisipan.
 *
 * Kalender Saka luni-solar: tahun candra lebih pendek sekitar 11 hari dari
 * tahun surya, jadi tiap sekitar tiga tahun satu sasih dilipat agar namanya
 * tetap sejajar musim. Ini siklus Metonik: 19 tahun surya sama dengan 235
 * bulan lunar, yaitu 19 x 12 ditambah 7 sisipan. Tiga di Jyestha ditambah
 * empat di Sadha tepat berjumlah tujuh, jadi aturannya konsisten dengan
 * astronominya, bukan sekadar daftar angka.
 *
 * Sisipan hanya diletakkan di dua sasih terakhir tahun Saka, karena keduanya
 * secara tradisional tidak dipakai untuk pedewasaan upacara besar.
 */
export const NAMPIH_JYESTHA = new Set([6, 11, 0]);
export const NAMPIH_SADHA = new Set([3, 8, 14, 16]);

/** Awalan untuk bulan sisipan, mis. "Mala Sadha". */
export const AWALAN_MALA = "Mala";

export const MS_PER_DAY = 86_400_000;

/**
 * Ambang penanggal→panglong. Sengaja dibulatkan ke 14.765 (bukan
 * SYNODIC_MONTH_DAYS / 2) supaya hasilnya identik dengan versi aplikasi
 * sebelumnya: selisihnya hanya ~25 detik, tapi cukup untuk menggeser
 * satu hari di kasus batas.
 */
export const HALF_SYNODIC = 14.765;
