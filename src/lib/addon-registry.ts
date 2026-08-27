/**
 * Add-on mana yang fiturnya benar-benar sudah ada.
 *
 * Ini penjaga terhadap satu kesalahan yang sudah pernah terjadi: empat add-on
 * dipajang dan bisa dibeli di produksi, padahal tidak satu pun fiturnya ada di
 * aplikasi. Pengaturan harga tersimpan di Firestore dan bisa diubah admin,
 * jadi menonaktifkannya sekali saja tidak cukup: sekali ditandai aktif lagi,
 * barang yang tidak bisa dikirim itu langsung dijual kembali.
 *
 * Karena itu daftar ini ada di kode, bukan di pengaturan. Sebuah add-on hanya
 * bisa dijual kalau id-nya terdaftar di sini DAN ditandai aktif oleh admin.
 * Menambahkan baris di sini adalah pernyataan bahwa fiturnya sudah jadi, dan
 * ada tes yang memeriksa rutenya memang ada.
 *
 * Kosong berarti: belum ada add-on yang siap dijual.
 */
export interface AddOnSiap {
  /** Rute halaman fiturnya, dipakai tes untuk memastikan halamannya ada. */
  rute: string;
}

export const ADDON_SIAP: Record<string, AddOnSiap> = {
  "cari-hari-acara": { rute: "/pencari-hari" },
  "profil-keluarga": { rute: "/keluarga" },
  "laporan-pdf": { rute: "/laporan" },
  "fengshui-nama": { rute: "/fengshui-nama" },
};

/** True bila fitur di balik add-on ini sudah benar-benar ada. */
export const addOnSiapJual = (id: string): boolean =>
  Object.prototype.hasOwnProperty.call(ADDON_SIAP, id);

/**
 * Pisahkan id add-on yang boleh disimpan dari yang benar benar asing.
 *
 * Id yang sudah dimiliki pengguna tetap lolos meski tidak ada lagi di katalog.
 * Ini bukan kelonggaran, melainkan jalan keluar dari kebuntuan yang nyata:
 * "pengingat-whatsapp" pernah dijual lalu dihapus dari katalog, dan id itu
 * tertinggal di dokumen orang yang sempat membelinya. Karena panel admin
 * menyimpan daftar penuh, setiap penyimpanan untuk orang itu ikut mengirim id
 * lamanya, ditolak sebagai tidak dikenal, dan admin jadi tidak bisa mengubah
 * add-on orang itu sama sekali, termasuk untuk membuang id lamanya.
 *
 * Yang tetap ditolak adalah id asing yang BARU: salah ketik tidak boleh
 * tersimpan diam-diam dan tidak pernah membuka apa pun.
 */
export function periksaAddOn(
  diminta: unknown[],
  dikenal: string[],
  dimiliki: string[],
): { bersih: string[]; asing: string[] } {
  const sah = new Set(dikenal);
  const lama = new Set(dimiliki);
  const bersih: string[] = [];
  const asing: string[] = [];

  for (const id of diminta) {
    if (typeof id !== "string") {
      asing.push(String(id));
    } else if (sah.has(id) || lama.has(id)) {
      if (!bersih.includes(id)) bersih.push(id);
    } else {
      asing.push(id);
    }
  }

  return { bersih, asing };
}
