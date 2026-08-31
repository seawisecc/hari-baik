/**
 * Akun uji untuk mencoba alur pembayaran.
 *
 * Menguji pembayaran berarti membeli langganan, dan langganan yang sudah
 * dibeli tidak bisa dibeli lagi: begitu lunas, akunnya punya akses dan halaman
 * langganan tidak lagi muncul untuknya. Jadi mencoba alurnya dua kali butuh
 * cara mengembalikan akun ke keadaan terkunci, dan itulah yang dikerjakan
 * skrip ini. Tanpa itu setiap percobaan menuntut akun baru, dan daftar
 * pengguna sungguhan pelan-pelan penuh sampah.
 *
 * Alamatnya memakai TLD `.test`, yang memang dicadangkan untuk pengujian dan
 * tidak bisa didaftarkan siapa pun. Artinya akun ini tidak akan pernah
 * bertabrakan dengan alamat pelanggan sungguhan, dan email yang dikirim
 * kepadanya tidak akan sampai ke inbox siapa pun.
 *
 * Email ditandai terverifikasi langsung dari sini, karena tautan verifikasi
 * ke alamat .test tidak akan pernah bisa dibuka. Tanpa itu akunnya tertahan
 * di /verify-email dan halaman langganan tidak pernah terlihat.
 *
 *   npm run akun-uji                      buat, atau kembalikan ke terkunci
 *   npm run akun-uji -- --email a@b.test  pakai alamat lain
 *   npm run akun-uji -- --trial           kembalikan sebagai trial yang masih hidup
 *   npm run akun-uji -- --hapus           bersihkan akun dan dokumennya
 */
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { config } from "dotenv";
import { uripPetemon } from "../src/lib/content/petemon";
import { getSadwara, pancawaraName, saptawaraName, uripHari, wukuName } from "../src/lib/wariga";
import { trialEnd } from "../src/lib/subscription";
import type { UserProfile } from "../src/types";

config({ path: ".env.local" });

const arg = (nama: string) => {
  const i = process.argv.indexOf(`--${nama}`);
  return i === -1 ? null : (process.argv[i + 1] ?? "");
};
const ada = (nama: string) => process.argv.includes(`--${nama}`);

const EMAIL = arg("email") || "uji.bayar@haribaik.test";
const SANDI = "UjiBayar123!";
const LAHIR = "1993-06-30";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Kredensial Admin belum lengkap di .env.local: butuh FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.",
  );
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const auth = getAuth();
const db = getFirestore();

async function cariAtauBuat(): Promise<string> {
  try {
    const ada = await auth.getUserByEmail(EMAIL);
    // Kata sandi ikut ditegakkan ulang. Akun uji yang sandinya pernah diganti
    // tangan lalu lupa akan membuat percobaan berikutnya buntu di layar masuk,
    // dan yang mencobanya tidak akan curiga ke sana.
    await auth.updateUser(ada.uid, { password: SANDI, emailVerified: true });
    console.log("Akun sudah ada, kata sandi dan status verifikasinya ditegakkan ulang.");
    return ada.uid;
  } catch (err) {
    if ((err as { code?: string }).code !== "auth/user-not-found") throw err;
    const baru = await auth.createUser({
      email: EMAIL,
      password: SANDI,
      emailVerified: true,
      displayName: "Uji Bayar",
    });
    console.log("Akun Auth dibuat.");
    return baru.uid;
  }
}

async function hapus() {
  try {
    const u = await auth.getUserByEmail(EMAIL);
    // Auth dulu, baru dokumennya, mengikuti urutan yang sama dengan tombol
    // hapus di panel admin: kegagalan di tengah meninggalkan dokumen tanpa
    // akun, bukan akun tanpa dokumen yang justru memicu trial baru.
    await auth.deleteUser(u.uid);
    await db.collection("users").doc(u.uid).delete();
    console.log(`Akun ${EMAIL} dan dokumennya dihapus.`);
  } catch (err) {
    if ((err as { code?: string }).code === "auth/user-not-found") {
      console.log(`Tidak ada akun ${EMAIL} untuk dihapus.`);
      return;
    }
    throw err;
  }
}

async function main() {
  if (ada("hapus")) return hapus();

  const uid = await cariAtauBuat();
  const trial = ada("trial");
  const petemon = uripPetemon(LAHIR);
  const kemarin = new Date(Date.now() - 86_400_000).toISOString();

  const profil: UserProfile = {
    uid,
    email: EMAIL,
    nama: "Uji Bayar",
    tanggalLahir: LAHIR,
    phoneNumber: null,
    role: "user",
    // Terkunci, bukan trial: yang mau dicoba adalah halaman langganan, dan
    // halaman itu hanya muncul untuk yang aksesnya sudah habis.
    subscriptionStatus: trial ? "trial" : "expired",
    subscriptionExpiresAt: null,
    trialEndsAt: trial ? trialEnd() : kemarin,
    // Dikosongkan setiap kali, kalau tidak add-on dari percobaan sebelumnya
    // menumpuk dan pembelian berikutnya tidak terlihat bedanya.
    addOn: [],
    onboardingComplete: true,
    createdAt: new Date().toISOString(),
    saptaWaraLahir: saptawaraName(LAHIR),
    pancaWaraLahir: pancawaraName(LAHIR),
    sadWaraLahir: getSadwara(LAHIR),
    wukuLahir: wukuName(LAHIR),
    uripLahir: uripHari(LAHIR),
    uripPetemonLahir: petemon.totalUrip,
  };

  await db.collection("users").doc(uid).set(profil);

  console.log("");
  console.log("  Email        :", EMAIL);
  console.log("  Kata sandi   :", SANDI);
  console.log("  Tanggal lahir:", LAHIR, `(${profil.saptaWaraLahir} ${profil.pancaWaraLahir})`);
  console.log("  Status       :", profil.subscriptionStatus);
  console.log("");
  console.log(
    trial
      ? "Masuk lalu buka aplikasinya seperti pengguna trial biasa."
      : "Masuk, dan aplikasinya akan langsung membawamu ke halaman langganan.",
  );
  console.log("Jalankan ulang perintah ini untuk mengunci akunnya lagi setelah membayar.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
