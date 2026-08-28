/**
 * Aksi admin atas satu pengguna.
 *
 * Dipisah dari komponennya karena tiga panel berbeda mengirimkannya lewat
 * satu jalur yang sama di halaman admin, dan tujuannya tidak selalu route
 * yang sama: perubahan langganan ke /api/admin/subscription, perbaikan
 * tanggal lahir ke /api/admin/profil.
 */
export type AksiLangganan =
  | { action: "extend"; tahun: number }
  | { action: "set"; expiresAt: string }
  | { action: "lifetime" }
  | { action: "deactivate" }
  /** Tetapkan daftar penuh add-on yang dimiliki pengguna. */
  | { action: "addon"; addOn: string[] };

/** Perbaikan tanggal lahir: satu-satunya jalur yang tersisa setelah dikunci. */
export interface AksiLahir {
  action: "lahir";
  tanggalLahir: string;
}

/**
 * Penghapusan akun.
 *
 * `email` adalah yang diketik admin sebagai konfirmasi, dan ikut dikirim ke
 * server untuk dicocokkan ulang di sana. Konfirmasi yang hanya diperiksa di
 * browser bukan konfirmasi: siapa pun yang bisa memanggil route ini bisa
 * melewatinya.
 */
export interface AksiHapus {
  action: "hapus";
  email: string;
}

export type AksiPengguna = AksiLangganan | AksiLahir | AksiHapus;
