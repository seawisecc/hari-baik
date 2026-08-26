import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Firebase Admin SDK — hanya boleh dipakai di server.
 * Import "server-only" di atas membuat build gagal kalau file ini
 * tidak sengaja ikut ter-bundle ke klien.
 *
 * FIREBASE_PRIVATE_KEY di .env disimpan dengan "\n" literal, jadi harus
 * diubah kembali jadi newline asli.
 */
let app: App | null = null;

function ensureApp(): App {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0];
    return app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Kredensial Firebase Admin belum lengkap. Butuh FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, dan FIREBASE_PRIVATE_KEY.",
    );
  }

  app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return app;
}

export const adminAuth = (): Auth => getAuth(ensureApp());
export const adminDb = (): Firestore => getFirestore(ensureApp());
