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
  /**
   * Boleh atau tidaknya pelanggan membayar lewat transfer manual.
   *
   * Dimatikan setelah gateway berjalan, supaya tidak ada lagi antrean
   * konfirmasi yang harus diperiksa admin satu per satu. Tetap bisa
   * dihidupkan lagi tanpa deploy, karena yang paling mungkin membutuhkannya
   * adalah keadaan yang tidak bisa ditunggu: gateway sedang bermasalah dan
   * ada orang yang ingin membayar sekarang.
   */
  transferManual: boolean;
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
        id: "Simpan sampai 12 anggota keluarga, lalu lihat kategori hari dan weton masing-masing dalam satu halaman.",
        en: "Save up to 12 family members, then see each one's day category and weton on a single page.",
      },
      sekali: false,
      aktif: true, // fiturnya sudah ada di /keluarga
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
      aktif: true, // fiturnya sudah ada di /pencari-hari
    },
    {
      id: "laporan-pdf",
      harga: 60_000,
      nama: { id: "Laporan Lengkap PDF", en: "Full PDF Report" },
      deskripsi: {
        id: "Identitas kelahiran, watak, perjalanan hidup, dan makna nama dalam satu lembar siap cetak atau disimpan sebagai PDF.",
        en: "Birth identity, traits, life journey, and name meaning on one sheet, ready to print or save as PDF.",
      },
      sekali: true,
      aktif: true, // fiturnya sudah ada di /laporan
    },
    {
      id: "fengshui-nama",
      harga: 70_000,
      nama: { id: "Fengshui Nama Usaha", en: "Business Name Fengshui" },
      deskripsi: {
        id: "Timbang nama usaha dan nama produk dengan sistem 81 angka: bandingkan sampai enam kandidat sekaligus, lalu lihat kata mana yang memperbaiki yang belum pas.",
        en: "Weigh business and product names with the 81-number system: compare up to six candidates at once, then see which word improves the ones that fall short.",
      },
      sekali: true,
      aktif: true, // fiturnya sudah ada di /fengshui-nama
    },
  ],
  // Bawaannya hidup. Aplikasi ini sudah menerima transfer manual jauh sebelum
  // ada gateway, jadi bawaan yang mematikannya akan mencabut satu-satunya cara
  // membayar pada pemasangan mana pun yang kunci Midtrans-nya belum diisi.
  transferManual: true,
  diperbaruiPada: null,
  diperbaruiOleh: null,
};

/**
 * Jalur pembayaran mana yang boleh ditampilkan.
 *
 * Aturan yang sebenarnya cuma satu, dan itu bukan soal preferensi admin:
 * halaman langganan tidak boleh pernah kehabisan cara membayar. Kalau gateway
 * mati (kunci belum dipasang, atau salah pasang) sementara transfer manual
 * sudah dimatikan admin, yang tersisa adalah halaman berisi daftar harga dan
 * tidak satu pun tombol untuk membelinya. Itu jalan buntu yang tidak terlihat
 * seperti kerusakan, jadi tidak ada yang melaporkannya; yang terjadi cuma
 * orang pergi.
 *
 * Karena itu transfer manual dipaksa hidup ketika gateway tidak aktif, apa
 * pun isi pengaturannya. Saklar admin menentukan apa yang diinginkan, fungsi
 * ini menentukan apa yang aman.
 */
export function jalurBayar(k: { midtransAktif: boolean; transferDiizinkan: boolean }): {
  midtrans: boolean;
  transfer: boolean;
} {
  return {
    midtrans: k.midtransAktif,
    transfer: k.transferDiizinkan || !k.midtransAktif,
  };
}

/**
 * Gabungkan katalog add-on di kode dengan pengaturan yang tersimpan admin.
 *
 * Tanpa ini, add-on baru tidak akan pernah bisa dijual. Pengaturan harga
 * disimpan sebagai satu dokumen utuh di Firestore, dan daftar `addOn` di sana
 * menimpa daftar bawaan seluruhnya. Artinya begitu dokumen itu pernah
 * tersimpan sekali, add-on yang ditambahkan di kode tidak muncul di halaman
 * harga, dan juga tidak muncul di panel admin, karena panelnya membaca dari
 * sumber yang sama. Admin jadi tidak punya cara apa pun untuk menghidupkannya.
 *
 * Aturannya: yang sudah diatur admin menang (harga, nama, aktif), yang belum
 * pernah diatur ikut dengan nilai bawaannya. Id yang hanya ada di Firestore
 * tetap dibawa, bukan dibuang, supaya add-on lama yang sudah dihapus dari kode
 * masih terlihat di panel dan bisa dibersihkan di sana. Kesiapan fiturnya
 * diperiksa terpisah lewat addon-registry, jadi yang lama itu tetap tidak
 * bisa aktif.
 */
export function gabungAddOn(tersimpan: AddOn[] | undefined | null): AddOn[] {
  const dariAdmin = new Map((tersimpan ?? []).map((a) => [a.id, a]));
  const hasil = HARGA_BAWAAN.addOn.map((bawaan) => dariAdmin.get(bawaan.id) ?? bawaan);
  const dikenal = new Set(HARGA_BAWAAN.addOn.map((a) => a.id));
  for (const a of dariAdmin.values()) {
    if (!dikenal.has(a.id)) hasil.push(a);
  }
  return hasil;
}

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
