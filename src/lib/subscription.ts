import type { AccessState, SubscriptionStatus, UserProfile } from "@/types";

const MS_PER_DAY = 86_400_000;

function daysUntil(iso: string, now: Date): number {
  return Math.ceil((new Date(iso).getTime() - now.getTime()) / MS_PER_DAY);
}

/**
 * Satu-satunya tempat aturan akses diputuskan.
 *
 * Langganan berbayar diperiksa lebih dulu: kalau seseorang membayar di
 * tengah masa trial, trial yang habis tidak boleh menutup aksesnya.
 */
export function evaluateAccess(
  user: Pick<UserProfile, "subscriptionStatus" | "subscriptionExpiresAt" | "trialEndsAt">,
  now: Date = new Date(),
): AccessState {
  // Seumur hidup diperiksa paling dulu: tidak punya tanggal habis, jadi tidak
  // boleh ikut logika kedaluwarsa apa pun.
  if (user.subscriptionStatus === "lifetime") {
    return {
      canView: true,
      isPro: true,
      type: "lifetime",
      daysLeft: null,
      expiresAt: null,
    };
  }

  if (user.subscriptionStatus === "active" && user.subscriptionExpiresAt) {
    const left = daysUntil(user.subscriptionExpiresAt, now);
    if (left > 0) {
      return {
        canView: true,
        isPro: true,
        type: "subscription",
        daysLeft: left,
        expiresAt: user.subscriptionExpiresAt,
      };
    }
  }

  if (user.trialEndsAt) {
    const left = daysUntil(user.trialEndsAt, now);
    if (left > 0) {
      return {
        canView: true,
        isPro: false,
        type: "trial",
        daysLeft: left,
        expiresAt: user.trialEndsAt,
      };
    }
  }

  return { canView: false, isPro: false, type: "none", daysLeft: null, expiresAt: null };
}

/**
 * Lama masa coba, dalam hari.
 *
 * Satu-satunya sumber angka ini. Sebelumnya "3" ditulis ulang di kode trial,
 * di salinan teks landing, dan di subjudul halaman daftar, jadi mengubah
 * panjang masa coba berarti berburu angka yang sama di empat tempat dan
 * pasti ada yang terlewat.
 */
export const HARI_TRIAL = 3;

/** Akhir masa coba sejak onboarding. */
export function trialEnd(from: Date = new Date()): string {
  return new Date(from.getTime() + HARI_TRIAL * MS_PER_DAY).toISOString();
}

/** Perpanjang langganan setahun. Kalau masih aktif, ditumpuk dari tanggal habis. */
export function extendOneYear(currentExpiry: string | null, now: Date = new Date()): string {
  const base =
    currentExpiry && new Date(currentExpiry) > now ? new Date(currentExpiry) : new Date(now);
  const next = new Date(base);
  next.setFullYear(next.getFullYear() + 1);
  return next.toISOString();
}

/**
 * Tanggal habis setelah ditambah `tahun` tahun.
 * Ditumpuk dari tanggal habis yang ada bila langganan masih berjalan, supaya
 * sisa masa berlaku tidak hangus saat diperpanjang.
 */
export function extendYears(
  currentExpiry: string | null,
  tahun: number,
  now: Date = new Date(),
): string {
  const base =
    currentExpiry && new Date(currentExpiry) > now ? new Date(currentExpiry) : new Date(now);
  const next = new Date(base);
  next.setFullYear(next.getFullYear() + tahun);
  return next.toISOString();
}

/** Bentuk minimal yang dibutuhkan untuk menilai keadaan langganan seseorang. */
type Langganan = Pick<UserProfile, "subscriptionStatus" | "subscriptionExpiresAt">;

/**
 * Apakah orang ini sedang memegang akses yang sudah dibayar?
 *
 * Dipakai route pengajuan aktivasi untuk memutuskan apakah statusnya boleh
 * diubah jadi "pending". Pelanggan yang memperpanjang lebih awal atau menambah
 * add-on tetap pelanggan aktif: menandainya menunggu akan mencabut akses yang
 * sudah dibayarnya sampai admin sempat menyetujui, dan bagi pemegang langganan
 * seumur hidup, mencabutnya untuk selamanya.
 */
export function punyaAksesBerbayar(u: Langganan, now: Date = new Date()): boolean {
  if (u.subscriptionStatus === "lifetime") return true;
  return (
    u.subscriptionStatus === "active" &&
    !!u.subscriptionExpiresAt &&
    new Date(u.subscriptionExpiresAt) > now
  );
}

/**
 * Status yang benar setelah sebuah permintaan aktivasi ditolak.
 *
 * Dulu selalu "expired". Itu benar untuk orang yang memang sudah habis masa
 * berlakunya, tapi salah untuk pelanggan aktif yang permintaan perpanjangannya
 * ditolak: satu penolakan mencabut sisa langganan yang masih dia miliki.
 */
export function statusSetelahDitolak(u: Langganan, now: Date = new Date()): SubscriptionStatus {
  if (u.subscriptionStatus === "lifetime") return "lifetime";
  const habis = u.subscriptionExpiresAt;
  return habis && new Date(habis) > now ? "active" : "expired";
}
