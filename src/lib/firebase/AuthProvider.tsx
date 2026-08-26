"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { evaluateAccess } from "@/lib/subscription";
import type { AccessState, UserProfile } from "@/types";
import { firebaseConfigured, getDb, getFirebaseAuth } from "./client";

interface AuthContextValue {
  /** null = belum login. undefined tidak dipakai: cek `loading` dulu. */
  user: User | null;
  profile: UserProfile | null;
  access: AccessState;
  loading: boolean;
  configured: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  /** Ambil ulang status akun dari server; kembalikan true bila email sudah terverifikasi. */
  refreshUser: () => Promise<boolean>;
}

const LOCKED: AccessState = {
  canView: false,
  isPro: false,
  type: "none",
  daysLeft: null,
  expiresAt: null,
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Minta server membuat dokumen profil. Server yang menentukan masa trial,
 * jadi nilainya tidak bisa dikarang dari browser.
 */
async function bootstrapProfile(user: User): Promise<void> {
  const token = await user.getIdToken();
  const res = await fetch("/api/auth/bootstrap", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Gagal menyiapkan profil.");
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // Kalau Firebase belum dikonfigurasi, tidak ada yang ditunggu.
  const [loading, setLoading] = useState(firebaseConfigured);

  useEffect(() => {
    if (!firebaseConfigured) return;
    return onAuthStateChanged(getFirebaseAuth(), (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    });
  }, []);

  // Profil di-subscribe, bukan sekali baca: saat admin mengaktifkan langganan,
  // status di perangkat pengguna ikut berubah tanpa perlu reload.
  useEffect(() => {
    if (!user || !firebaseConfigured) return;
    const ref = doc(getDb(), "users", user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setProfile(snap.exists() ? ({ uid: user.uid, ...snap.data() } as UserProfile) : null);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [user]);

  const register = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
    await bootstrapProfile(cred.user);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    // Jaring pengaman: kalau pendaftaran dulu terputus sebelum profil dibuat,
    // ini membuatnya sekarang. Tidak mengubah apa pun bila profil sudah ada.
    await bootstrapProfile(cred.user);
  }, []);

  const logout = useCallback(async () => {
    await signOut(getFirebaseAuth());
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(getFirebaseAuth(), email);
  }, []);

  const resendVerification = useCallback(async () => {
    const current = getFirebaseAuth().currentUser;
    if (current) await sendEmailVerification(current);
  }, []);

  const refreshUser = useCallback(async () => {
    const current = getFirebaseAuth().currentUser;
    if (!current) return false;
    // emailVerified ikut token, jadi baru berubah setelah ditarik ulang.
    await current.reload();
    await current.getIdToken(true);
    // Salin ke state supaya penjaga rute ikut melihat nilai barunya.
    setUser({ ...current, emailVerified: current.emailVerified } as User);
    return current.emailVerified;
  }, []);

  const access = useMemo(() => (profile ? evaluateAccess(profile) : LOCKED), [profile]);

  const value = useMemo(
    () => ({
      user,
      profile,
      access,
      loading,
      configured: firebaseConfigured,
      register,
      login,
      logout,
      resetPassword,
      resendVerification,
      refreshUser,
    }),
    [
      user,
      profile,
      access,
      loading,
      register,
      login,
      logout,
      resetPassword,
      resendVerification,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
