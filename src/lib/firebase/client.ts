import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase sisi klien. Nilai NEXT_PUBLIC_* memang ikut ter-bundle ke browser —
 * itu wajar untuk Firebase; pengamanannya ada di Security Rules, bukan di
 * kerahasiaan config.
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True bila env sudah diisi — dipakai untuk memberi pesan yang jelas saat belum. */
export const firebaseConfigured = Boolean(config.apiKey && config.projectId);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function ensureApp(): FirebaseApp {
  if (!firebaseConfigured) {
    throw new Error(
      "Firebase belum dikonfigurasi. Salin .env.example ke .env.local dan isi kredensial project Firebase-mu.",
    );
  }
  if (!app) app = getApps().length ? getApp() : initializeApp(config);
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) authInstance = getAuth(ensureApp());
  return authInstance;
}

export function getDb(): Firestore {
  if (!dbInstance) dbInstance = getFirestore(ensureApp());
  return dbInstance;
}
