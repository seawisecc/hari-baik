import type { FirebaseApp } from "firebase/app";
import type { Auth, User } from "firebase/auth";
import type { DocumentData, Firestore, Unsubscribe } from "firebase/firestore";

/**
 * Firebase sisi klien, dimuat saat dibutuhkan.
 *
 * Nilai NEXT_PUBLIC_* memang ikut ter-bundle ke browser; itu wajar untuk
 * Firebase, pengamanannya ada di Security Rules bukan di kerahasiaan config.
 *
 * Yang penting di berkas ini: SDK-nya diimpor secara dinamis, bukan di
 * puncak modul. Dulu Auth dan Firestore diimpor langsung, dan karena
 * AuthProvider dipasang di kerangka paling luar, keduanya ikut ke SETIAP
 * halaman. Halaman depan sendirian mengunduh 640 KB Firebase yang tidak
 * dipakainya sama sekali: pengunjung pertama yang belum punya akun tetap
 * membayar ongkosnya.
 *
 * Dengan impor dinamis, Firebase menjadi potongan tersendiri yang baru
 * diambil saat benar-benar diperlukan, setelah halaman tampil.
 *
 * Semua tipe di atas diimpor dengan `import type`, yang hilang saat dikompilasi
 * dan tidak menarik apa pun ke bundel.
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True bila env sudah diisi: dipakai untuk memberi pesan yang jelas saat belum. */
export const firebaseConfigured = Boolean(config.apiKey && config.projectId);

export interface Firebase {
  auth: Auth;
  db: Firestore;
  /** Fungsi SDK yang dipakai aplikasi ini, dikumpulkan supaya pemanggil
      tidak perlu mengimpor paket firebase sendiri dan menariknya kembali
      ke bundel utama. */
  fn: {
    onAuthStateChanged: typeof import("firebase/auth").onAuthStateChanged;
    createUserWithEmailAndPassword: typeof import("firebase/auth").createUserWithEmailAndPassword;
    signInWithEmailAndPassword: typeof import("firebase/auth").signInWithEmailAndPassword;
    signOut: typeof import("firebase/auth").signOut;
    sendEmailVerification: typeof import("firebase/auth").sendEmailVerification;
    sendPasswordResetEmail: typeof import("firebase/auth").sendPasswordResetEmail;
    GoogleAuthProvider: typeof import("firebase/auth").GoogleAuthProvider;
    signInWithPopup: typeof import("firebase/auth").signInWithPopup;
    // Jalur cadangan untuk aplikasi terpasang dan peramban yang memblokir
    // popup. Keduanya harus ada: yang satu tidak bisa menggantikan yang lain.
    signInWithRedirect: typeof import("firebase/auth").signInWithRedirect;
    getRedirectResult: typeof import("firebase/auth").getRedirectResult;
    doc: typeof import("firebase/firestore").doc;
    onSnapshot: typeof import("firebase/firestore").onSnapshot;
    updateDoc: typeof import("firebase/firestore").updateDoc;
  };
}

/**
 * Firestore dengan cache lokal yang bertahan antar kunjungan.
 *
 * Tanpa ini, setiap kali aplikasi dibuka profil pengguna harus ditarik ulang
 * dari Jakarta sebelum apa pun bisa ditampilkan, dan selama itu layar hanya
 * menunggu. Dengan cache, kunjungan berikutnya terisi dari perangkat lebih
 * dulu lalu diperbarui begitu jawaban server tiba.
 *
 * Data yang sebentar tertinggal tidak membuka akses apa pun: penjaga yang
 * sesungguhnya ada di Security Rules dan di route API, yang selalu memeriksa
 * ulang di server. Yang dipercepat hanya apa yang tampil di layar.
 *
 * Kalau cache tidak bisa dipasang, misalnya di jendela penyamaran atau saat
 * ada tab lain yang sudah memegangnya, Firestore biasa tetap dipakai.
 */
function buatDb(
  firestore: typeof import("firebase/firestore"),
  instance: FirebaseApp,
): Firestore {
  try {
    return firestore.initializeFirestore(instance, {
      localCache: firestore.persistentLocalCache({
        tabManager: firestore.persistentMultipleTabManager(),
      }),
    });
  } catch {
    return firestore.getFirestore(instance);
  }
}

let dimuat: Promise<Firebase> | null = null;

/**
 * Muat Firebase sekali, lalu pakai ulang hasilnya.
 *
 * Janjinya di-cache, bukan hasilnya, supaya dua pemanggil yang datang
 * bersamaan tidak memicu dua kali inisialisasi.
 */
export function firebase(): Promise<Firebase> {
  if (!firebaseConfigured) {
    return Promise.reject(
      new Error(
        "Firebase belum dikonfigurasi. Salin .env.example ke .env.local dan isi kredensial project Firebase-mu.",
      ),
    );
  }
  dimuat ??= (async () => {
    const [app, auth, firestore] = await Promise.all([
      import("firebase/app"),
      import("firebase/auth"),
      import("firebase/firestore"),
    ]);
    const instance: FirebaseApp = app.getApps().length
      ? app.getApp()
      : app.initializeApp(config);
    return {
      auth: auth.getAuth(instance),
      db: buatDb(firestore, instance),
      fn: {
        onAuthStateChanged: auth.onAuthStateChanged,
        createUserWithEmailAndPassword: auth.createUserWithEmailAndPassword,
        signInWithEmailAndPassword: auth.signInWithEmailAndPassword,
        signOut: auth.signOut,
        sendEmailVerification: auth.sendEmailVerification,
        sendPasswordResetEmail: auth.sendPasswordResetEmail,
        GoogleAuthProvider: auth.GoogleAuthProvider,
        signInWithPopup: auth.signInWithPopup,
        signInWithRedirect: auth.signInWithRedirect,
        getRedirectResult: auth.getRedirectResult,
        doc: firestore.doc,
        onSnapshot: firestore.onSnapshot,
        updateDoc: firestore.updateDoc,
      },
    };
  })();
  return dimuat;
}

/**
 * ID token pengguna yang sedang masuk.
 *
 * Diambil dari `currentUser` milik Firebase, bukan dari objek User yang
 * disimpan di state React. Bedanya penting: state React bisa memegang salinan
 * yang sudah kehilangan methodnya, dan itu pernah terjadi. Dengan membaca dari
 * sumbernya, tidak ada komponen yang perlu memegang objek User hanya untuk
 * mengambil token.
 */
export async function ambilToken(): Promise<string> {
  const { auth } = await firebase();
  const current = auth.currentUser;
  if (!current) throw new Error("Sesi berakhir. Silakan masuk lagi.");
  return current.getIdToken();
}

/** Pengguna yang sedang masuk, atau null. */
export async function penggunaSekarang(): Promise<User | null> {
  const { auth } = await firebase();
  return auth.currentUser;
}

/**
 * Perbarui dokumen profil pengguna.
 *
 * Dibungkus di sini supaya halaman onboarding dan form ubah tanggal lahir
 * tidak perlu mengimpor firebase/firestore sendiri, yang akan menarik SDK-nya
 * kembali ke bundel halaman itu.
 */
export async function perbaruiProfil(uid: string, data: DocumentData): Promise<void> {
  const { db, fn } = await firebase();
  await fn.updateDoc(fn.doc(db, "users", uid), data);
}

export type { Unsubscribe };
