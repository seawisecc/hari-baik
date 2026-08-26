"use client";

import { Check, Quote, X } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useLang, useT } from "@/lib/content/LangProvider";
import { getPanduan } from "@/lib/content/panduan";
import type { KategoriName } from "@/lib/wariga";

export function PanduanCard({ kategori }: { kategori: KategoriName }) {
  const t = useT();
  const { lang } = useLang();
  const panduan = getPanduan(lang, kategori);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("assist.title")}</CardTitle>
      </CardHeader>
      <CardBody className="space-y-6">
        {/* Dua kolom di layar lebar: "lakukan" dan "tunda" dibaca berdampingan. */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Daftar
            label={t("assist.supported")}
            items={panduan.supported}
            icon={Check}
            iconClass="text-guru-teks"
          />
          <Daftar
            label={t("assist.postpone")}
            items={panduan.postpone}
            icon={X}
            iconClass="text-pati-teks"
          />
        </div>

        <div className="rounded-md bg-surface-sunk px-5 py-4 hb-sink">
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
            <Quote className="h-3 w-3" aria-hidden />
            {t("assist.affirmation")}
          </p>
          <p className="font-heading text-[15px] italic leading-relaxed text-ink">
            {panduan.affirmation}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

function Daftar({
  label,
  items,
  icon: Icon,
  iconClass,
}: {
  label: string;
  items: string[];
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
}) {
  return (
    <div>
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
        {label}
      </p>
      <ul className="space-y-2">
        {items.map((s) => (
          <li key={s} className="flex gap-2.5 text-sm leading-relaxed text-ink-soft">
            <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${iconClass}`} aria-hidden />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
