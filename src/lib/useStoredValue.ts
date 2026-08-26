"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * State yang sumbernya localStorage.
 *
 * Memakai useSyncExternalStore, bukan useEffect + setState, karena
 * localStorage memang store eksternal: React perlu tahu cara membaca
 * snapshot-nya di server (selalu fallback) dan di klien, lalu berlangganan
 * perubahannya. Pola ini juga menghindari render berantai saat mount.
 */

const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Tab lain yang mengubah nilai yang sama ikut memicu pembaruan.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useStoredValue(
  key: string,
  fallback: string | null = null,
): [string | null, (value: string | null) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key);
      } catch {
        // Private mode / storage diblokir.
        return null;
      }
    },
    // Snapshot server: nilai tersimpan belum bisa diketahui saat render awal.
    () => null,
  );

  const set = useCallback(
    (next: string | null) => {
      try {
        if (next === null) localStorage.removeItem(key);
        else localStorage.setItem(key, next);
      } catch {
        /* storage diblokir: perubahan tidak bertahan, tapi jangan sampai crash */
      }
      notify();
    },
    [key],
  );

  return [value ?? fallback, set];
}
