import { evaluateAccess } from "@/lib/subscription";
import type { AddOn } from "@/lib/harga";
import type { UserProfile } from "@/types";

/**
 * Siapa boleh membeli add-on tanpa membeli langganan, dan kenapa yang lain
 * tidak.
 *
 * Fungsi murni, dipakai tampilan dan server sekaligus, mengikuti pola yang
 * sama dengan `alasanTolak()` pada penghapusan akun. Tombol yang menyala di
 * layar lalu ditolak API adalah cara paling cepat membuat orang berhenti
 * percaya pada layarnya sendiri, dan di sini akibatnya lebih buruk karena yang
 * ditolak adalah orang yang sedang berusaha membayar.
 */

/** Kenapa sebuah pembelian add-on ditolak. */
export type TolakAddOn =
  /** Tidak ada satu pun add-on dipilih. */
  | "kosong"
  /** Ada id yang tidak dijual, atau fiturnya belum siap. */
  | "tidak-dijual"
  /** Sudah dimiliki, jadi tidak ada yang perlu dibeli. */
  | "sudah-punya"
  /** Langganannya sendiri belum aktif. */
  | "tanpa-langganan";

/**
 * Bentuk minimal yang cukup untuk memutuskan. Sengaja sempit supaya mudah
 * dites tanpa membangun profil pengguna yang lengkap.
 */
export type PembeliAddOn = Pick<
  UserProfile,
  "subscriptionStatus" | "subscriptionExpiresAt" | "trialEndsAt"
> & { addOn?: string[] };

export function alasanTolakAddOn(
  pembeli: PembeliAddOn,
  diminta: string[],
  katalog: AddOn[],
  sekarang: Date = new Date(),
): TolakAddOn | null {
  if (diminta.length === 0) return "kosong";

  const dijual = new Set(katalog.filter((a) => a.aktif).map((a) => a.id));
  if (diminta.some((id) => !dijual.has(id))) return "tidak-dijual";

  const dimiliki = new Set(pembeli.addOn ?? []);
  if (diminta.every((id) => dimiliki.has(id))) return "sudah-punya";

  /*
   * Harus punya akses berbayar yang hidup, bukan sekadar akses.
   *
   * Add-on hanya terbuka bagi yang langganannya aktif: RUTE_ADDON diperiksa
   * setelah gerbang Pro. Menjual add-on kepada yang masa cobanya masih
   * berjalan berarti menjual sesuatu yang berhenti bisa dibuka beberapa hari
   * lagi, dan yang membelinya tidak akan menyangka itu yang dia beli.
   *
   * Ditanyakan ke evaluateAccess(), bukan dibaca dari field status, supaya
   * langganan yang tanggalnya sudah lewat tapi statusnya belum sempat
   * diperbarui tetap terbaca apa adanya.
   */
  const akses = evaluateAccess(pembeli, sekarang);
  if (!akses.isPro) return "tanpa-langganan";

  return null;
}

/** Add-on mana yang benar-benar akan ditagih: yang diminta dan belum dimiliki. */
export function addOnBelumDimiliki(
  diminta: string[],
  dimiliki: string[] | undefined,
): string[] {
  const punya = new Set(dimiliki ?? []);
  return [...new Set(diminta)].filter((id) => !punya.has(id));
}

/**
 * Nama pesanan untuk pembelian yang isinya add-on saja.
 *
 * Dokumen pembayaran dan aktivasi punya kolom `paketNama` yang wajib ada,
 * dan panel admin menampilkannya sebagai judul baris. Untuk pembelian tanpa
 * paket, kolom itu tidak boleh kosong: baris tanpa judul di daftar uang
 * terbaca seperti data rusak, bukan seperti jenis pesanan yang lain.
 */
export const NAMA_PESANAN_ADDON = "Tambahan add-on";
