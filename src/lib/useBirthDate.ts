"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "hb_birthdate";

/**
 * SEMENTARA — tanggal lahir disimpan di browser supaya kalender bisa
 * dikembangkan dan diuji sebelum Firebase Auth terpasang.
 *
 * Setelah auth siap, sumbernya pindah ke `users/{uid}.tanggalLahir` di
 * Firestore dan hook ini dihapus. Jangan tambah data lain ke sini.
 */
export function useBirthDate(): {
  birthDate: string | null;
  setBirthDate: (d: string | null) => void;
  loaded: boolean;
} {
  const [birthDate, setState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setState(localStorage.getItem(STORAGE_KEY));
    } catch {
      /* storage diblokir */
    }
    setLoaded(true);
  }, []);

  const setBirthDate = useCallback((d: string | null) => {
    setState(d);
    try {
      if (d) localStorage.setItem(STORAGE_KEY, d);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage diblokir */
    }
  }, []);

  return { birthDate, setBirthDate, loaded };
}
