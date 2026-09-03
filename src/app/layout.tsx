import type { Metadata, Viewport } from "next";
import { SITUS } from "@/lib/situs";
import { Inter, Source_Serif_4 } from "next/font/google";
import { PWA } from "@/components/PWA";
import { AppShell } from "@/components/shell/AppShell";
import { LangProvider } from "@/lib/content/LangProvider";
import { AuthProvider } from "@/lib/firebase/AuthProvider";
import { ThemeProvider, themeInitScript } from "@/lib/theme/ThemeProvider";
import "./globals.css";

// Serif untuk judul. Source Serif 4 punya berat tebal yang sebenarnya, jadi
// `font-bold` tidak perlu dipalsukan browser, dan bentuknya tetap tenang
// dibaca setiap hari.
const display = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

// Sans untuk teks: Inter dirancang untuk antarmuka, angka dan label kecil
// tetap jernih pada ukuran 11-13px yang banyak dipakai di sini.
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// Dua pihak, dua peran. Seawise Studio yang membangun aplikasinya, Mayaloka
// Digital yang menjalankan layanannya sehari-hari: langganan, pembayaran, dan
// dukungan pelanggan. Keduanya ikut di metadata, bukan hanya di layar, supaya
// terbaca mesin pencari dan pratinjau tautan saat halaman ini dibagikan.
const STUDIO = "Seawise Studio";
const OPERATOR = "Mayaloka Digital";
const JUDUL = "Hari Baik | Kalender Siklus Personal";
/*
 * Ringkasan membawa kailnya, bukan cuma keterangan kategorinya.
 *
 * Ini teks yang benar-benar dibaca orang di pratinjau WhatsApp, dan di sana
 * ia berdiri sendiri tanpa halaman di sekelilingnya untuk menjelaskan. Kalimat
 * yang cuma menyebutkan apa produknya menyerahkan seluruh pekerjaan menarik
 * perhatian kepada judul dan gambar. Ketiga tradisinya ikut disebut, karena
 * pratinjau yang hanya menyebut satu daerah membuat sebagian orang
 * menyimpulkan aplikasinya bukan untuk mereka sebelum sempat menekan
 * tautannya, jadi yang disebut nama sistemnya, bukan asal daerahnya.
 */
const RINGKASAN =
  "Sudah kerja keras, tapi kenapa hasilnya sering meleset? Kalender siklus personal yang dihitung dari tanggal lahirmu, memadukan wariga, primbon, dan fengshui.";

export const metadata: Metadata = {
  // metadataBase membuat URL gambar jadi absolut. Tanpa ini WhatsApp dan
  // aplikasi chat lain menerima path relatif yang tidak bisa mereka ambil,
  // dan pratinjaunya muncul tanpa gambar.
  metadataBase: new URL(SITUS),
  title: JUDUL,
  description: RINGKASAN,
  applicationName: "Hari Baik",
  authors: [{ name: STUDIO }, { name: OPERATOR }],
  creator: STUDIO,
  publisher: OPERATOR,
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITUS,
    siteName: "Hari Baik",
    title: JUDUL,
    description: `${RINGKASAN} Dikembangkan ${STUDIO}, dioperasikan ${OPERATOR}.`,
  },
  appleWebApp: {
    capable: true,
    title: "Hari Baik",
    statusBarStyle: "default",
  },
  twitter: {
    card: "summary_large_image",
    title: JUDUL,
    description: RINGKASAN,
  },
};

export const viewport: Viewport = {
  themeColor: "#f2f0ec",
  width: "device-width",
  initialScale: 1,
  /*
   * Wajib ada selama ada yang memakai `env(safe-area-inset-*)`.
   *
   * Tanpa `viewport-fit=cover`, iOS tidak pernah mengisi keempat inset itu:
   * nilainya 0 di semua perangkat, jadi `pb-[env(safe-area-inset-bottom)]`
   * pada bilah bawah tidak menghasilkan apa-apa. Digabung dengan
   * `appleWebApp.capable` di atas, yang menaruh aplikasi ini dalam mode
   * standalone dan memberinya seluruh tinggi layar, bilah bawah jadi
   * berhimpit dengan home indicator dan tidak punya ruang yang dijanjikan
   * kodenya. Dijaga `src/lib/__tests__/viewport.test.ts`.
   */
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-theme="mint" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${display.variable} ${body.variable}`}>
        <ThemeProvider>
          <LangProvider>
            <AuthProvider>
              <AppShell>{children}</AppShell>
              <PWA />
            </AuthProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
