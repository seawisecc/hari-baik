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
  /** Kunci terjemahan, bukan teks jadi: label diterjemahkan saat dirender. */
  labelKey: string;
  /** Kunci label pendek untuk bottom nav di layar sempit. */
  shortKey: string;
  icon: LucideIcon;
}

/** Urutan mengikuti alur pemakaian harian: hari ini dulu, kalender kedua. */
export const NAV_UTAMA: NavItem[] = [
  { href: "/hari-ini", labelKey: "nav.today", shortKey: "nav.short.today", icon: Sun },
  {
    href: "/kalender",
    labelKey: "nav.calendar",
    shortKey: "nav.short.calendar",
    icon: CalendarDays,
  },
  {
    href: "/kepribadian",
    labelKey: "nav.personality",
    shortKey: "nav.short.personality",
    icon: User,
  },
];

export const NAV_PRO: NavItem[] = [
  {
    href: "/nama-makna",
    labelKey: "pro.nama.title",
    shortKey: "nav.short.name",
    icon: Sparkles,
  },
  {
    href: "/kecocokan",
    labelKey: "pro.petemon.title",
    shortKey: "nav.short.match",
    icon: Heart,
  },
  {
    href: "/perjalanan-hidup",
    labelKey: "pro.nasib.title",
    shortKey: "nav.short.journey",
    icon: Route,
  },
];

/** True bila rute ini butuh langganan aktif. */
export const butuhPro = (href: string) => href in RUTE_PRO;

export const NAV_AKUN: NavItem[] = [
  {
    href: "/profil",
    labelKey: "nav.profile",
    shortKey: "nav.short.profile",
    icon: UserCircle,
  },
];

export const NAV_ADMIN: NavItem = {
  href: "/admin",
  labelKey: "nav.admin",
  shortKey: "nav.admin",
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
