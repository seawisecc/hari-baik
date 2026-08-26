export type Role = "user" | "admin";

/**
 * Status langganan.
 * - `trial`   : 3 hari pertama sejak onboarding, otomatis
 * - `pending`: sudah minta aktivasi, menunggu approval admin
 * - `active`: berbayar, aktif sampai `subscriptionExpiresAt`
 * - `expired`: trial atau langganan sudah lewat
 */
export type SubscriptionStatus = "trial" | "pending" | "active" | "expired";

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

/** Hasil evaluasi akses: dipakai untuk mengunci fitur Pro. */
export interface AccessState {
  /** Boleh melihat kalender sama sekali. */
  canView: boolean;
  /** Boleh membuka fitur Pro. */
  isPro: boolean;
  /** "trial" | "subscription" | "none" */
  type: "trial" | "subscription" | "none";
  /** Sisa hari, null bila tidak relevan. */
  daysLeft: number | null;
  expiresAt: string | null;
}
