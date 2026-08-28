import type { SubscriptionStatus, UserProfile } from "@/types";

/**
 * Ekspor daftar pengguna sebagai CSV.
 *
 * Labelnya sengaja tetap bahasa Indonesia dan tidak ikut kamus i18n. Berkas
 * yang sudah tersimpan di komputer orang tidak boleh berubah bentuk hanya
 * karena admin kebetulan sedang memakai tampilan bahasa Inggris waktu
 * menekan tombolnya; kolom yang namanya berpindah-pindah membuat berkas lama
 * dan baru tidak bisa ditumpuk.
 */

/** Nama kolom, sekaligus urutannya. */
export const KOLOM: string[] = [
  "uid",
  "nama",
  "email",
  "nomor hp",
  "status",
  "berlaku sampai",
  "add-on",
  "peran",
  "onboarding",
  "tanggal daftar",
  "tanggal lahir",
  "sapta wara",
  "panca wara",
  "sad wara",
  "wuku",
  "urip",
  "urip petemon",
];

const LABEL_STATUS: Record<SubscriptionStatus, string> = {
  trial: "Trial",
  pending: "Menunggu",
  active: "Aktif",
  lifetime: "Selamanya",
  expired: "Habis",
};

/**
 * Tanggal saja dari sebuah ISO string.
 *
 * Dipotong dari untaiannya, bukan lewat Date lalu diformat ulang. Tanggal
 * habis disimpan sebagai akhir hari waktu Indonesia Tengah, yang dalam UTC
 * jatuh di sore hari tanggal yang sama; membacanya sebagai Date lalu memakai
 * waktu lokal komputer yang menjalankan server bisa menggesernya sehari.
 */
function tanggalSaja(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

/**
 * Satu nilai, siap ditempel ke baris CSV.
 *
 * Dua hal yang dikerjakan di sini. Pertama pengutipan biasa: nilai yang
 * mengandung koma, kutip, atau baris baru dibungkus kutip ganda, dan kutip di
 * dalamnya digandakan, sesuai RFC 4180.
 *
 * Kedua, dan ini yang tidak kelihatan: nilai yang diawali "=", "+", "-", atau
 * "@" diberi kutip tunggal di depan. Nama dan catatan diisi sendiri oleh
 * pengguna, dan Excel maupun Sheets memperlakukan sel yang diawali tanda itu
 * sebagai rumus. Seseorang yang menamai dirinya "=1+1" cuma membuat sel aneh,
 * tapi rumus juga bisa memanggil hal lain, dan yang membuka berkasnya adalah
 * pemilik aplikasi ini sendiri. Nomor HP berawalan "+62" ikut kena, dan itu
 * memang yang diinginkan: tanpa kutip tunggal, Excel membacanya sebagai rumus
 * yang gagal, bukan sebagai nomor.
 */
export function nilaiCsv(nilai: string): string {
  const aman = /^[=+\-@\t\r]/.test(nilai) ? `'${nilai}` : nilai;
  return /[",\r\n]/.test(aman) ? `"${aman.replace(/"/g, '""')}"` : aman;
}

/** Satu pengguna jadi satu baris nilai, urutannya mengikuti KOLOM. */
export function barisPengguna(u: UserProfile): string[] {
  return [
    u.uid,
    u.nama ?? "",
    u.email ?? "",
    u.phoneNumber ?? "",
    LABEL_STATUS[u.subscriptionStatus] ?? u.subscriptionStatus,
    u.subscriptionStatus === "lifetime" ? "tanpa batas" : tanggalSaja(u.subscriptionExpiresAt),
    (u.addOn ?? []).join("; "),
    u.role ?? "user",
    u.onboardingComplete ? "selesai" : "belum",
    tanggalSaja(u.createdAt ?? null),
    u.tanggalLahir ?? "",
    u.saptaWaraLahir ?? "",
    u.pancaWaraLahir ?? "",
    u.sadWaraLahir ?? "",
    u.wukuLahir ?? "",
    u.uripLahir === null || u.uripLahir === undefined ? "" : String(u.uripLahir),
    u.uripPetemonLahir === null || u.uripPetemonLahir === undefined
      ? ""
      : String(u.uripPetemonLahir),
  ];
}

/**
 * Tanda urutan bita UTF-8.
 *
 * Tanpa ini Excel di Windows membaca berkasnya sebagai ANSI, dan setiap nama
 * berhuruf non-ASCII berubah jadi kotak-kotak. Sheets dan Numbers tidak
 * membutuhkannya tapi juga tidak terganggu olehnya.
 */
export const BOM = "﻿";

/** Seluruh daftar jadi satu berkas CSV, siap dikirim apa adanya. */
export function csvPengguna(users: UserProfile[]): string {
  const baris = [KOLOM, ...users.map(barisPengguna)].map((b) => b.map(nilaiCsv).join(","));
  // CRLF sesuai RFC 4180. Excel lama memerlukannya, yang lain menerima keduanya.
  return BOM + baris.join("\r\n") + "\r\n";
}

/** Nama berkas yang menyebut isinya, supaya unduhan berulang tidak tertukar. */
export function namaBerkas(status: string | null, kunci: string, sekarang: Date): string {
  const bagian = ["hari-baik-pengguna"];
  if (status) bagian.push(status);
  if (kunci.trim()) bagian.push("cari");
  bagian.push(sekarang.toISOString().slice(0, 10));
  return `${bagian.join("-")}.csv`;
}
