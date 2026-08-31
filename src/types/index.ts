export type Role = "user" | "admin";

/**
 * Status langganan.
 * - `trial`    : 3 hari pertama sejak pembuatan akun, otomatis
 * - `pending`  : sudah minta aktivasi, menunggu approval admin
 * - `active`   : berbayar, aktif sampai `subscriptionExpiresAt`
 * - `lifetime` : berbayar tanpa batas waktu; `subscriptionExpiresAt` diabaikan
 * - `expired`  : trial atau langganan sudah lewat
 */
export type SubscriptionStatus = "trial" | "pending" | "active" | "lifetime" | "expired";

/** Satu anggota keluarga pada add-on Profil Keluarga. */
export interface AnggotaKeluarga {
  /** Stabil, dipakai sebagai kunci daftar. */
  id: string;
  nama: string;
  /** "YYYY-MM-DD". */
  tanggalLahir: string;
  /** Hubungan bebas isi, mis. "Istri", "Anak". Boleh kosong. */
  hubungan: string;
}

/** Batas jumlah anggota, supaya dokumen profil tidak membengkak. */
export const MAKS_KELUARGA = 12;

export interface UserProfile {
  uid: string;
  email: string;
  nama: string;
  /** "YYYY-MM-DD". Hanya admin yang boleh mengubah setelah onboarding. */
  tanggalLahir: string | null;
  phoneNumber: string | null;
  role: Role;
  subscriptionStatus: SubscriptionStatus;
  /** ISO string. Null bila belum pernah aktif. */
  subscriptionExpiresAt: string | null;
  /** ISO string. Akhir trial 3 hari. */
  trialEndsAt: string | null;
  /**
   * Id add-on yang sudah dibayar pengguna ini.
   *
   * Ditulis server saat admin menyetujui permintaan aktivasi. Sebelumnya
   * daftar add-on hanya tersimpan di dokumen permintaan dan hilang begitu
   * permintaannya disetujui, jadi tidak ada satu tempat pun yang tahu siapa
   * membayar apa. Field terlindungi: hanya server dan admin yang boleh
   * menulis, sama seperti field langganan lainnya.
   */
  addOn: string[];
  /**
   * Anggota keluarga yang siklusnya ikut dipantau. Bagian dari add-on Profil
   * Keluarga. Bukan field terlindungi: isinya milik pengguna sendiri dan tidak
   * memberi akses apa pun.
   */
  keluarga?: AnggotaKeluarga[];
  onboardingComplete: boolean;
  createdAt: string;

  /** Turunan dari tanggalLahir, disimpan agar admin bisa menyaring tanpa hitung ulang. */
  saptaWaraLahir: string | null;
  pancaWaraLahir: string | null;
  sadWaraLahir: string | null;
  wukuLahir: string | null;
  uripLahir: number | null;
  uripPetemonLahir: number | null;
}

/**
 * Pengguna sebagaimana dilihat panel admin.
 *
 * `emailTerverifikasi` tidak ada di dokumen Firestore dan tidak pernah
 * disimpan di sana: sumbernya akun Firebase Auth, dan satu-satunya yang boleh
 * mengubahnya adalah Auth sendiri. Menyalinnya ke dokumen berarti membuat
 * salinan kedua yang pasti akan basi, lalu suatu hari dipercaya. Jadi ia
 * ditempelkan di route daftar pengguna saat dibaca, dan hilang lagi sesudahnya.
 *
 * Bernilai null bila akun Auth-nya tidak ditemukan, yaitu dokumen yatim yang
 * tertinggal setelah akunnya dihapus lewat konsol Firebase.
 */
export interface PenggunaAdmin extends UserProfile {
  emailTerverifikasi: boolean | null;
}

/** Hasil evaluasi akses: dipakai untuk mengunci fitur Pro. */
export interface AccessState {
  /** Boleh melihat kalender sama sekali. */
  canView: boolean;
  /** Boleh membuka fitur Pro. */
  isPro: boolean;
  /** Dari mana akses berasal. */
  type: "trial" | "subscription" | "lifetime" | "none";
  /** Sisa hari; null untuk seumur hidup atau saat tidak relevan. */
  daysLeft: number | null;
  expiresAt: string | null;
}

/** Status permintaan aktivasi langganan. */
export type StatusAktivasi = "menunggu" | "disetujui" | "ditolak";

/**
 * Permintaan aktivasi yang diajukan pengguna setelah membayar.
 *
 * Dicatat sebagai dokumen tersendiri, bukan sekadar mengubah status pengguna,
 * supaya ada jejak: paket apa yang dimaksud, kapan diajukan, siapa yang
 * memutuskan, dan apa alasannya bila ditolak.
 */
export interface Aktivasi {
  id: string;
  uid: string;
  email: string;
  nama: string;
  phoneNumber: string | null;

  /** Salinan dari daftar harga saat permintaan dibuat. Harga bisa berubah
   *  nanti; yang mengikat adalah yang dilihat pengguna waktu itu. */
  paketId: string;
  paketNama: string;
  paketTahun: number;
  harga: number;
  addOn: { id: string; nama: string; harga: number }[];
  total: number;

  /** Catatan opsional dari pengguna, mis. nama pengirim transfer. */
  catatan: string | null;

  status: StatusAktivasi;
  createdAt: string;
  diputuskanPada: string | null;
  diputuskanOleh: string | null;
  alasanTolak: string | null;
}

/**
 * Satu pesanan lewat payment gateway.
 *
 * Disimpan terpisah dari `aktivasi` dengan sengaja. Koleksi `aktivasi` adalah
 * antrean kerja admin: yang ada di sana berstatus "menunggu" karena memang
 * menunggu orang memeriksanya. Pesanan Midtrans yang belum dibayar bukan itu:
 * tidak ada yang perlu diperiksa, dan yang dibuat lalu ditinggalkan akan
 * menumpuk sebagai pekerjaan palsu yang tidak pernah bisa diselesaikan admin.
 *
 * Begitu pembayarannya lunas, barulah dokumen `aktivasi` ikut ditulis, sudah
 * berstatus disetujui, supaya catatan uang semua pelanggan tetap berkumpul di
 * satu koleksi entah dibayar lewat transfer atau lewat gateway.
 */
export type StatusPembayaranDoc = "menunggu" | "lunas" | "gagal" | "dikembalikan";

export interface Pembayaran {
  /** Sama dengan id dokumennya, dan sama dengan order_id di Midtrans. */
  orderId: string;
  uid: string;
  email: string;
  nama: string;
  phoneNumber: string | null;

  /** Salinan harga saat pesanan dibuat, sama seperti pada Aktivasi. */
  paketId: string;
  paketNama: string;
  paketTahun: number;
  harga: number;
  addOn: { id: string; nama: string; harga: number }[];
  total: number;

  status: StatusPembayaranDoc;
  /** "sandbox" atau "produksi", supaya pesanan uji tidak tertukar dengan yang asli. */
  mode: string;

  createdAt: string;
  /** ISO, diisi saat notifikasi lunas pertama kali diterima. */
  dibayarPada: string | null;
  /** Diisi setelah langganan benar-benar diterapkan, jadi tidak bisa dobel. */
  diterapkanPada: string | null;
  /** Id dokumen aktivasi yang ditulis saat lunas. */
  aktivasiId: string | null;

  /** Apa adanya dari Midtrans, seperlunya untuk ditelusuri di dashboard mereka. */
  transactionId: string | null;
  paymentType: string | null;
  transactionStatus: string | null;
  fraudStatus: string | null;
}
