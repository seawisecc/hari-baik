import {
  CalendarDays,
  Heart,
  Route,
  Shield,
  Sparkles,
  Sun,
  User,
  UserCircle,
  type LucideIcon,
} from "lucide-react";

import { RUTE_PRO } from "./gate";

export interface NavItem {
  href: string;
  label: string;
  /** Label pendek untuk bottom nav di layar sempit. */
  short: string;
  icon: LucideIcon;
}

/** Urutan mengikuti alur pemakaian harian: hari ini dulu, kalender kedua. */
export const NAV_UTAMA: NavItem[] = [
  { href: "/hari-ini", label: "Hari Ini", short: "Hari Ini", icon: Sun },
  { href: "/kalender", label: "Kalender", short: "Kalender", icon: CalendarDays },
  { href: "/kepribadian", label: "Kepribadian", short: "Watak", icon: User },
];

export const NAV_PRO: NavItem[] = [
  { href: "/nama-makna", label: "Makna Nama", short: "Nama", icon: Sparkles },
  { href: "/kecocokan", label: "Kecocokan", short: "Cocok", icon: Heart },
  {
    href: "/perjalanan-hidup",
    label: "Perjalanan Hidup",
    short: "Hidup",
    icon: Route,
  },
];

/** True bila rute ini butuh langganan aktif. */
export const butuhPro = (href: string) => href in RUTE_PRO;

export const NAV_AKUN: NavItem[] = [
  { href: "/profil", label: "Profil", short: "Profil", icon: UserCircle },
];

export const NAV_ADMIN: NavItem = {
  href: "/admin",
  label: "Admin",
  short: "Admin",
  icon: Shield,
};

/** Bottom nav mobile hanya memuat lima yang paling sering dipakai. */
export const NAV_MOBILE: NavItem[] = [
  NAV_UTAMA[0],
  NAV_UTAMA[1],
  NAV_PRO[1],
  NAV_UTAMA[2],
  NAV_AKUN[0],
];

/** Rute yang tampil tanpa shell aplikasi. */
export const RUTE_TELANJANG = [
  "/",
  "/login",
  "/register",
  "/lupa-sandi",
  "/verify-email",
  "/onboarding",
  // Terkunci berarti terkunci: jangan tampilkan menu yang tidak bisa dibuka.
  "/expired",
];
