/**
 * Email konfirmasi yang dikirim sendiri.
 *
 * Firebase mengirimnya dari subdomain buatan mesin yang dipakai bersama ribuan
 * project lain, dan mengunci isinya. Keduanya diukur, bukan diduga: SPF dan
 * DKIM domain itu sah, jadi yang menjatuhkannya ke spam adalah reputasi domain
 * pengirim, dan Console maupun API sama-sama menolak mengubah templatenya
 * dengan EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED.
 *
 * Yang dikunci di sini bagian yang paling mudah rusak tanpa ketahuan: perakitan
 * ulang tautan, dan isi email yang tidak boleh bocor jadi HTML.
 */
import { readFileSync } from "node:fs";
import { emailVerifikasi } from "../email/template";
import { tautanAksi } from "../email/tautan";

let fail = 0;
const eq = (label: string, expected: unknown, actual: unknown) => {
  if (expected !== actual) {
    fail++;
    console.log("FAIL:", label, "| expected", expected, "| got", actual);
  }
};

const ASAL = "https://haribaik.seawise.id";
const DARI_FIREBASE =
  "https://hari-baik-7e56c.firebaseapp.com/__/auth/action?mode=verifyEmail&oobCode=ABC123&apiKey=AIza&lang=en";

// ── Perakitan ulang tautan ────────────────────────────────────────────────
{
  const t = tautanAksi(DARI_FIREBASE, ASAL);
  eq("tautannya pindah ke domain sendiri", true, t?.startsWith(`${ASAL}/aksi?`));
  eq("kode ikut terbawa", true, t?.includes("oobCode=ABC123"));
  eq("mode ikut terbawa", true, t?.includes("mode=verifyEmail"));

  // apiKey milik Firebase tidak perlu ikut: halaman /aksi memakai config
  // miliknya sendiri, dan apa pun yang tidak dibutuhkan lebih baik tidak
  // ikut berkeliaran di kotak masuk orang.
  eq("apiKey tidak ikut dibawa", false, t?.includes("apiKey"));

  eq(
    "mode lain ikut apa adanya",
    true,
    tautanAksi(DARI_FIREBASE.replace("verifyEmail", "resetPassword"), ASAL)?.includes(
      "mode=resetPassword",
    ),
  );

  // Yang tidak bisa dibaca harus jadi null, bukan tautan setengah jadi yang
  // dikirim ke orang lalu berujung halaman kosong.
  eq("tanpa oobCode, null", null, tautanAksi(`${ASAL}/__/auth/action?mode=verifyEmail`, ASAL));
  eq("tanpa mode, null", null, tautanAksi(`${ASAL}/__/auth/action?oobCode=ABC`, ASAL));
  eq("bukan URL, null", null, tautanAksi("entah apa", ASAL));
}

// ── Isi email ─────────────────────────────────────────────────────────────
{
  const tautan = tautanAksi(DARI_FIREBASE, ASAL)!;
  const isi = emailVerifikasi({ tautan, email: "budi@gmail.com" });

  eq("subjeknya bahasa Indonesia", "Konfirmasi email kamu di Hari Baik", isi.subjek);
  // Di HTML tautannya muncul dalam bentuk yang sudah dijinakkan: & jadi &amp;
  // supaya atribut href-nya sah. Peramban dan klien email mengembalikannya
  // sendiri saat ditekan.
  eq("tautannya ada di HTML", true, isi.html.includes(tautan.replace(/&/g, "&amp;")));
  eq("dan di versi teksnya", true, isi.teks.includes(tautan));
  eq("alamatnya disebutkan", true, isi.html.includes("budi@gmail.com"));

  // Versi teks polos bukan pelengkap: penyaring spam menilai email yang hanya
  // berisi HTML lebih curiga daripada yang membawa keduanya.
  eq("versi teks tidak kosong", true, isi.teks.length > 100);
  eq("versi teks tidak mengandung tag", false, /<[a-z]/i.test(isi.teks));

  // Gaya harus inline, karena Gmail membuang blok <style>, dan tata letaknya
  // memakai table, karena Outlook merender lewat mesin Word.
  eq("tidak ada blok style", false, isi.html.includes("<style"));
  eq("tata letaknya table", true, isi.html.includes("<table"));

  // Tidak ada gambar sama sekali: kebanyakan klien email memblokirnya sampai
  // penerima menekan "tampilkan gambar".
  eq("tidak ada gambar", false, isi.html.includes("<img"));

  // Alamat email diisi sendiri oleh pengguna dan masuk ke HTML apa adanya.
  const jahat = emailVerifikasi({
    tautan,
    email: '"><script>alert(1)</script>',
  });
  eq("tag dari alamat tidak lolos", false, jahat.html.includes("<script>"));
  eq("dan kutipnya ikut dijinakkan", true, jahat.html.includes("&quot;"));
}

// ── Jalur cadangan tidak boleh hilang ─────────────────────────────────────
//
// Kalau kunci Resend belum dipasang atau pengirimannya gagal, yang mendaftar
// tetap harus menerima emailnya, walaupun dari alamat lama yang lebih sering
// masuk spam. Tidak ada email sama sekali berarti akunnya mati sebelum dipakai.
{
  const provider = readFileSync("src/lib/firebase/AuthProvider.tsx", "utf8");
  eq("ada jalur cadangan", true, provider.includes("await cadangan(user);"));
  eq(
    "cadangannya pengirim Firebase",
    true,
    provider.includes("(u) => fn.sendEmailVerification(u)"),
  );

  const rute = readFileSync("src/app/api/auth/verifikasi/route.ts", "utf8");
  // Tanpa pemeriksaan ini, route menjawab 502 saat kuncinya belum ada, dan
  // pendaftaran terlihat gagal padahal cuma belum dikonfigurasi.
  eq("kunci yang belum ada dijawab dengan jujur", true, rute.includes("belum-dikonfigurasi"));
  eq("tautannya dirakit ulang", true, rute.includes("tautanAksi("));
  eq("dan tidak ada email dikirim Firebase dari server", false, rute.includes("sendEmail"));
}

console.log(fail === 0 ? "✓ email: semua lolos" : `✗ email: ${fail} gagal`);
if (fail) process.exit(1);
