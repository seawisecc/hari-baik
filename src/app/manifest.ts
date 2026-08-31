import type { MetadataRoute } from "next";

/**
 * Manifest aplikasi web.
 *
 * Chrome menampilkan tombol pasang bila manifest ini ada, situs dilayani lewat
 * HTTPS, punya ikon 192 dan 512 piksel, dan `display` bukan "browser". Ikon
 * bertanda "maskable" dipakai Android untuk memotong sendiri bentuk ikonnya.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hari Baik | Kalender Siklus Personal",
    short_name: "Hari Baik",
    description:
      "Kalender siklus personal yang dihitung dari tanggal lahirmu, memadukan wariga, primbon, dan fengshui ke dalam kalender Masehi.",
    id: "/",
    // Aplikasi terpasang langsung membuka halaman harian, bukan halaman
    // pemasaran: yang memasang sudah tidak perlu diyakinkan lagi.
    start_url: "/hari-ini",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "id",
    dir: "ltr",
    background_color: "#f2f0ec",
    theme_color: "#f2f0ec",
    categories: ["lifestyle", "utilities"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Hari Ini", short_name: "Hari Ini", url: "/hari-ini" },
      { name: "Kalender", short_name: "Kalender", url: "/kalender" },
    ],
  };
}
