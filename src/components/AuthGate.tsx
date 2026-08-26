"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { ProLocked } from "@/components/ProGate";
import { RangkaHalaman } from "@/components/ui/Rangka";
import {
  RUTE_ADDON,
  RUTE_PRO,
  RUTE_TUJUAN,
  perluLayarTunggu,
  tentukanAlihan,
} from "@/lib/gate";

/**
 * Satu tempat yang memutuskan siapa boleh melihat apa.
 *
 * Ditaruh di kerangka aplikasi, bukan diulang di tiap halaman, supaya
 * halaman baru otomatis ikut terjaga dan tidak ada yang terlewat.
 * Keputusannya sendiri ada di `tentukanAlihan`, yang bisa diuji terpisah.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, emailVerified, profile, access, loading, configured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const alihkan = tentukanAlihan({
    pathname,
    configured,
    loading,
    signedIn: !!user,
    emailVerified,
    onboardingComplete: profile ? profile.onboardingComplete : null,
    canView: access.canView,
    isAdmin: profile?.role === "admin",
  });

  useEffect(() => {
    if (alihkan) router.replace(alihkan);
  }, [alihkan, router]);

  if (perluLayarTunggu({ pathname, configured, loading })) return <LayarTunggu />;

  // Jangan tampilkan isi halaman yang sebentar lagi ditinggalkan; itu membuat
  // konten terkunci sempat terlihat sekejap.
  if (alihkan && !RUTE_TUJUAN.has(pathname)) return <LayarTunggu />;

  // Fitur Pro: bukan dialihkan, tapi diganti layar kunci di tempat, supaya
  // pengguna tahu fitur apa yang sedang dikunci dan kenapa.
  const pro = RUTE_PRO[pathname];
  if (pro && configured && !access.isPro) {
    return <ProLocked titleKey={pro.titleKey} descKey={pro.descKey} />;
  }

  // Add-on dibeli terpisah dari langganan, jadi diperiksa terpisah juga.
  // Langganan aktif saja tidak membukanya, dan admin dikecualikan supaya
  // bisa melihat sendiri apa yang dijualnya.
  const addon = RUTE_ADDON[pathname];
  if (addon && configured && profile?.role !== "admin") {
    const dimiliki = profile?.addOn?.includes(addon.addOnId) ?? false;
    if (!dimiliki) {
      return <ProLocked titleKey={addon.titleKey} descKey={addon.descKey} />;
    }
  }

  return <>{children}</>;
}

function LayarTunggu() {
  return <RangkaHalaman />;
}
