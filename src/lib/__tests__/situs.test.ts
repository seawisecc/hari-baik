/**
 * Alamat kanonik: satu sumber, dan tidak boleh bocor ke jalur yang salah.
 *
 * Sejak `cariharibaik.com` hidup, aplikasi ini dilayani dua alamat sekaligus.
 * Yang satu kanonik dan dipakai menyebut diri sendiri; yang lain,
 * `haribaik.seawise.id`, tetap melayani penuh karena webhook Midtrans dan
 * daftar domain terotorisasi Firebase masih terdaftar atas namanya.
 *
 * Dua kesalahan yang mungkin terjadi di sekitar itu, dan keduanya senyap:
 * alamat yang ditulis ulang di berkas berbeda lalu berbeda isinya, dan alamat
 * kanonik yang dipakai untuk merakit tautan saat berjalan.
 */
import { readFileSync } from "node:fs";
import { SITUS, SITUS_NAMA } from "../situs";

let fail = 0;
const eq = (label: string, expected: unknown, actual: unknown) => {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    fail++;
    console.log("FAIL:", label, "| expected", expected, "| got", actual);
  }
};

const baca = (f: string) => readFileSync(f, "utf8");

// ------------------------------------------------------------------ bentuknya

eq("situs memakai https", true, SITUS.startsWith("https://"));
eq("situs tanpa garis miring di ujung", false, SITUS.endsWith("/"));
eq("nama diturunkan dari alamatnya", new URL(SITUS).host, SITUS_NAMA);

// -------------------------------------------------------------- satu sumber

/*
 * Metadata dan kaki email harus menyebut alamat yang sama.
 *
 * Keduanya di berkas yang berjauhan dan tidak saling menyebut: yang satu
 * menentukan isi pratinjau WhatsApp, yang lain dibaca orang di kotak masuknya.
 * Ditulis sendiri-sendiri, yang mengganti domain akan menemukan satu dan
 * melewatkan yang lain, dan yang terlewat baru ketahuan berbulan-bulan
 * kemudian. Karena itu yang diperiksa bukan nilainya, melainkan bahwa
 * keduanya mengambil dari `situs.ts`.
 */
{
  const layout = baca("src/app/layout.tsx");
  eq("layout mengambil dari situs.ts", true, /from "@\/lib\/situs"/.test(layout));
  eq("layout tidak menulis alamatnya sendiri", false, /const SITUS\s*=\s*"https/.test(layout));
  eq("metadataBase memakainya", true, /metadataBase:\s*new URL\(SITUS\)/.test(layout));

  const email = baca("src/lib/email/template.ts");
  eq("template email mengambil dari situs.ts", true, /from "@\/lib\/situs"/.test(email));
  eq("template email memakainya", true, email.includes("SITUS_NAMA"));
}

/*
 * Tidak ada berkas sumber yang boleh mematok host kanonik sebagai untaian.
 *
 * Termasuk alamat lamanya: `haribaik.seawise.id` masih melayani, tapi ia tidak
 * boleh lagi muncul sebagai nilai yang dipakai kode. Di komentar dan dokumen
 * boleh, karena di sana ia memang sedang diceritakan, bukan dipakai.
 *
 * Polanya menangkap host di dalam untaian apa pun, dengan atau tanpa `https://`.
 * Versi pertama menuntut skemanya ada, dan itu meleset persis pada bentuk yang
 * paling mungkin ditulis orang: kaki email menyebut hostnya telanjang, tanpa
 * skema. Sabotase yang seharusnya merah lolos hijau sekali sebelum ini
 * diperbaiki.
 */
{
  const berkas = [
    "src/app/layout.tsx",
    "src/lib/email/template.ts",
    "src/app/page.tsx",
    "src/lib/email/kirim.ts",
  ];
  const nakal = berkas.filter((f) =>
    baca(f)
      .split("\n")
      .some(
        (baris) =>
          /["'`][^"'`]*(cariharibaik\.com|haribaik\.seawise\.id)/.test(baris) &&
          !baris.trimStart().startsWith("*") &&
          !baris.trimStart().startsWith("//"),
      ),
  );
  eq("tidak ada host kanonik yang dipatok di kode", [], nakal);
}

// ------------------------------------------------ jangan dipakai merakit tautan

/*
 * Ini yang paling penting, dan yang paling mudah dilanggar tanpa sadar.
 *
 * Tautan verifikasi email dan URL kepulangan pembayaran WAJIB dirakit dari
 * `req.nextUrl.origin`, yaitu host yang barusan dipakai orangnya, bukan dari
 * alamat kanonik. Kalau dipakai yang kanonik, orang yang mendaftar lewat
 * `haribaik.seawise.id` akan menerima tautan ke domain lain, dan orang yang
 * membayar di sana akan dipulangkan ke domain lain pula. Keduanya berujung di
 * sesi yang bukan miliknya: dia sudah masuk di satu host, lalu mendarat di
 * host yang belum mengenalinya, dan yang terlihat cuma layar yang meminta
 * masuk lagi tepat setelah dia membayar.
 */
{
  for (const f of ["src/app/api/auth/verifikasi/route.ts", "src/app/api/bayar/route.ts"]) {
    const isi = baca(f);
    eq(`${f} tidak mengimpor alamat kanonik`, false, /from "@\/lib\/situs"/.test(isi));
    eq(`${f} merakit dari permintaan`, true, /req\.(nextUrl\.)?(origin|url)/.test(isi));
  }
}

// ------------------------------------------------------------------- canonical

/*
 * Halaman depan wajib punya canonical, dan layout wajib TIDAK punya.
 *
 * Dua alamat menyajikan isi yang sama, jadi tanpa canonical mesin pencari
 * memilih sendiri mana yang ditampilkan dan nilai tautan masuk terbelah. Tapi
 * canonical di layout ikut menempel ke setiap halaman turunannya, sehingga
 * `/login` dan `/register` akan mengaku sebagai salinan halaman depan.
 */
{
  eq(
    "halaman depan punya canonical",
    true,
    /alternates:\s*\{\s*canonical:/.test(baca("src/app/page.tsx")),
  );
  eq("layout tidak punya canonical", false, /alternates:/.test(baca("src/app/layout.tsx")));
}

console.log(fail === 0 ? "✓ situs: semua lolos" : `✗ situs: ${fail} gagal`);
if (fail) process.exit(1);
