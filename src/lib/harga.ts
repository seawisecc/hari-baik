import type { Lang } from "@/lib/content/i18n";

/** Teks yang punya versi dua bahasa. */
export interface Dwibahasa {
  id: string;
  en: string;
}

export interface PaketLangganan {
  /** Stabil, dipakai sebagai kunci. Jangan diubah setelah dipakai. */
  id: string;
  /** Lama berlaku dalam tahun. Menentukan tanggal habis saat diaktifkan. */
  tahun: number;
  /** Rupiah penuh, tanpa desimal. */
  harga: number;
  nama: Dwibahasa;
  /** Ditonjolkan di daftar harga. Hanya satu yang sebaiknya diberi tanda. */
  populer: boolean;
  aktif: boolean;
}

export interface AddOn {
  id: string;
  harga: number;
  nama: Dwibahasa;
  deskripsi: Dwibahasa;
  /** true bila dibayar sekali, false bila mengikuti masa langganan. */
  sekali: boolean;
  aktif: boolean;
}

export interface PengaturanHarga {
  paket: PaketLangganan[];
  addOn: AddOn[];
  diperbaruiPada: string | null;
  diperbaruiOleh: string | null;
}

/**
 * Harga bawaan.
 *
 * Tangga diskonnya sengaja tidak terlalu curam. Diskon 10% dan 20% cukup
 * terasa untuk mendorong komitmen lebih panjang, tapi tidak sampai membuat
 * paket satu tahun terlihat seperti pilihan yang salah; paket setahun tetap
 * pintu masuk yang wajar bagi yang belum yakin.
 *
 * Angkanya dibulatkan ke puluhan ribu supaya mudah disebut dan mudah
 * ditransfer.
 */
export const HARGA_BAWAAN: PengaturanHarga = {
  paket: [
    {
      id: "tahunan",
      tahun: 1,
      harga: 150_000,
      nama: { id: "1 Tahun", en: "1 Year" },
      populer: false,
      aktif: true,
    },
    {
      id: "dua-tahun",
      tahun: 2,
      harga: 270_000, // Rp 135.000 per tahun, hemat 10%
      nama: { id: "2 Tahun", en: "2 Years" },
      populer: true,
      aktif: true,
    },
    {
      id: "tiga-tahun",
      tahun: 3,
      harga: 360_000, // Rp 120.000 per tahun, hemat 20%
      nama: { id: "3 Tahun", en: "3 Years" },
      populer: false,
      aktif: true,
    },
  ],
  addOn: [
    {
      id: "profil-keluarga",
      harga: 75_000,
      nama: { id: "Profil Keluarga", en: "Family Profiles" },
      deskripsi: {
        id: "Tambah sampai 4 anggota keluarga, lengkap dengan kalender siklus dan kepribadian masing-masing.",
        en: "Add up to 4 family members, each with their own cycle calendar and personality reading.",
      },
      sekali: false,
      aktif: false,
    },
    {
      id: "cari-hari-acara",
      harga: 50_000,
      nama: { id: "Pencari Hari Acara", en: "Event Day Finder" },
      deskripsi: {
        id: "Pilih rentang tanggal, lalu lihat hari paling mendukung untuk pernikahan, pembukaan usaha, atau perjalanan.",
        en: "Pick a date range and see the most supportive days for a wedding, a business opening, or travel.",
      },
      sekali: false,
      aktif: false,
    },
    {
      id: "pengingat-whatsapp",
      harga: 40_000,
      nama: { id: "Pengingat Harian WhatsApp", en: "Daily WhatsApp Reminder" },
      deskripsi: {
        id: "Ringkasan energi hari ini dikirim ke WhatsApp setiap pagi.",
        en: "A summary of today's energy sent to WhatsApp every morning.",
      },
      sekali: false,
      aktif: false,
    },
    {
      id: "laporan-pdf",
      harga: 60_000,
      nama: { id: "Laporan Lengkap PDF", en: "Full PDF Report" },
      deskripsi: {
        id: "Rangkuman kepribadian, perjalanan hidup, dan makna nama dalam satu berkas siap cetak.",
        en: "Personality, life journey, and name meaning gathered into one printable file.",
      },
      sekali: true,
      aktif: false,
    },
  ],
  diperbaruiPada: null,
  diperbaruiOleh: null,
};

/** "Rp 150.000". Tanpa desimal: rupiah tidak memakainya dalam praktik. */
export function rupiah(nilai: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(nilai);
}

/** Harga per tahun, dibulatkan; dipakai untuk menunjukkan penghematan. */
export function perTahun(paket: PaketLangganan): number {
  return Math.round(paket.harga / paket.tahun);
}

/**
 * Penghematan terhadap paket satu tahun, dalam persen bulat.
 * Mengembalikan 0 bila tidak ada acuan atau tidak ada penghematan.
 */
export function hemat(paket: PaketLangganan, semua: PaketLangganan[]): number {
  const acuan = semua.find((p) => p.tahun === 1);
  if (!acuan || paket.tahun === 1) return 0;
  const selisih = 1 - perTahun(paket) / perTahun(acuan);
  return selisih > 0 ? Math.round(selisih * 100) : 0;
}

export const teks = (t: Dwibahasa, lang: Lang) => t[lang] ?? t.id;
