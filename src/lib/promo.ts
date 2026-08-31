import type { PaketLangganan, PengaturanHarga } from "@/lib/harga";

/**
 * Promo berjangka: potongan harga dan bonus add-on per paket.
 *
 * Dipisah dari daftar harga, bukan ditulis ulang ke `harga` tiap paket,
 * karena harga aslinya harus tetap ada. Yang mendorong orang mengambil paket
 * bukan angka yang murah, melainkan angka murah di sebelah angka yang dicoret:
 * tanpa harga asli yang tersimpan, tidak ada yang bisa dicoret, dan begitu
 * promonya lewat tidak ada nilai untuk dikembalikan.
 *
 * Semua fungsi di sini murni dan dipakai dua sisi sekaligus: halaman depan,
 * halaman langganan, route `/api/bayar`, dan route `/api/aktivasi`. Harga
 * promo yang cuma benar di layar adalah cara tercepat menagih orang lebih
 * mahal daripada yang dijanjikan kepadanya.
 */

/**
 * Add-on yang ikut gratis bersama tiap paket.
 *
 * Ada di kode, bukan di pengaturan harga, dengan alasan yang sama persis
 * seperti `addon-registry`: ini pernyataan tentang isi produk, dan yang
 * tersimpan di Firestore akan beku pada nilai saat pertama kali admin menekan
 * simpan. Dokumen harga disimpan utuh, jadi daftar yang tersimpan menimpa
 * daftar di kode seluruhnya, dan bonus yang ditambahkan belakangan di sini
 * tidak akan pernah muncul. Yang boleh diatur admin cuma saklarnya: promo
 * jalan atau tidak, sampai kapan, dan berapa persen.
 *
 * Paket yang tidak disebut di sini tetap boleh dapat potongan, hanya tanpa
 * bonus.
 */
export const PROMO_BONUS: Record<string, string[]> = {
  "dua-tahun": ["cari-hari-acara"],
  "tiga-tahun": ["cari-hari-acara", "profil-keluarga"],
};

/** Potongan untuk satu paket. Bonusnya tidak di sini, lihat PROMO_BONUS. */
export interface PromoPaket {
  paketId: string;
  /** Potongan dalam persen bulat. */
  diskonPersen: number;
}

export interface PengaturanPromo {
  aktif: boolean;
  /**
   * ISO. Lewat saat ini, harga kembali normal dengan sendirinya.
   *
   * Null berarti promo mati, bukan berlaku selamanya. Arah bawaan itu
   * disengaja: promo yang kehilangan tanggal berakhirnya adalah persis bentuk
   * kesalahan yang pernah terjadi di sini, yaitu harga uji Rp 1.000 yang
   * ditinggalkan di produksi karena tidak ada apa pun yang mengingatkan untuk
   * mengembalikannya. Promo tanpa batas waktu juga bukan promo lagi, cuma
   * harga baru yang tidak pernah diputuskan siapa-siapa.
   */
  berakhirPada: string | null;
  paket: PromoPaket[];
}

/** Batas atas potongan. Salah ketik 100 akan membuat paket jadi gratis. */
export const DISKON_MAKS = 90;

/**
 * Promo bawaan.
 *
 * Tangganya menanjak dua arah sekaligus: potongannya makin besar DAN bonusnya
 * makin banyak. Yang membuat paket tiga tahun terasa jauh lebih berharga bukan
 * selisih lima persen dari paket dua tahun, melainkan add-on kedua yang ikut.
 */
export const PROMO_BAWAAN: PengaturanPromo = {
  aktif: true,
  berakhirPada: "2026-09-30T23:59:59+08:00",
  paket: [
    { paketId: "tahunan", diskonPersen: 10 },
    { paketId: "dua-tahun", diskonPersen: 20 },
    { paketId: "tiga-tahun", diskonPersen: 25 },
  ],
};

/** Promo sedang berjalan pada saat ini? */
export function promoBerlaku(
  promo: PengaturanPromo | null | undefined,
  sekarang: Date = new Date(),
): boolean {
  if (!promo?.aktif || !promo.berakhirPada) return false;
  const batas = Date.parse(promo.berakhirPada);
  return Number.isFinite(batas) && batas > sekarang.getTime();
}

/**
 * Sisa hari promo, dibulatkan ke atas. Null bila promo tidak berjalan.
 *
 * Dibulatkan ke atas supaya hari terakhir tertulis "1 hari lagi", bukan
 * "0 hari lagi" yang terbaca seperti sudah lewat padahal masih bisa dibeli.
 */
export function sisaHariPromo(
  promo: PengaturanPromo | null | undefined,
  sekarang: Date = new Date(),
): number | null {
  if (!promoBerlaku(promo, sekarang)) return null;
  const selisih = Date.parse(promo!.berakhirPada!) - sekarang.getTime();
  return Math.max(1, Math.ceil(selisih / 86_400_000));
}

/** Aturan promo untuk satu paket, atau null bila paket itu tidak ikut promo. */
export function promoUntuk(
  paketId: string,
  promo: PengaturanPromo | null | undefined,
  sekarang: Date = new Date(),
): PromoPaket | null {
  if (!promoBerlaku(promo, sekarang)) return null;
  const p = promo!.paket.find((x) => x.paketId === paketId);
  return p && p.diskonPersen > 0 ? p : null;
}

/**
 * Bulatkan ke bawah ke ribuan terdekat.
 *
 * Ke bawah, bukan ke terdekat: pembulatan ke atas berarti pelanggan membayar
 * sedikit lebih mahal daripada persen yang tertulis di halaman, dan selisih
 * seribu rupiah tidak sepadan dengan angka di layar yang tidak cocok dengan
 * angka di tagihan.
 */
