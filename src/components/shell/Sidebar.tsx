"use client";

import { Wordmark } from "@/components/ui/Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LangToggle } from "@/components/ui/LangToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";
import { NAV_ADMIN, NAV_AKUN, NAV_PRO, NAV_UTAMA, butuhPro, type NavItem } from "@/lib/nav";
import { useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { useUserData } from "@/lib/useUserData";

function Item({ item, terkunci }: { item: NavItem; terkunci: boolean }) {
  const t = useT();
  const pathname = usePathname();
  const active = pathname === item.href;
  const Icon = item.icon;
  // Penanda hanya muncul untuk rute Pro yang memang sedang terkunci.
  const tampilkanPro = terkunci && butuhPro(item.href);

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
        <span className="flex-1 truncate">{t(item.labelKey)}</span>
        {tampilkanPro && (
          <span
            className="rounded-pill bg-surface-sunk px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-ink-faint"
            title={t("pro.lock.title")}
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
  const t = useT();
  const { profile } = useAuth();
  const { access } = useUserData();
  const terkunci = !access.isPro;

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border-soft bg-surface px-4 py-6 lg:flex">
      <Link href="/hari-ini" className="px-3.5 pb-8">
        <Wordmark size={30} textClassName="text-2xl" />
        <p className="mt-1.5 text-[11px] text-ink-faint">{t("app.subtitle.short")}</p>
      </Link>

      <nav aria-label={t("nav.mainLabel")} className="flex-1 space-y-6 overflow-y-auto">
        <Grup label={t("nav.group.daily")}>
          {NAV_UTAMA.map((i) => (
            <Item key={i.href} item={i} terkunci={false} />
          ))}
        </Grup>

        <Grup label={t("nav.group.analysis")}>
          {NAV_PRO.map((i) => (
            <Item key={i.href} item={i} terkunci={terkunci} />
          ))}
        </Grup>

        <Grup label={t("nav.group.account")}>
          {NAV_AKUN.map((i) => (
            <Item key={i.href} item={i} terkunci={false} />
          ))}
          {profile?.role === "admin" && <Item item={NAV_ADMIN} terkunci={false} />}
        </Grup>
      </nav>

      {/* Ditumpuk, bukan berdampingan: dua toggle tidak muat berjajar di 256px. */}
      <div className="space-y-3 border-t border-border-soft pt-4">
        <Baris label={t("settings.language")}>
          <LangToggle />
        </Baris>
        <Baris label={t("settings.theme")}>
          <ThemeToggle />
        </Baris>
        <p className="px-1 pt-1 text-[10px] leading-relaxed text-ink-faint">{t("studio.by")}</p>
      </div>
    </aside>
  );
}
