/**
 * Jadikan sebuah akun sebagai admin.
 *
 * Dipakai untuk admin pertama — setelah itu admin bisa saling mengangkat
 * lewat /api/admin/claim. Dijalankan lokal dengan kredensial service account,
 * jadi tidak butuh admin yang sudah ada.
 *
 *   npm run set-admin -- orang@contoh.com
 *   npm run set-admin -- orang@contoh.com --revoke
 */
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { config } from "dotenv";

config({ path: ".env.local" });

const email = process.argv[2];
const revoke = process.argv.includes("--revoke");

if (!email) {
  console.error("Pakai: npm run set-admin -- email@contoh.com [--revoke]");
  process.exit(1);
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Kredensial Admin belum lengkap di .env.local — butuh FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.",
  );
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

async function main() {
  const auth = getAuth();
  const db = getFirestore();

  const user = await auth.getUserByEmail(email).catch(() => null);
  if (!user) {
    console.error(`Tidak ada akun dengan email ${email}. Daftarkan dulu lewat aplikasi.`);
    process.exit(1);
  }

  await auth.setCustomUserClaims(user.uid, revoke ? {} : { admin: true });
  // Cabut refresh token supaya claim baru langsung terbaca saat login berikutnya.
  await auth.revokeRefreshTokens(user.uid);

  const ref = db.collection("users").doc(user.uid);
  if ((await ref.get()).exists) {
    await ref.update({ role: revoke ? "user" : "admin" });
  }

  console.log(
    revoke
      ? `✓ Hak admin dicabut dari ${email}`
      : `✓ ${email} sekarang admin. Keluar lalu masuk lagi supaya token diperbarui.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
