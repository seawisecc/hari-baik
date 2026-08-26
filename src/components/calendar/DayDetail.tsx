"use client";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { getPanduan } from "@/lib/content/panduan";
import { getWeton } from "@/lib/content/weton";
import { useLang, useT } from "@/lib/content/LangProvider";
import { cn } from "@/lib/cn";
import { getWarigaDay, type KategoriName } from "@/lib/wariga";

const TONE: Record<KategoriName, string> = {
  GURU: "bg-guru",
  RATU: "bg-ratu",
  LARA: "bg-lara",
  PATI: "bg-pati",
};

const KEY: Record<KategoriName, string> = {
  GURU: "guru",
  RATU: "ratu",
  LARA: "lara",
  PATI: "pati",
};

function formatTanggal(dateStr: string, lang: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString(
    lang === "en" ? "en-GB" : "id-ID",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );
}

export function DayDetail({
  date,
  birthDate,
}: {
  date: string;
  birthDate: string | null;
}) {
  const t = useT();
  const { lang } = useLang();
  const hari = getWarigaDay(date, birthDate);
  const weton = getWeton(hari.saptaWara, hari.pancaWara);
  const kategori = hari.kategori?.name ?? null;
  const panduan = kategori ? getPanduan(lang, kategori) : null;

  return (
    <div className="space-y-5">
      <Card elevation={3}>
        <CardHeader>
          <p className="text-sm text-ink-faint">{formatTanggal(date, lang)}</p>
          {kategori ? (
            <div className="mt-2 flex items-center gap-3">
              <span aria-hidden className={cn("h-8 w-8 rounded-pill hb-raise-1", TONE[kategori])} />
              <div>
                <CardTitle>{t(`day.${KEY[kategori]}`)}</CardTitle>
                <p className="text-sm text-ink-soft">{t(`day.${KEY[kategori]}.tagline`)}</p>
              </div>
            </div>
          ) : (
            <CardTitle className="mt-2">{hari.saptaWara} {hari.pancaWara}</CardTitle>
          )}
        </CardHeader>

        <CardBody className="space-y-4">
          {kategori && (
            <p className="text-[15px] leading-relaxed text-ink-soft">
              {t(`day.${KEY[kategori]}.desc`)}
            </p>
          )}

          {(hari.hariRayaHindu || hari.hariLibur) && (
            <div className="flex flex-wrap gap-2">
              {hari.hariLibur && (
                <span className="rounded-pill bg-error/20 px-3 py-1 text-xs font-medium text-ink">
                  {hari.hariLibur}
                </span>
              )}
              {hari.hariRayaHindu?.map((r) => (
                <span
                  key={r}
                  className="rounded-pill bg-accent-wash px-3 py-1 text-xs font-medium text-accent-ink hb-raise-1"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {panduan && (
        <Card>
          <CardHeader>
            <CardTitle>{t("assist.title")}</CardTitle>
          </CardHeader>
          <CardBody className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">
                {t("assist.supported")}
              </p>
              <ul className="space-y-1.5">
                {panduan.supported.map((s) => (
                  <li key={s} className="flex gap-2.5 text-sm text-ink-soft">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-guru" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">
                {t("assist.postpone")}
              </p>
              <ul className="space-y-1.5">
                {panduan.postpone.map((s) => (
                  <li key={s} className="flex gap-2.5 text-sm text-ink-soft">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pati" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-md bg-surface-sunk px-5 py-4 hb-sink">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">
                {t("assist.affirmation")}
              </p>
              <p className="font-heading text-[15px] italic leading-relaxed text-ink">
                {panduan.affirmation}
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {weton && (
        <Card>
          <CardHeader>
            <CardTitle>{weton.energi}</CardTitle>
            <p className="mt-0.5 text-sm text-ink-soft">{weton.tema}</p>
          </CardHeader>
          <CardBody>
            <p className="text-sm italic leading-relaxed text-ink-soft">{weton.afirmasi}</p>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("detail.section")}</CardTitle>
        </CardHeader>
        <CardBody>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3.5 text-sm sm:grid-cols-3">
            {(
              [
                ["Saptawara", hari.saptaWara],
                ["Pancawara", hari.pancaWara],
                ["Triwara", hari.triWara],
                ["Caturwara", hari.caturWara],
                ["Sadwara", hari.sadWara],
                ["Astawara", hari.astaWara],
                ["Sangawara", hari.sangaWara],
                ["Dasawara", hari.dasaWara],
                ["Wuku", hari.wuku],
                ["Lintang", hari.lintang],
                ["Watek", hari.watek],
                ["Sasih", hari.sasih],
                ["Penanggal", hari.lunarDay],
                ["Pratima", hari.pratima],
                ["Urip", String(hari.uripTotal)],
              ] as const
            ).map(([k, v]) => (
              <div key={k}>
                <dt className="text-ink-faint">{k}</dt>
                <dd className="font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>
    </div>
  );
}
