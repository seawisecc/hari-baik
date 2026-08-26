"use client";

import { usePathname } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { RUTE_TELANJANG } from "@/lib/nav";

/**
 * Kerangka aplikasi.
 *
 * Desktop (≥lg): sidebar tetap di kiri, konten di sisanya.
 * Mobile: top bar + bottom nav, konten selebar layar.
 *
 * Landing dan halaman auth tidak memakai shell: di sana navigasi aplikasi
 * belum relevan dan justru membingungkan.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const telanjang = RUTE_TELANJANG.includes(pathname);

  if (telanjang) return <AuthGate>{children}</AuthGate>;

  return (
    <div className="lg:pl-64">
      <Sidebar />
      <TopBar />
      {/* Padding bawah menyediakan ruang untuk bottom nav di mobile. */}
      <div className="pb-24 lg:pb-10">
        {/* `key` pada pathname membuat React memasang ulang isi tiap pindah
            halaman, sehingga animasi masuknya berjalan lagi. Tanpa itu, hanya
            halaman pertama yang beranimasi. */}
        <div key={pathname} className="hb-masuk">
          <AuthGate>{children}</AuthGate>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

/**
 * Pembungkus isi halaman: lebar baca yang nyaman, dan lebih lega di desktop.
 * `wide` untuk halaman yang butuh ruang (kalender, tabel admin).
 */
export function PageContainer({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={`mx-auto w-full px-5 py-6 sm:px-8 lg:py-10 ${wide ? "max-w-5xl" : "max-w-3xl"}`}
    >
      {children}
    </div>
  );
}
