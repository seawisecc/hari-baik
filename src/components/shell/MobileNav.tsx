"use client";

import { MoreHorizontal, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { LangToggle } from "@/components/ui/LangToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { useUserData } from "@/lib/useUserData";
import { NAV_ADMIN, NAV_MOBILE, NAV_MOBILE_LAINNYA, butuhPro, type NavItem } from "@/lib/nav";

/** Bottom nav, hanya di bawah lg; di desktop digantikan Sidebar. */
export function MobileNav() {
  const t = useT();
  const pathname = usePathname();
  const { profile } = useAuth();
  const { access } = useUserData();
  // Lembar disimpan sebagai "dibuka di halaman mana", bukan boolean. Dengan
  // begitu perpindahan halaman menutupnya dengan sendirinya, termasuk lewat
  // tombol kembali, tanpa perlu efek yang memanggil setState.
  const [dibukaDi, setDibukaDi] = useState<string | null>(null);
  const bukaLainnya = dibukaDi === pathname;
  const setBukaLainnya = (buka: boolean) => setDibukaDi(buka ? pathname : null);

  const lainnya: NavItem[] = [
    ...NAV_MOBILE_LAINNYA,
    ...(profile?.role === "admin" ? [NAV_ADMIN] : []),
  ];
  const adaDiLainnya = lainnya.some((i) => i.href === pathname);

  // Kunci gulir latar selama lembar terbuka, dan pulihkan nilai aslinya
  // saat ditutup, bukan menimpanya dengan "" begitu saja.
  useEffect(() => {
    if (!bukaLainnya) return;
    const asal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = asal;
    };
  }, [bukaLainnya]);

  useEffect(() => {
    if (!bukaLainnya) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setDibukaDi(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [bukaLainnya]);

  return (
    <>
      {bukaLainnya && (
        <LembarLainnya
          item={lainnya}
          terkunci={!access.isPro}
          onTutup={() => setBukaLainnya(false)}
        />
      )}

      <nav
        aria-label={t("nav.mainLabel")}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1.5">
          {NAV_MOBILE.map((item) => (
            <Slot
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={t(item.shortKey)}
              aktif={pathname === item.href}
            />
          ))}
          <Slot
            icon={MoreHorizontal}
            label={t("nav.short.more")}
            aktif={adaDiLainnya || bukaLainnya}
            onKlik={() => setBukaLainnya(!bukaLainnya)}
            expanded={bukaLainnya}
          />
        </ul>
      </nav>
    </>
  );
}

/** Satu petak bilah bawah. Bisa berupa tautan atau tombol. */
function Slot({
  href,
  icon: Icon,
  label,
  aktif,
  onKlik,
  expanded,
}: {
  href?: string;
  icon: NavItem["icon"];
  label: string;
  aktif: boolean;
  onKlik?: () => void;
  expanded?: boolean;
}) {
  const isi = (
    <>
      <span
        className={cn(
          "flex h-8 w-12 items-center justify-center rounded-pill transition-colors duration-150",
          aktif && "bg-accent-wash",
        )}
      >
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </span>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </>
  );

  const kelas = cn(
    "flex w-full flex-col items-center gap-1 rounded-md py-1.5",
    "transition-colors duration-150",
    aktif ? "text-accent-deep" : "text-ink-faint",
  );

  return (
    <li className="flex-1">
      {href ? (
        <Link href={href} aria-current={aktif ? "page" : undefined} className={kelas}>
          {isi}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onKlik}
          aria-expanded={expanded}
          aria-haspopup="menu"
          className={kelas}
        >
          {isi}
        </button>
      )}
    </li>
  );
}

/**
 * Lembar "Lainnya": tujuan yang tidak muat di bilah bawah.
 *
 * Naik dari bawah, bukan menu melayang, supaya tetap dalam jangkauan ibu jari
 * di layar besar.
 */
function LembarLainnya({
  item,
  terkunci,
  onTutup,
}: {
  item: NavItem[];
  terkunci: boolean;
  onTutup: () => void;
}) {
  const t = useT();
  const pathname = usePathname();

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label={t("nav.more.close")}
        onClick={onTutup}
        className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]"
      />

      <div
        role="menu"
        aria-label={t("nav.more.title")}
        className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-lg border-t border-border-soft bg-surface pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-[0_-8px_28px_rgb(88_80_70/0.16)]"
      >
        <div className="flex items-center justify-between gap-4 px-5 pb-3 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
            {t("nav.group.analysis")}
          </p>
          <button
            type="button"
            onClick={onTutup}
            aria-label={t("nav.more.close")}
            className="grid h-8 w-8 place-items-center rounded-pill text-ink-faint hover:bg-surface-sunk hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <ul className="space-y-1 px-3">
          {item.map((i) => {
            const Icon = i.icon;
            const aktif = pathname === i.href;
            const pro = terkunci && butuhPro(i.href);
            return (
              <li key={i.href}>
                <Link
                  href={i.href}
                  role="menuitem"
                  aria-current={aktif ? "page" : undefined}
                  onClick={onTutup}
                  className={cn(
                    "flex items-center gap-3.5 rounded-md px-4 py-3.5 text-[15px] font-medium",
                    "transition-colors duration-150",
                    aktif
                      ? "bg-accent text-accent-ink"
                      : "text-ink-soft hover:bg-surface-sunk hover:text-ink",
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                  <span className="flex-1 truncate">{t(i.labelKey)}</span>
                  {pro && (
                    <span className="shrink-0 rounded-pill bg-surface-sunk px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-ink-faint">
                      PRO
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 space-y-3 border-t border-border-soft px-5 pt-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-medium text-ink-faint">
              {t("settings.language")}
            </span>
            <LangToggle />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-medium text-ink-faint">
              {t("settings.theme")}
            </span>
            <ThemeToggle compact />
          </div>
        </div>
      </div>
    </div>
  );
}
