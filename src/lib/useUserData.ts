"use client";

import { useAuth } from "@/lib/firebase/AuthProvider";
import { useStoredValue } from "@/lib/useStoredValue";
import type { AccessState } from "@/types";

const STORAGE_KEY = "hb_birthdate";

/**
 * Mode lokal: dipakai HANYA saat Firebase belum dikonfigurasi, supaya
 * aplikasi masih bisa dijalankan sebelum kredensial dipasang.
 *
 * Syaratnya sengaja `!configured`, bukan "belum login". Kalau dikaitkan ke
 * status login, situs yang sudah live akan memberi akses penuh kepada
 * pengunjung yang belum masuk.
 */
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
  const { profile, access, loading: authLoading, configured } = useAuth();
  const [local, setLocal] = useStoredValue(STORAGE_KEY);

  // Begitu Firebase terpasang, profil pengguna jadi satu-satunya sumber:
  // tanggal lahir di localStorage tidak boleh lagi memberi akses apa pun.
  if (configured) {
    return {
      birthDate: profile?.tanggalLahir ?? null,
      setBirthDate: setLocal,
      editable: false,
      access,
      loading: authLoading,
    };
  }

  return {
    birthDate: local,
    setBirthDate: setLocal,
    editable: true,
    access: AKSES_LOKAL,
    loading: false,
  };
}
