/**
 * Uji asap terhadap build produksi.
 *
 * Ada alasannya kenapa berkas ini ada. Bug `ERR_REQUIRE_ESM` (firebase-admin →
 * jwks-rsa → jose v6 yang ESM-only) lolos ke produksi karena route API cuma
 * pernah diuji lewat `next dev`, yang me-resolve modul dengan cara berbeda dari
 * bundle produksi. Di dev semuanya hijau; di Vercel setiap route balas 500
 * dengan body kosong karena fungsinya gagal boot.
 *
 * Jalankan setelah `npm run build`, sebelum deploy. Yang diuji cuma satu hal:
 * route-nya berhasil boot dan menjalankan handler. 401 itu lulus, karena
 * artinya kode kita yang menolak, bukan modulnya yang gagal dimuat.
 */
import { spawn } from "node:child_process";

const PORT = 3199;
const BASE = `http://localhost:${PORT}`;

type Uji = { jalur: string; metode: string; harap: number[]; kenapa: string };

const DAFTAR: Uji[] = [
  {
    jalur: "/api/admin/harga",
    metode: "GET",
    harap: [200],
    kenapa: "route publik, tidak butuh token",
  },
  {
    jalur: "/api/auth/bootstrap",
    metode: "POST",
    harap: [401],
    kenapa: "Admin SDK termuat lalu handler menolak tanpa token",
  },
  { jalur: "/api/admin/users", metode: "GET", harap: [401], kenapa: "sama" },
  { jalur: "/api/aktivasi", metode: "POST", harap: [401], kenapa: "sama" },
  {
    jalur: "/api/admin/aktivasi",
    metode: "POST",
    harap: [401],
    kenapa: "sama",
  },
  {
    jalur: "/api/admin/profil",
    metode: "POST",
    harap: [401],
    kenapa: "sama, dan route ini juga menarik mesin wariga ke sisi server",
  },
  {
    jalur: "/api/admin/ekspor",
    metode: "GET",
    harap: [401],
    kenapa: "sama, dan route ini merakit CSV di sisi server",
  },
  {
    jalur: "/api/admin/hapus",
    metode: "POST",
    harap: [401],
    kenapa: "sama, dan route ini memakai Admin SDK untuk Auth sekaligus Firestore",
  },
  {
    jalur: "/api/admin/verifikasi",
    metode: "POST",
    harap: [401],
    kenapa: "sama",
  },
];

async function tungguSiap(batasDetik = 60) {
  for (let i = 0; i < batasDetik; i++) {
    try {
      await fetch(BASE, { signal: AbortSignal.timeout(2000) });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return false;
}

async function main() {
  const server = spawn("npx", ["next", "start", "--port", String(PORT)], {
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });
  let catatan = "";
  server.stdout.on("data", (d) => (catatan += d));
  server.stderr.on("data", (d) => (catatan += d));

  const bersihkan = () => {
    if (!server.killed) server.kill("SIGTERM");
  };
  process.on("exit", bersihkan);

  try {
    if (!(await tungguSiap())) {
      console.error("Server produksi tidak pernah siap.\n" + catatan);
      process.exitCode = 1;
      return;
    }

    let gagal = 0;
    for (const u of DAFTAR) {
      let kode = 0;
      let badan = "";
      try {
        const res = await fetch(BASE + u.jalur, {
          method: u.metode,
          signal: AbortSignal.timeout(30_000),
        });
        kode = res.status;
        badan = (await res.text()).slice(0, 90);
      } catch (e) {
        badan = String(e);
      }
      const lulus = u.harap.includes(kode);
      if (!lulus) gagal++;
      console.log(
        `${lulus ? "  ok  " : "GAGAL "} ${u.metode.padEnd(4)} ${u.jalur.padEnd(24)} ${kode || "-"} (harap ${u.harap.join("/")})`,
      );
      if (!lulus) console.log(`         ${u.kenapa} | ${badan}`);
    }

    if (gagal) {
      console.error(
        `\n${gagal} route gagal. Kode 500 berbadan kosong biasanya berarti fungsinya gagal boot, bukan handler-nya yang salah. Cek resolusi modul (mis. paket ESM-only yang di-require).`,
      );
      process.exitCode = 1;
    } else {
      console.log(`\n${DAFTAR.length} route boot dengan benar di build produksi.`);
    }
  } finally {
    bersihkan();
  }
}

main();
