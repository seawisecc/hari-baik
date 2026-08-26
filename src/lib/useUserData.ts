"use client";

import { useAuth } from "@/lib/firebase/AuthProvider";
import { useStoredValue } from "@/lib/useStoredValue";
import type { AccessState } from "@/types";

const STORAGE_KEY = "hb_birthdate";

/** Tanpa Firebase, akses dibuka penuh: kalau tidak, aplikasi tidak bisa dicoba. */
const AKSES_LOKAL: AccessState = {
  canView: true,
  isPro: true,
  type: "none",
  daysLeft: null,
  expiresAt: null,
};

/**
 * Tanggal lahir yang dipakai seluruh aplikasi.
 *
 * Kalau pengguna sudah login, sumbernya profil Firestore. Kalau Firebase
 * belum dikonfigurasi (mis. pengembangan lokal sebelum kredensial dipasang),
 * jatuh ke localStorage supaya aplikasi tetap bisa dijalankan.
 *
 * `setBirthDate` hanya berlaku di mode lokal: setelah login, perubahan
 * tanggal lahir harus lewat onboarding atau admin.
 */
export function useUserData(): {
  birthDate: string | null;
  setBirthDate: (d: string | null) => void;
  /** true bila tanggal lahir bisa diubah dari sini (belum login). */
  editable: boolean;
  access: AccessState;
  loading: boolean;
} {
  const { profile, access, loading: authLoading, configured, user } = useAuth();
  const [local, setLocal] = useStoredValue(STORAGE_KEY);

  const signedIn = configured && !!user;

  return {
    birthDate: signedIn ? (profile?.tanggalLahir ?? null) : local,
    setBirthDate: setLocal,
    editable: !signedIn,
    access: signedIn ? access : AKSES_LOKAL,
    loading: signedIn ? authLoading : false,
  };
}
