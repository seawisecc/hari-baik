import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
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

const SITUS = "https://haribaik.seawise.id";
const JUDUL = "Hari Baik | Kalender Siklus Personal";
const RINGKASAN =
  "Kalender siklus personal yang dihitung dari tanggal lahirmu, memadukan Wariga dan kalender Bali dengan kalender Masehi.";

export const metadata: Metadata = {
  // metadataBase membuat URL gambar jadi absolut. Tanpa ini WhatsApp dan
  // aplikasi chat lain menerima path relatif yang tidak bisa mereka ambil,
  // dan pratinjaunya muncul tanpa gambar.
  metadataBase: new URL(SITUS),
  title: JUDUL,
  description: RINGKASAN,
  applicationName: "Hari Baik",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITUS,
    siteName: "Hari Baik",
    title: JUDUL,
    description: RINGKASAN,
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
            </AuthProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
