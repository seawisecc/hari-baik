"use client";

import type { User } from "firebase/auth";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { evaluateAccess } from "@/lib/subscription";
import type { AccessState, UserProfile } from "@/types";
import { firebase, firebaseConfigured } from "./client";

interface AuthContextValue {
  /** null = belum login. undefined tidak dipakai: cek `loading` dulu. */
  user: User | null;
  /** Dibaca dari sini, bukan dari `user.emailVerified`, agar ikut menyegar. */
  emailVerified: boolean;
  profile: UserProfile | null;
  access: AccessState;
  loading: boolean;
  configured: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  /**
   * Masuk dengan akun Google.
   *
   * Mengembalikan true bila urusannya selesai di halaman ini, false bila
   * peramban dialihkan ke Google dan akan kembali lagi nanti. Pemanggil perlu
   * membedakan keduanya: pada jalur redirect tidak ada gunanya router.push,
   * halamannya sudah ditinggalkan.
   */
  loginWithGoogle: () => Promise<boolean>;
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

/**
 * Aplikasi sedang berjalan sebagai aplikasi terpasang, bukan di dalam tab.
 *
 * Penting untuk cara masuk dengan Google. Di mode standalone iOS, jendela
 * popup dibuka Safari sebagai konteks terpisah yang tidak bisa mengembalikan
 * hasilnya ke aplikasi, jadi signInWithPopup menggantung tanpa pesan apa pun.
 * Aplikasi ini memang berjalan standalone di iPhone (appleWebApp.capable),
 * jadi jalur redirect bukan kasus langka di sini, melainkan jalur normal bagi
 * setiap pengguna yang memasang aplikasinya.
 */
function modeTerpasang(): boolean {
  if (typeof window === "undefined") return false;
  const iosStandalone = (window.navigator as { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia?.("(display-mode: standalone)").matches === true;
}

/*
 * Penanda bahwa alur redirect Google sedang berjalan.
 *
 * Disimpan di sessionStorage milik domain aplikasi sendiri, bukan milik
 * authDomain, jadi ia tidak ikut terkena pemisahan penyimpanan lintas situs
 * yang justru sering merusak alurnya. Umurnya satu tab, dan itu memang
 * secukupnya: kalau tabnya ditutup di tengah jalan, tidak ada yang perlu
 * dilaporkan kepada siapa pun.
 *
 * Semua pembacaan dibungkus try: mode penyamaran dan pengaturan privasi yang
 * ketat bisa membuat sessionStorage melempar, bukan sekadar kosong, dan
 * penanda yang gagal dibaca tidak boleh menggagalkan proses masuk.
 */
const PENANDA = "hb-google-redirect";
const KEGAGALAN = "hb-google-gagal";

function tandaiRedirect() {
  try {
    sessionStorage.setItem(PENANDA, "1");
  } catch {}
}

function ambilPenandaRedirect(): boolean {
  try {
    return sessionStorage.getItem(PENANDA) === "1";
  } catch {
    return false;
  }
}

function lupakanRedirect() {
  try {
    sessionStorage.removeItem(PENANDA);
  } catch {}
}

function simpanKegagalanGoogle(kode: string) {
  try {
    sessionStorage.setItem(KEGAGALAN, kode);
  } catch {}
}

/**
 * Ambil sekali lalu buang: kegagalan alur redirect yang perlu ditampilkan.
 *
 * Dibaca tombol Google saat halamannya kembali dimuat. Dibuang begitu dibaca,
 * supaya tidak muncul lagi pada kunjungan berikutnya di tab yang sama.
 */
export function ambilKegagalanGoogle(): string | null {
  try {
    const kode = sessionStorage.getItem(KEGAGALAN);
    if (kode !== null) sessionStorage.removeItem(KEGAGALAN);
    return kode;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Status verifikasi disimpan terpisah dari objek User. `reload()` mengubah
  // objek yang sama di tempat, jadi tidak ada referensi baru yang memicu
  // render, dan menyalinnya untuk memaksa render justru membuang seluruh
  // method Firebase di prototype-nya.
  const [emailVerified, setEmailVerified] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // Kalau Firebase belum dikonfigurasi, tidak ada yang ditunggu.
  const [loading, setLoading] = useState(firebaseConfigured);

  /*
   * Halaman depan tidak pernah memakai status masuk: header-nya selalu
   * menampilkan tombol Masuk, dan isinya sama untuk semua pengunjung. Karena
   * AuthProvider dipasang di kerangka paling luar, tanpa pengecualian ini
   * setiap pengunjung pertama tetap mengunduh SDK Firebase hanya untuk
   * berlangganan status yang tidak dipakai halaman itu.
   *
   * Halaman masuk dan daftar sengaja TIDAK dikecualikan: keduanya memang akan
   * memerlukan Firebase sebentar lagi, jadi memuatnya lebih awal justru
   * membuat penekanan tombolnya terasa lebih cepat.
   */
  const pathname = usePathname();
  const perluAuth = pathname !== "/";

  useEffect(() => {
    if (!firebaseConfigured || !perluAuth) return;
    // Firebase dimuat setelah halaman tampil, jadi berhenti berlangganan bisa
    // diminta sebelum SDK-nya selesai datang. Tandanya disimpan supaya
    // langganan yang telat tiba langsung dilepas lagi.
    let batal = false;
    let lepas: (() => void) | undefined;
    void (async () => {
      try {
        const { auth, fn } = await firebase();
        if (batal) return;

        /*
         * Kembali dari alur redirect Google.
         *
         * Di jalur popup, bootstrapProfile dipanggil di loginWithGoogle. Di
         * jalur redirect tidak bisa: halamannya sudah dibuang dan dimuat ulang,
         * jadi tidak ada apa pun yang tersisa dari pemanggilan itu. Tanpa
         * pemanggilan di sini, pengguna kembali dalam keadaan sudah masuk tapi
         * tanpa dokumen profil, dan tentukanAlihan() tidak mengirimnya ke mana
         * pun karena onboardingComplete-nya null. Layarnya diam, dan tidak ada
         * yang salah kelihatannya.
         */
        void fn
          .getRedirectResult(auth)
          .then(async (hasil) => {
            if (hasil?.user) {
              await bootstrapProfile(hasil.user);
              lupakanRedirect();
              return;
            }
            // Kembali dari redirect tanpa membawa siapa pun. Firebase tidak
            // melempar apa pun di sini, ia hanya mengembalikan null, jadi
            // tanpa penanda ini halamannya diam saja dan orangnya tidak tahu
            // apakah dia sudah masuk atau belum.
            if (ambilPenandaRedirect()) {
              lupakanRedirect();
              simpanKegagalanGoogle("auth/redirect-tanpa-hasil");
            }
          })
          .catch((err) => {
            lupakanRedirect();
            simpanKegagalanGoogle((err as { code?: string }).code ?? "");
            console.error("[redirect google]", err);
          });

        lepas = fn.onAuthStateChanged(auth, (u) => {
          setUser(u);
          setEmailVerified(!!u?.emailVerified);
          if (!u) {
            setProfile(null);
            setLoading(false);
          }
        });
      } catch {
        // Firebase gagal dimuat: jangan menahan aplikasi di layar tunggu.
        if (!batal) setLoading(false);
      }
    })();
    return () => {
      batal = true;
      lepas?.();
    };
  }, [perluAuth]);

  // Profil di-subscribe, bukan sekali baca: saat admin mengaktifkan langganan,
  // status di perangkat pengguna ikut berubah tanpa perlu reload.
  useEffect(() => {
    if (!user || !firebaseConfigured) return;
    let batal = false;
    let lepas: (() => void) | undefined;
    void (async () => {
      try {
        const { db, fn } = await firebase();
        if (batal) return;
        lepas = fn.onSnapshot(
          fn.doc(db, "users", user.uid),
          (snap) => {
            setProfile(
              snap.exists() ? ({ uid: user.uid, ...snap.data() } as UserProfile) : null,
            );
            setLoading(false);
          },
          () => setLoading(false),
        );
      } catch {
        if (!batal) setLoading(false);
      }
    })();
    return () => {
      batal = true;
      lepas?.();
    };
  }, [user]);

  const register = useCallback(async (email: string, password: string) => {
    const { auth, fn } = await firebase();
    const cred = await fn.createUserWithEmailAndPassword(auth, email, password);
    await fn.sendEmailVerification(cred.user);
    await bootstrapProfile(cred.user);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { auth, fn } = await firebase();
    const cred = await fn.signInWithEmailAndPassword(auth, email, password);
    // Jaring pengaman: kalau pendaftaran dulu terputus sebelum profil dibuat,
    // ini membuatnya sekarang. Tidak mengubah apa pun bila profil sudah ada.
    await bootstrapProfile(cred.user);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const { auth, fn } = await firebase();
    const provider = new fn.GoogleAuthProvider();
    // Selalu tanyakan akun mana yang dipakai, jangan diam-diam meneruskan yang
    // terakhir dipakai di peramban ini. Satu ponsel sering dipakai berdua.
    provider.setCustomParameters({ prompt: "select_account" });

    if (modeTerpasang()) {
      await fn.signInWithRedirect(auth, provider);
      return false;
    }

    try {
      const cred = await fn.signInWithPopup(auth, provider);
      // Sama seperti login biasa: profil dibuat server, dan memanggilnya untuk
      // yang sudah punya profil tidak mengubah apa pun.
      await bootstrapProfile(cred.user);
      return true;
    } catch (err) {
      const kode = (err as { code?: string }).code ?? "";

      /*
       * Jatuh ke redirect hanya untuk kegagalan yang memang khas popup.
       *
       * Sempat dibuat sebaliknya, yaitu semua kegagalan dicoba ulang lewat
       * redirect kecuali pembatalan. Itu keliru, dan keliru ke arah yang
       * berbahaya. Kegagalan tersering di Safari, auth/missing-initial-state,
       * berasal dari pemisahan penyimpanan lintas situs, dan itu menimpa
       * redirect persis sama seperti popup. Mencobanya ulang bukan pemulihan:
       * halamannya ditinggalkan, orangnya kembali dalam keadaan tetap belum
       * masuk, dan kali ini tanpa pesan apa pun. Kegagalan senyap lebih buruk
       * daripada kegagalan yang berkata.
       *
       * Yang benar-benar tertolong redirect cuma dua: popup yang diblokir, dan
       * lingkungan yang memang tidak mengenal popup sama sekali.
       */
      const popupSaja =
        kode === "auth/popup-blocked" ||
        kode === "auth/operation-not-supported-in-this-environment";
      if (!popupSaja) throw err;

      console.warn("[google] popup tidak tersedia, beralih ke redirect:", kode);
      tandaiRedirect();
      await fn.signInWithRedirect(auth, provider);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    const { auth, fn } = await firebase();
    await fn.signOut(auth);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { auth, fn } = await firebase();
    await fn.sendPasswordResetEmail(auth, email);
  }, []);

  const resendVerification = useCallback(async () => {
    const { auth, fn } = await firebase();
    const current = auth.currentUser;
    if (current) await fn.sendEmailVerification(current);
  }, []);

  const refreshUser = useCallback(async () => {
    const { auth } = await firebase();
    const current = auth.currentUser;
    if (!current) return false;
    // emailVerified ikut token, jadi baru berubah setelah ditarik ulang.
    await current.reload();
    await current.getIdToken(true);
    setEmailVerified(current.emailVerified);
    return current.emailVerified;
  }, []);

  const access = useMemo(() => (profile ? evaluateAccess(profile) : LOCKED), [profile]);

  const value = useMemo(
    () => ({
      user,
      emailVerified,
      profile,
      access,
      loading,
      configured: firebaseConfigured,
      register,
      login,
      loginWithGoogle,
      logout,
      resetPassword,
      resendVerification,
      refreshUser,
    }),
    [
      user,
      emailVerified,
      profile,
      access,
      loading,
      register,
      login,
      loginWithGoogle,
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
