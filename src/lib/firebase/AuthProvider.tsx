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
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { evaluateAccess } from "@/lib/subscription";
import type { AccessState, UserProfile } from "@/types";
import { firebaseConfigured, getDb, getFirebaseAuth } from "./client";

interface AuthContextValue {
  /** null = belum login. undefined tidak dipakai — cek `loading` dulu. */
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
}

const LOCKED: AccessState = {
  canView: false,
  isPro: false,
  type: "none",
  daysLeft: null,
  expiresAt: null,
};

const AuthContext = createContext<AuthContextValue | null>(null);

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

    // Dokumen dibuat sekali saja; kalau sudah ada (mis. daftar ulang setelah
    // gagal di tengah jalan) jangan ditimpa supaya data lama tidak hilang.
    const ref = doc(getDb(), "users", cred.user.uid);
    const existing = await getDoc(ref);
    if (existing.exists()) return;

    const baru: Omit<UserProfile, "uid"> = {
      email,
      nama: "",
      tanggalLahir: null,
      phoneNumber: null,
      role: "user",
      subscriptionStatus: "trial",
      subscriptionExpiresAt: null,
      trialEndsAt: null,
      onboardingComplete: false,
      createdAt: new Date().toISOString(),
      saptaWaraLahir: null,
      pancaWaraLahir: null,
      sadWaraLahir: null,
      wukuLahir: null,
      uripLahir: null,
      uripPetemonLahir: null,
    };
    await setDoc(ref, baru);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
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
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
