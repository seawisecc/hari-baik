"use client";

import * as Icons from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useT } from "@/lib/content/LangProvider";
import type { ProfilWatak } from "@/lib/content/kepribadian";

/** Nama ikon di data mengikuti penamaan app lama; petakan ke lucide-react. */
const ICON: Record<string, keyof typeof Icons> = {
  finger: "Hand",
  flower: "Flower2",
  star: "Star",
  moon: "Moon",
  sun: "Sun",
  droplet: "Droplet",
  droplets: "Droplets",
  mountain: "Mountain",
  flame: "Flame",
  wind: "Wind",
  book: "BookOpen",
  waves: "Waves",
  sprout: "Sprout",
  shield: "Shield",
  well: "CircleDot",
  seed: "Sprout",
  dust: "Sparkles",
};

export function WatakCard({ label, profil }: { label: string; profil: ProfilWatak }) {
  const t = useT();
  const name = ICON[profil.icon] ?? "Circle";
  const Icon = (Icons[name] ?? Icons.Circle) as React.ComponentType<{
    className?: string;
  }>;

  return (
    <Card elevation={2}>
      <CardHeader>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-pill bg-accent-wash hb-raise-1">
            <Icon className="h-5 w-5 text-accent-deep" />
          </span>
          <div>
            <CardTitle>{profil.nama}</CardTitle>
            <p className="text-sm text-ink-soft">{profil.simbol}</p>
          </div>
        </div>
      </CardHeader>

      <CardBody className="space-y-5">
        <p className="text-[15px] leading-relaxed text-ink-soft">{profil.kepribadian}</p>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">
            {t("traits.strengths")}
          </p>
          <ul className="space-y-1.5">
            {profil.kekuatan.map((k) => (
              <li key={k} className="flex gap-2.5 text-sm text-ink-soft">
                <span
                  aria-hidden
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-guru"
                />
                {k}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">
            {t("traits.challenges")}
          </p>
          <ul className="space-y-1.5">
            {profil.tantangan.map((k) => (
              <li key={k} className="flex gap-2.5 text-sm text-ink-soft">
                <span
                  aria-hidden
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lara"
                />
                {k}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md bg-surface-sunk px-5 py-4 hb-sink">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">
            {t("traits.advice")}
          </p>
          <p className="text-sm leading-relaxed text-ink">{profil.saran}</p>
        </div>
      </CardBody>
    </Card>
  );
}
