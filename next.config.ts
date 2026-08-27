import type { NextConfig } from "next";

/**
 * Header keamanan.
 *
 * Sebelumnya tidak ada satu pun, jadi halaman ini bisa dibingkai situs lain
 * (pengguna mengira sedang menekan tombol di sana, padahal menekan tombol di
 * sini), dan tidak ada batas asal untuk skrip maupun koneksi.
 *
 * CSP-nya sengaja tidak memakai nonce: Next menyisipkan skrip inline sendiri
 * dan halaman ini juga punya satu, yaitu penyetel tema yang harus jalan
 * sebelum cat pertama supaya layar tidak berkedip putih. Yang tetap dijaga
 * ketat adalah ASAL: tidak ada skrip, gaya, gambar, atau koneksi dari domain
 * lain kecuali endpoint Firebase yang memang dipakai.
 *
 * connect-src memakai *.googleapis.com karena Firebase Auth, Firestore, dan
 * penyegaran token berada di subdomain yang berbeda-beda, dan daftarnya bisa
 * bertambah tanpa pemberitahuan. Kalau suatu hari ada yang tidak jalan setelah
 * deploy, konsol browser akan menyebut arahan CSP mana yang menolaknya.
 */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "frame-src 'self' https://*.firebaseapp.com",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com",
  "upgrade-insecure-requests",
].join("; ");

const HEADER_KEAMANAN = [
  { key: "Content-Security-Policy", value: CSP },
  // Hanya HTTPS. Vercel sudah memasang max-age yang sama; ini membuatnya
  // ikut berlaku untuk subdomain, dan tetap ada kalau hosting berpindah.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Tidak ada fitur perangkat yang dipakai aplikasi ini.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // Untuk browser lama yang belum mengenal frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  // Versi Next tidak perlu diumumkan ke setiap pemindai.
  poweredByHeader: false,

  async headers() {
    return [
      { source: "/:path*", headers: HEADER_KEAMANAN },
      {
        // Halaman kerja internal: tidak boleh muncul di hasil pencarian.
        source: "/:path(admin|styleguide|debug-wariga)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        // Route API tidak pernah boleh disimpan perantara mana pun.
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },
};

export default nextConfig;
