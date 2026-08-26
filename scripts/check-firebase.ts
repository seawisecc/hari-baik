/**
 * Periksa apakah konfigurasi Firebase sudah lengkap dan benar-benar bisa
 * dipakai — bukan sekadar terisi.
 *
 *   npm run check-firebase
 */
import { config } from "dotenv";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

config({ path: ".env.local" });

const KLIEN = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];
const SERVER = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"];

const ok = (m: string) => console.log("  ✓", m);
const bad = (m: string) => console.log("  ✗", m);

let gagal = 0;

console.log("\nKonfigurasi klien (.env.local)");
for (const k of KLIEN) {
  if (process.env[k]?.trim()) ok(k);
  else {
    bad(`${k} kosong`);
    gagal++;
  }
}

console.log("\nKredensial server");
for (const k of SERVER) {
  if (process.env[k]?.trim()) ok(k);
  else {
    bad(`${k} kosong`);
    gagal++;
  }
}

// Kesalahan yang paling sering: private key disalin tanpa newline.
const pk = process.env.FIREBASE_PRIVATE_KEY ?? "";
if (pk && !pk.includes("BEGIN PRIVATE KEY")) {
  bad("FIREBASE_PRIVATE_KEY tidak terlihat seperti kunci PEM yang utuh");
  gagal++;
}
if (pk && !pk.includes("\\n") && !pk.includes("\n")) {
  bad("FIREBASE_PRIVATE_KEY tidak punya newline — salin apa adanya, termasuk \\n");
  gagal++;
}

// Project id klien dan server harus menunjuk project yang sama.
const idKlien = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const idServer = process.env.FIREBASE_PROJECT_ID;
if (idKlien && idServer && idKlien !== idServer) {
  console.log("");
  bad(`Project id berbeda: klien "${idKlien}" vs server "${idServer}"`);
  gagal++;
}

if (gagal > 0) {
  console.log(`\n${gagal} masalah. Isi .env.local dulu — contohnya ada di .env.example.\n`);
  process.exit(1);
}

// Dibungkus fungsi, bukan top-level await: skrip di-transpile ke CJS.
async function cekKoneksi() {
  console.log("\nMencoba menyambung…");
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: idServer!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      }),
    });
  }

  const users = await getAuth().listUsers(1);
  ok(`Auth tersambung — ${users.users.length} pengguna terbaca`);

  await getFirestore().collection("users").limit(1).get();
  ok("Firestore tersambung");

  const admins = await getAuth().listUsers(1000);
  const jumlahAdmin = admins.users.filter((u) => u.customClaims?.admin === true).length;
  if (jumlahAdmin === 0) {
    console.log(
      "\n  ! Belum ada admin. Daftar lewat aplikasi, lalu:\n" +
        "    npm run set-admin -- email@kamu.com\n",
    );
  } else {
    ok(`${jumlahAdmin} admin terdaftar`);
  }

  console.log("\nSiap dipakai.\n");
}

cekKoneksi().catch((err) => {
  console.log("");
  bad(err instanceof Error ? err.message : String(err));
  console.log(
    "\nPeriksa: kredensial service account benar, dan Authentication\n" +
      "serta Firestore sudah diaktifkan di Firebase Console.\n",
  );
  process.exit(1);
});
