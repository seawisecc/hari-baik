import { normalkan } from "@/lib/admin-cari";
import type { Pembayaran, StatusPembayaranDoc } from "@/types";

/**
 * Penyaringan daftar pembayaran untuk panel admin.
 *
 * Sama alasannya dengan pencarian pengguna: Firestore tidak bisa mencari
 * substring, jadi dokumennya dibaca lalu dicocokkan di memori, dan itu
 * dikerjakan di server, bukan di browser. Yang ada di browser cuma sehalaman,
 * dan pencarian yang hanya melihat sehalaman akan menjawab "tidak ada" untuk
 * pesanan yang sebenarnya ada. Di layar ini akibatnya lebih buruk daripada di
 * daftar pengguna: yang bertanya adalah orang yang uangnya sudah keluar.
 *
 * Fungsinya murni supaya bisa dites tanpa Firestore.
 */

/** Bentuk minimal yang cukup untuk dicari. Sengaja sempit supaya mudah dites. */
export type PembayaranDapatDicari = Pick<
  Pembayaran,
  "orderId" | "email" | "nama" | "transactionId"
>;

/**
 * Semua yang boleh dicocokkan dari satu pesanan, sebagai satu untaian.
 *
 * Id transaksi Midtrans ikut, karena arah pencariannya sering terbalik dari
 * yang diduga: admin membuka dashboard Midtrans lebih dulu, melihat ada uang
 * masuk, lalu ingin tahu itu siapa. Yang ada di tangannya waktu itu id
 * transaksi, bukan email.
 */
function jerami(p: PembayaranDapatDicari): string {
  return normalkan([p.orderId, p.email, p.nama, p.transactionId ?? ""].join(" "));
}

/**
 * Apakah pesanan ini cocok dengan kata kunci?
 *
 * Kata kunci dipecah per kata dan semuanya harus ketemu, tidak harus
 * berurutan, mengikuti aturan yang sama dengan pencarian pengguna supaya admin
 * tidak perlu mengingat dua perilaku yang berbeda di dua layar.
 */
export function cocokPembayaran(p: PembayaranDapatDicari, kunci: string): boolean {
  const kata = normalkan(kunci).split(" ").filter(Boolean);
  if (kata.length === 0) return true;
  const teks = jerami(p);
  return kata.every((k) => teks.includes(k));
}

/**
 * Saring lalu urutkan, terbaru dulu.
 *
 * Diurutkan di memori, bukan lewat orderBy, supaya penyaringan status tidak
 * menuntut composite index tersendiri. Untuk koleksi seukuran ini itu bukan
 * penghematan yang berarti, tapi index yang harus dibuat manual di konsol
 * adalah hal yang paling mudah terlupa saat pindah project.
 */
export function saringPembayaran<T extends PembayaranDapatDicari & { createdAt: string }>(
  daftar: T[],
  kunci: string,
): T[] {
  return daftar
    .filter((p) => cocokPembayaran(p, kunci))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Apakah pesanan ini masih pantas ditanyakan ulang ke Midtrans?
 *
 * Yang sudah diterapkan tidak perlu: jawabannya tidak akan mengubah apa pun,
 * dan menanyakannya cuma menambah panggilan ke Midtrans setiap kali admin
 * penasaran. Yang gagal dan kedaluwarsa juga tidak: itu keadaan akhir.
 *
 * Sisanya boleh, dan justru itu yang paling sering dibutuhkan: pesanan yang
 * tercatat menunggu padahal uangnya sudah masuk, karena notifikasinya tidak
 * pernah sampai.
 */
export function bolehPeriksaUlang(p: Pick<Pembayaran, "status" | "diterapkanPada">): boolean {
  if (p.diterapkanPada) return false;
  return p.status === "menunggu";
}

/** Urutan tab, dan status mana yang jadi bawaan saat layar dibuka. */
export const STATUS_PEMBAYARAN: StatusPembayaranDoc[] = [
  "menunggu",
  "lunas",
  "gagal",
  "dikembalikan",
];
