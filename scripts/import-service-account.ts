/**
 * Masukkan kredensial service account dari file JSON Firebase ke .env.local.
 *
 * Bagian tersulit dari langkah ini adalah private key: nilainya mengandung
 * newline sungguhan yang harus jadi "\n" literal di dalam .env, dan salah
 * satu karakter saja membuatnya tidak terpakai. Script ini yang melakukan
 * konversinya, jadi tidak perlu disalin tangan.
 *
 *   npm run import-sa                        # cari sendiri di ~/Downloads
 *   npm run import-sa -- /path/ke/file.json  # tunjuk langsung
 *
 * Isi kunci tidak pernah ditampilkan ke layar.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const ENV = ".env.local";

function cariDiDownloads(): string | null {
  const dir = join(homedir(), "Downloads");
  let kandidat: { path: string; waktu: number }[] = [];
  try {
    kandidat = readdirSync(dir)
      .filter((f) => f.endsWith(".json") && f.includes("firebase-adminsdk"))
      .map((f) => {
        const path = join(dir, f);
        return { path, waktu: statSync(path).mtimeMs };
      });
  } catch {
    return null;
  }
  if (kandidat.length === 0) return null;
  // Yang paling baru: kalau pernah generate berkali-kali, ambil yang terakhir.
  kandidat.sort((a, b) => b.waktu - a.waktu);
  return kandidat[0].path;
}

const argPath = process.argv[2];
const sumber = argPath ?? cariDiDownloads();

if (!sumber) {
  console.error(
    "\nTidak menemukan file service account di ~/Downloads.\n" +
      "Klik 'Generate new private key' di Firebase Console, lalu jalankan lagi.\n" +
      "Atau tunjuk langsung: npm run import-sa -- /path/ke/file.json\n",
  );
  process.exit(1);
}

let sa: { project_id?: string; client_email?: string; private_key?: string };
try {
  sa = JSON.parse(readFileSync(sumber, "utf8"));
} catch {
  console.error(`\nGagal membaca ${sumber}. Pastikan itu file JSON dari Firebase.\n`);
  process.exit(1);
}

if (!sa.project_id || !sa.client_email || !sa.private_key) {
  console.error(
    "\nFile ini tidak berisi project_id, client_email, dan private_key.\n" +
      "Pastikan yang diunduh adalah kunci dari Service accounts, bukan file lain.\n",
  );
  process.exit(1);
}

// Newline sungguhan menjadi "\n" literal agar muat dalam satu baris .env.
const escaped = sa.private_key.replace(/\n/g, "\\n");

let env = readFileSync(ENV, "utf8");
const set = (kunci: string, nilai: string) => {
  const pola = new RegExp(`^${kunci}=.*$`, "m");
  const baris = `${kunci}=${nilai}`;
  env = pola.test(env) ? env.replace(pola, baris) : `${env}\n${baris}`;
};

set("FIREBASE_PROJECT_ID", sa.project_id);
set("FIREBASE_CLIENT_EMAIL", sa.client_email);
set("FIREBASE_PRIVATE_KEY", `"${escaped}"`);

writeFileSync(ENV, env);

console.log(`
✓ Kredensial dimasukkan ke ${ENV}

  Sumber        : ${sumber}
  Project       : ${sa.project_id}
  Client email  : ${sa.client_email}
  Private key   : ${sa.private_key.length} karakter, dikonversi ke format .env

Berikutnya:
  npm run check-firebase

Setelah itu HAPUS file JSON-nya. Isinya kunci penuh ke project kamu:
  rm "${sumber}"
`);
