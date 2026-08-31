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
 * lain kecuali endpoint Firebase dan Midtrans yang memang dipakai.
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
  // Snap menampilkan logo bank dan e-wallet dari CDN Midtrans.
  "img-src 'self' data: blob: https://app.midtrans.com https://app.sandbox.midtrans.com",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  // apis.google.com dibutuhkan alur masuk dengan Google, dan ia tidak tercakup
  // oleh *.googleapis.com yang ada di connect-src: itu host yang berbeda.
  // Firebase memuat apis.google.com/js/api.js untuk membangun jembatan
  // komunikasi antara halaman dan jendela popup Google. Tanpa izin ini
  // skripnya ditolak sebelum satu pun permintaan jaringan terjadi, dan
  // Firebase melaporkannya sebagai auth/internal-error tanpa keterangan apa
  // pun, karena memang tidak ada server yang sempat menjawab. Sempat dikira
  // masalah Safari selama beberapa putaran; sebenarnya berlaku di semua
  // peramban.
  //
  // Midtrans Snap memuat snap.js dari app.midtrans.com (atau
  // app.sandbox.midtrans.com), dan skrip itu sendiri menarik pustaka
  // pendukungnya dari beberapa host Midtrans lain saat berjalan. Tanpa izin
  // ini jendela pembayaran tidak pernah terbuka dan yang terlihat pengguna
  // cuma tombol yang berputar lalu berhenti.
  "script-src 'self' 'unsafe-inline' https://apis.google.com https://app.midtrans.com https://app.sandbox.midtrans.com https://api.midtrans.com https://api.sandbox.midtrans.com",
  "worker-src 'self'",
  "manifest-src 'self'",
  // Jembatan gapi hidup di dalam iframe apis.google.com, dan pemilih akun
  // Google bisa muncul dari accounts.google.com.
  // Jendela pembayaran Snap hidup di dalam iframe milik Midtrans, dan
  // sebagian metode (kartu dengan 3DS, e-wallet) membuka iframe bank atau
  // penyedia dompetnya sendiri dari dalam sana.
  "frame-src 'self' https://*.firebaseapp.com https://apis.google.com https://accounts.google.com https://app.midtrans.com https://app.sandbox.midtrans.com https://api.midtrans.com https://api.sandbox.midtrans.com https://*.veritrans.co.id",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com https://apis.google.com https://accounts.google.com https://app.midtrans.com https://app.sandbox.midtrans.com https://api.midtrans.com https://api.sandbox.midtrans.com",
  "upgrade-insecure-requests",
].join("; ");

const HEADER_KEAMANAN = [
  { key: "Content-Security-Policy", value: CSP },
  // Hanya HTTPS. Vercel sudah memasang max-age yang sama; ini membuatnya
  // ikut berlaku untuk subdomain, dan tetap ada kalau hosting berpindah.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Tidak ada fitur perangkat yang dipakai aplikasi ini, kecuali Payment
  // Request API yang dipakai Snap untuk kartu tersimpan di peramban. Izinnya
  // diberikan kepada halaman sendiri dan kepada iframe Midtrans, bukan kepada
  // siapa pun.
  {
    key: "Permissions-Policy",
    value:
      'camera=(), microphone=(), geolocation=(), usb=(), payment=(self "https://app.midtrans.com" "https://app.sandbox.midtrans.com")',
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
