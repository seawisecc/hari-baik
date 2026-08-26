"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LangToggle } from "@/components/ui/LangToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";
import { NAV_ADMIN, NAV_AKUN, NAV_PRO, NAV_UTAMA, type NavItem } from "@/lib/nav";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { useUserData } from "@/lib/useUserData";

function Item({ item, locked }: { item: NavItem; locked: boolean }) {
  const pathname = usePathname();
  const active = pathname === item.href;
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium",
          "transition-[box-shadow,background-color,color] duration-150",
          active
            ? "bg-accent text-accent-ink hb-raise-1"
            : "text-ink-soft hover:bg-surface-sunk hover:text-ink",
        )}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
        <span className="flex-1 truncate">{item.label}</span>
        {locked && (
          <span
            className="rounded-pill bg-surface-sunk px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-ink-faint"
            title="Butuh langganan aktif"
          >
            PRO
          </span>
        )}
      </Link>
    </li>
  );
}

function Grup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-3.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
        {label}
      </p>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

function Baris({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 px-1">
      <span className="text-[11px] font-medium text-ink-faint">{label}</span>
      {children}
    </div>
  );
}

export function Sidebar() {
  const { profile } = useAuth();
  const { access } = useUserData();
  const terkunci = !access.isPro;

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border-soft bg-surface px-4 py-6 lg:flex">
      <Link href="/hari-ini" className="px-3.5 pb-8">
        <p className="font-heading text-2xl font-bold italic text-ink">Hari Baik</p>
        <p className="mt-0.5 text-[11px] text-ink-faint">Kalender siklus personal</p>
      </Link>

      <nav aria-label="Navigasi utama" className="flex-1 space-y-6 overflow-y-auto">
        <Grup label="Harian">
          {NAV_UTAMA.map((i) => (
            <Item key={i.href} item={i} locked={false} />
          ))}
        </Grup>

        <Grup label="Analisis">
          {NAV_PRO.map((i) => (
            <Item key={i.href} item={i} locked={terkunci} />
          ))}
        </Grup>

        <Grup label="Akun">
          {NAV_AKUN.map((i) => (
            <Item key={i.href} item={i} locked={false} />
          ))}
          {profile?.role === "admin" && <Item item={NAV_ADMIN} locked={false} />}
        </Grup>
      </nav>

      {/* Ditumpuk, bukan berdampingan: dua toggle tidak muat berjajar di 256px. */}
      <div className="space-y-3 border-t border-border-soft pt-4">
        <Baris label="Bahasa">
          <LangToggle />
        </Baris>
        <Baris label="Tema">
          <ThemeToggle />
        </Baris>
      </div>
    </aside>
  );
}
