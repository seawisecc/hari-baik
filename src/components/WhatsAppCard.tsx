"use client";

import { MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useT } from "@/lib/content/LangProvider";

export const ADMIN_WA = "6281237597759";
export const ADMIN_WA_DISPLAY = "0812-3759-7759";

export function WhatsAppCard({ pesan }: { pesan?: string }) {
  const t = useT();
  const href = `https://wa.me/${ADMIN_WA}${pesan ? `?text=${encodeURIComponent(pesan)}` : ""}`;
  return (
    <Card className="p-7 text-center">
      <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-pill bg-accent-wash hb-raise-1">
        <MessageCircle className="h-5 w-5 text-accent-deep" aria-hidden />
      </span>
      <h3 className="font-heading text-lg font-semibold text-ink">{t("help.title")}</h3>
      <p className="mt-1 text-sm text-ink-soft">{t("help.subtitle")}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{ADMIN_WA_DISPLAY}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex h-11 items-center gap-2 rounded-pill bg-accent px-6 text-[15px] font-medium text-accent-ink hb-raise-2 hover:bg-accent-strong"
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        {t("help.chat")}
      </a>
    </Card>
  );
}
