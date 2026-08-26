import type { AccessState, UserProfile } from "@/types";

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

/** Akhir trial 3 hari sejak onboarding. */
export function trialEnd(from: Date = new Date()): string {
  return new Date(from.getTime() + 3 * MS_PER_DAY).toISOString();
}

/** Perpanjang langganan setahun. Kalau masih aktif, ditumpuk dari tanggal habis. */
export function extendOneYear(currentExpiry: string | null, now: Date = new Date()): string {
  const base =
    currentExpiry && new Date(currentExpiry) > now ? new Date(currentExpiry) : new Date(now);
  const next = new Date(base);
  next.setFullYear(next.getFullYear() + 1);
  return next.toISOString();
}
