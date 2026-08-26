"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { RUTE_TUJUAN, tentukanAlihan } from "@/lib/gate";

/**
 * Satu tempat yang memutuskan siapa boleh melihat apa.
 *
 * Ditaruh di kerangka aplikasi, bukan diulang di tiap halaman, supaya
 * halaman baru otomatis ikut terjaga dan tidak ada yang terlewat.
 * Keputusannya sendiri ada di `tentukanAlihan`, yang bisa diuji terpisah.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, profile, access, loading, configured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const alihkan = tentukanAlihan({
    pathname,
    configured,
    loading,
    signedIn: !!user,
    emailVerified: !!user?.emailVerified,
    onboardingComplete: profile ? profile.onboardingComplete : null,
    canView: access.canView,
    isAdmin: profile?.role === "admin",
  });

  useEffect(() => {
    if (alihkan) router.replace(alihkan);
  }, [alihkan, router]);

  if (configured && loading) return <LayarTunggu />;

  // Jangan tampilkan isi halaman yang sebentar lagi ditinggalkan; itu membuat
  // konten terkunci sempat terlihat sekejap.
  if (alihkan && !RUTE_TUJUAN.has(pathname)) return <LayarTunggu />;

  return <>{children}</>;
}

function LayarTunggu() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-6">
      <p className="text-sm text-ink-faint">Memuat…</p>
    </div>
  );
}
