"use client";

import { CalendarDays, Heart, Route, Sparkles, User, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/kalender", label: "Kalender", icon: CalendarDays },
  { href: "/kepribadian", label: "Watak", icon: User },
  { href: "/nama-makna", label: "Nama", icon: Sparkles },
  { href: "/kecocokan", label: "Cocok", icon: Heart },
  { href: "/perjalanan-hidup", label: "Hidup", icon: Route },
  { href: "/profil", label: "Profil", icon: UserCircle },
] as const;

/** Navigasi utama. Disembunyikan di landing dan halaman auth. */
export function BottomNav() {
  const pathname = usePathname();
  const hidden = ["/", "/login", "/register", "/verify-email", "/onboarding"].includes(
    pathname,
  );
  if (hidden) return null;

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed bottom-4 left-1/2 z-20 w-fit max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-pill bg-surface p-1.5 hb-raise-3"
    >
      <ul className="flex items-center gap-1">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-pill px-3.5 py-2 sm:px-4",
                  "transition-[box-shadow,background-color,color] duration-150",
                  active
                    ? "bg-accent text-accent-ink hb-sink-sm"
                    : "text-ink-faint hover:text-ink-soft",
                )}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
