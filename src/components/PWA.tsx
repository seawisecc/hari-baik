"use client";

import { useEffect } from "react";

/**
 * Daftarkan service worker.
 *
 * Hanya di produksi: saat pengembangan, service worker membuat perubahan
 * kode seolah tidak berpengaruh karena permintaan dilayani dari pendaftaran
 * lama, dan itu membingungkan tanpa memberi manfaat apa pun.
 */
export function PWA() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const daftar = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Pemasangan gagal bukan alasan mengganggu pengguna; aplikasi tetap
        // berjalan normal tanpa service worker.
      });
    };

    // Ditunda sampai selesai memuat supaya tidak berebut jaringan dengan
    // permintaan yang dibutuhkan halaman pertama.
    if (document.readyState === "complete") daftar();
    else window.addEventListener("load", daftar, { once: true });
  }, []);

  return null;
}
