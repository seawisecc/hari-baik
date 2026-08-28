import {
  CalendarDays,
  CalendarSearch,
  FileText,
  Heart,
  Route,
  Shield,
  Sparkles,
  Store,
  Sun,
  User,
  UserCircle,
  UsersRound,
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

/**
 * Fitur yang dibeli terpisah sebagai add-on, bukan dibuka langganan.
 *
 * Dipisah dari NAV_PRO supaya penanda di navigasinya bisa berbeda: yang ini
 * tidak terbuka hanya karena langganan aktif.
 */
export const NAV_ADDON: NavItem[] = [
  {
    href: "/pencari-hari",
    labelKey: "acara.title",
    shortKey: "nav.short.finder",
    icon: CalendarSearch,
  },
  {
    href: "/keluarga",
    labelKey: "keluarga.title",
    shortKey: "nav.short.family",
    icon: UsersRound,
  },
  {
    href: "/laporan",
    labelKey: "laporan.title",
    shortKey: "nav.short.report",
    icon: FileText,
  },
  {
    href: "/fengshui-nama",
    labelKey: "fengshui.title",
    shortKey: "nav.short.fengshui",
    icon: Store,
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

/**
 * Bottom nav mobile: empat tujuan langsung, sisanya lewat "Lainnya".
 *
 * Sebelumnya daftar ini memuat lima tujuan tetap dan kebetulan menjatuhkan
 * Makna Nama serta Perjalanan Hidup, sehingga dua fitur berbayar itu sama
 * sekali tidak bisa dibuka dari ponsel. Sekarang apa pun yang tidak muat di
 * bilah bawah dijamin masih terjangkau lewat NAV_MOBILE_LAINNYA, dan tidak
 * ada rute yang bisa hilang diam-diam lagi.
 */
export const NAV_MOBILE: NavItem[] = [NAV_UTAMA[0], NAV_UTAMA[1], NAV_UTAMA[2], NAV_AKUN[0]];

/** Semua tujuan di luar bilah bawah, muncul di lembar "Lainnya". */
export const NAV_MOBILE_LAINNYA: NavItem[] = [...NAV_PRO, ...NAV_ADDON];

/** Rute yang tampil tanpa shell aplikasi. */
export const RUTE_TELANJANG = [
  "/",
  "/login",
  "/register",
  "/lupa-sandi",
  // Tujuan tautan di email Firebase. Yang membukanya datang dari kotak
  // masuknya, bukan dari dalam aplikasi, dan pada kasus reset kata sandi
  // biasanya belum bisa masuk sama sekali.
  "/aksi",
  "/verify-email",
  "/onboarding",
  // Terkunci berarti terkunci: jangan tampilkan menu yang tidak bisa dibuka.
  "/expired",
];
