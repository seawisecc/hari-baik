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
  // Contoh setelah fiturnya jadi:
  // "profil-keluarga": { rute: "/keluarga" },
};

/** True bila fitur di balik add-on ini sudah benar-benar ada. */
export const addOnSiapJual = (id: string): boolean =>
  Object.prototype.hasOwnProperty.call(ADDON_SIAP, id);
