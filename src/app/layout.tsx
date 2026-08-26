import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { AppShell } from "@/components/shell/AppShell";
import { LangProvider } from "@/lib/content/LangProvider";
import { AuthProvider } from "@/lib/firebase/AuthProvider";
import { ThemeProvider, themeInitScript } from "@/lib/theme/ThemeProvider";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hari Baik — Kalender Siklus Personal",
  description:
    "Kalender siklus personal yang dihitung dari tanggal lahirmu, memadukan Wariga dan kalender Bali dengan kalender Masehi.",
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
