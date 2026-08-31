import type { PengaturanHarga } from "@/lib/harga";
import type { PaketPromo } from "@/lib/promo";

/**
 * Merakit isi satu pesanan dari id yang dikirim klien.
 *
 * Fungsi murni, dipakai `/api/bayar` dan `/api/aktivasi` sekaligus, dengan
 * alasan yang sama seperti `alasanTolak()` dan `jalurBayar()`: dua jalur
 * pembayaran yang menghitung sendiri-sendiri akan berbeda suatu hari, dan
 * yang menanggung selisihnya adalah orang yang sudah mengirim uangnya.
 *
 * Yang datang dari peramban hanya id. Nominalnya dirakit di sini dari daftar
 * harga yang dibaca server, termasuk potongan promonya, jadi tidak ada
 * kombinasi masukan yang bisa membuat seseorang membayar angka lain.
 */

/** Satu baris pesanan, bentuk yang sama dengan yang disimpan di dokumen. */
export interface BarisPesanan {
  id: string;
  nama: string;
  harga: number;
}

export interface IsiPesanan {
  /** Harga paket setelah potongan promo. Nol bila pesanannya add-on saja. */
  hargaPaket: number;
  /** Harga paket sebelum potongan, untuk dicatat dan dicoret di layar. */
  hargaPaketAsli: number;
  diskonPersen: number;
  /** Add-on yang dipilih sendiri dan benar-benar ditagih. */
  addOnBayar: BarisPesanan[];
  /** Bonus promo, ikut tanpa biaya. Harganya nol, bukan dihilangkan. */
  addOnBonus: BarisPesanan[];
  /** Semua add-on yang akan dimiliki pembeli: yang dibayar dan yang bonus. */
  addOn: BarisPesanan[];
  total: number;
}

/**
 * `promo` diterima sudah jadi, bukan dihitung di sini.
 *
 * Yang memanggilnya dari peramban (layar langganan) memakai hasil hitungan
 * server yang diturunkan sebagai prop, jadi tidak ada `new Date()` di sisi
 * klien yang bisa berbeda dari waktu server dan membuat total di tombol tidak
 * sama dengan total di tagihan. Itu perbedaan yang tidak akan pernah
 * dilaporkan siapa pun: yang melihatnya cuma menutup halaman.
 */
export function rakitPesanan(
  harga: PengaturanHarga,
  promo: PaketPromo | null,
  idAddOn: string[],
): IsiPesanan {
  const dijual = harga.addOn.filter((a) => a.aktif);
  const baris = (id: string, gratis: boolean): BarisPesanan | null => {
    const a = dijual.find((x) => x.id === id);
    return a ? { id: a.id, nama: a.nama.id, harga: gratis ? 0 : a.harga } : null;
  };

  const dipilih = new Set(idAddOn);
  /*
   * Bonus menang atas pilihan sendiri.
   *
   * Kalau add-on yang sama muncul di kedua daftar, ia hanya boleh ditagih
   * sekali, dan yang benar adalah tidak ditagih sama sekali. Pelanggan yang
   * mencentang Pencari Hari Acara lalu memilih paket dua tahun yang sudah
   * membawanya sebagai bonus tidak boleh membayarnya lagi; kalau dibiarkan,
   * yang terjadi persis kebalikan dari yang dijanjikan halaman depan.
   */
  const idBonus = new Set(promo?.bonusAddOn ?? []);
  const addOnBonus = [...idBonus]
    .map((id) => baris(id, true))
    .filter((b): b is BarisPesanan => b !== null);
  const addOnBayar = [...dipilih]
    .filter((id) => !idBonus.has(id))
    .map((id) => baris(id, false))
    .filter((b): b is BarisPesanan => b !== null);

  const hargaPaket = promo?.harga ?? 0;
  return {
    hargaPaket,
    hargaPaketAsli: promo?.hargaAsli ?? 0,
    diskonPersen: promo?.diskonPersen ?? 0,
    addOnBayar,
    addOnBonus,
    addOn: [...addOnBayar, ...addOnBonus],
    total: hargaPaket + addOnBayar.reduce((n, a) => n + a.harga, 0),
  };
}