export function bulatkanHarga(nilai: number): number {
  return Math.max(0, Math.floor(nilai / 1000) * 1000);
}

/** Satu paket berikut keadaan promonya. Bentuk ini yang dipakai tampilan. */
export interface PaketPromo {
  paket: PaketLangganan;
  /** Harga sebelum potongan. Sama dengan `harga` bila tidak ada promo. */
  hargaAsli: number;
  /** Yang benar-benar ditagih. */
  harga: number;
  diskonPersen: number;
  /** Id add-on yang ikut gratis. Sudah disaring: yang tidak dijual dibuang. */
  bonusAddOn: string[];
}

/**
 * Hitung harga yang berlaku untuk satu paket.
 *
 * Selalu mengembalikan bentuk yang sama, baik ada promo maupun tidak, supaya
 * pemanggilnya tidak perlu bercabang. Tanpa promo, `harga` sama dengan
 * `hargaAsli` dan `diskonPersen` nol.
 *
 * `bolehDijual` menentukan bonus mana yang benar-benar boleh dijanjikan.
 * Bawaannya menerima semuanya karena sebagian besar pemanggil sudah menerima
 * daftar harga yang lewat `bacaHarga()`, dan di sana penyaringannya sudah
 * dikerjakan; pemanggil yang membangun daftarnya sendiri wajib mengisinya.
 */
export function hargaPromo(
  paket: PaketLangganan,
  promo: PengaturanPromo | null | undefined,
  sekarang: Date = new Date(),
  bolehDijual: (id: string) => boolean = () => true,
): PaketPromo {
  const aturan = promoUntuk(paket.id, promo, sekarang);
  if (!aturan) {
    return {
      paket,
      hargaAsli: paket.harga,
      harga: paket.harga,
      diskonPersen: 0,
      bonusAddOn: [],
    };
  }
  const persen = Math.min(DISKON_MAKS, Math.max(0, Math.round(aturan.diskonPersen)));
  const harga = bulatkanHarga((paket.harga * (100 - persen)) / 100);
  return {
    paket,
    hargaAsli: paket.harga,
    // Tidak pernah lebih mahal daripada harga aslinya, apa pun isi pengaturan.
    harga: Math.min(harga, paket.harga),
    diskonPersen: persen,
    bonusAddOn: (PROMO_BONUS[paket.id] ?? []).filter(bolehDijual),
  };
}

/** Fungsi kesiapan jual yang dipakai bersama daftar harga hasil `bacaHarga()`. */
export function bonusBolehDijual(harga: PengaturanHarga): (id: string) => boolean {
  const dijual = new Set(harga.addOn.filter((a) => a.aktif).map((a) => a.id));
  return (id) => dijual.has(id);
}

/** Semua paket aktif berikut promonya, urut seperti di daftar harga. */
export function daftarPaketPromo(
  harga: PengaturanHarga,
  sekarang: Date = new Date(),
): PaketPromo[] {
  const boleh = bonusBolehDijual(harga);
  return harga.paket
    .filter((p) => p.aktif)
    .map((p) => hargaPromo(p, harga.promo, sekarang, boleh));
}

/** Harga per tahun berdasarkan yang benar-benar dibayar. */
export function perTahunPromo(item: PaketPromo): number {
  return Math.round(item.harga / item.paket.tahun);
}

/**
 * Hemat per tahun terhadap paket satu tahun, dalam persen bulat.
 *
 * Memakai harga yang benar-benar dibayar, bukan harga asli. Menghitungnya dari
 * harga asli akan membuat lencana "Hemat 20%" tetap tertulis 20% padahal
 * dengan promo penghematannya sudah 33%: angka yang meremehkan penawarannya
 * sendiri, dan angka yang tidak cocok dengan harga di sebelahnya.
 */
export function hematPromo(item: PaketPromo, semua: PaketPromo[]): number {
  const acuan = semua.find((x) => x.paket.tahun === 1);
  if (!acuan || item.paket.tahun === 1) return 0;
  const selisih = 1 - perTahunPromo(item) / perTahunPromo(acuan);
  return selisih > 0 ? Math.round(selisih * 100) : 0;
}

/**
 * Gabungkan saklar promo tersimpan dengan bawaan di kode.
 *
 * Alasannya sama persis dengan `gabungAddOn()`: pengaturan harga disimpan
 * sebagai satu dokumen utuh, jadi dokumen yang tersimpan sebelum promo ada
 * tidak membawa field ini sama sekali dan harus jatuh ke bawaan. Yang
 * tersimpan menang bila ada, karena tanggal dan persennya adalah keputusan
 * admin. Bonusnya tidak ikut digabung: ia tidak pernah disimpan.
 */
export function gabungPromo(tersimpan: PengaturanPromo | undefined | null): PengaturanPromo {
  if (!tersimpan || !Array.isArray(tersimpan.paket)) return PROMO_BAWAAN;
  return {
    aktif: Boolean(tersimpan.aktif),
    berakhirPada: tersimpan.berakhirPada ?? null,
    paket: tersimpan.paket.map((p) => ({
      paketId: p.paketId,
      diskonPersen: Math.min(DISKON_MAKS, Math.max(0, Math.round(p.diskonPersen || 0))),
    })),
  };
}

/**
 * Buang potongan untuk paket yang sudah tidak dijual.
 *
 * Aturan promo yang menunjuk paket yang dihapus atau dinonaktifkan admin tidak
 * merusak apa pun, tapi ia tertinggal di dokumen dan akan menyala kembali
 * tanpa diminta pada hari paket itu dihidupkan lagi.
 */
export function saringPromo(promo: PengaturanPromo, paketAktif: string[]): PengaturanPromo {
  const ada = new Set(paketAktif);
  return { ...promo, paket: promo.paket.filter((p) => ada.has(p.paketId)) };
}
