"use client";

import { Printer } from "lucide-react";
import { Memuat } from "@/components/ProGate";
import { ButuhTanggalLahir } from "@/components/ProGate";
import { PageContainer } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { PageHeader } from "@/components/ui/PageHeader";
import { useLang, useT } from "@/lib/content/LangProvider";
import { getPancasuda, getPangarasan } from "@/lib/content/kepribadian";
import { hitungMaknaNama, UNSUR_INTERP } from "@/lib/content/nama";
import { hitungUsia, periodeSaatIni, petaPerjalananHidup } from "@/lib/content/nasib";
import { getWeton } from "@/lib/content/weton";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { cn } from "@/lib/cn";
import { KATEGORI_TEKS } from "@/lib/kategori";
import { tanggalMedium } from "@/lib/tanggal";
import { useUserData } from "@/lib/useUserData";
import { getKategoriHari, getWarigaDay, toDateString, uripHari } from "@/lib/wariga";

/**
 * Laporan lengkap, dicetak lewat jendela cetak peramban.
 *
 * Sengaja tidak memakai pustaka pembuat PDF. Peramban sudah bisa menyimpan
 * halaman sebagai PDF, hasilnya bisa dipilih teksnya dan bisa dicari, dan
 * pustaka semacam itu akan menambah ratusan kilobyte ke bundel untuk sesuatu
 * yang dipakai sesekali. Yang perlu dikerjakan hanya gaya cetaknya.
 */
export default function LaporanPage() {
  const t = useT();
  const { lang } = useLang();
  const { profile } = useAuth();
  const { birthDate, loading } = useUserData();

  if (loading) return <Memuat />;
  if (!birthDate) return <ButuhTanggalLahir title={t("laporan.title")} />;

  const hariIni = toDateString(new Date());
  const w = getWarigaDay(birthDate, birthDate);
  const weton = getWeton(w.saptaWara, w.pancaWara);
  const urip = uripHari(birthDate);
  const usia = hitungUsia(birthDate);
  const peta = petaPerjalananHidup(urip);
  const sekarang = periodeSaatIni(peta, usia);
  const kategoriHariIni = getKategoriHari(birthDate, hariIni).name;
  const nama = profile?.nama?.trim() ?? "";
  const makna = nama ? hitungMaknaNama(nama) : null;
  const pangarasan = weton ? getPangarasan(weton.pangarasan) : null;
  const pancasuda = weton ? getPancasuda(weton.pancasuda) : null;

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Kontrol tidak ikut tercetak. */}
        <div className="cetak-sembunyi space-y-6">
          <PageHeader title={t("laporan.title")} subtitle={t("laporan.subtitle")} />
          <Card elevation={2}>
            <CardBody className="flex flex-wrap items-center gap-4 pt-6">
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-relaxed text-ink-soft">
                  {t("laporan.printHint")}
                </p>
              </div>
              <Button onClick={() => window.print()} className="shrink-0">
                <Printer className="h-4 w-4" aria-hidden />
                {t("laporan.print")}
              </Button>
            </CardBody>
          </Card>
        </div>

        <article className="cetak-lembar space-y-7 rounded-lg bg-surface p-8 hb-raise-1">
          <header className="flex items-start justify-between gap-4 border-b border-border-soft pb-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                {t("laporan.for")}
              </p>
              <p className="break-words font-heading text-2xl font-bold text-ink">
                {nama || profile?.email || "-"}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {tanggalMedium(birthDate, lang)} · {w.saptaWara} {w.pancaWara}
              </p>
            </div>
            <Logo size={44} className="shrink-0" />
          </header>

          <Bagian judul={t("laporan.sec.identitas")}>
            <Rincian
              baris={[
                [t("keluarga.weton"), `${w.saptaWara} ${w.pancaWara}`],
                ["Wuku", w.wuku],
                ["Urip", String(urip)],
                ["Wewaran", `${w.triWara} · ${w.caturWara} · ${w.sadWara}`],
                ["Astawara · Sangawara", `${w.astaWara} · ${w.sangaWara}`],
                ["Dasawara", w.dasaWara],
                ["Lintang", w.lintang],
                ["Watek", w.watek],
                ["Sasih", w.sasih],
                [t("laporan.age"), `${usia} ${t("laporan.ageUnit")}`],
              ]}
            />
          </Bagian>

          <Bagian judul={t("laporan.sec.hariIni")}>
            <p className="text-[15px] leading-relaxed text-ink-soft">
              {tanggalMedium(hariIni, lang)}:{" "}
              <strong className={cn("font-semibold", KATEGORI_TEKS[kategoriHariIni])}>
                {t(`day.${kategoriHariIni.toLowerCase()}`)}
              </strong>
              . {t(`day.${kategoriHariIni.toLowerCase()}.desc`)}
            </p>
          </Bagian>

          {weton && (
            <Bagian judul={t("laporan.sec.watak")}>
              <p className="text-[15px] leading-relaxed text-ink-soft">{weton.energi}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{weton.tema}</p>
              {pangarasan && (
                <Blok judul={`Pangarasan · ${pangarasan.nama}`}>
                  <p>{pangarasan.kepribadian}</p>
                  <Daftar judul={t("traits.strengths")} isi={pangarasan.kekuatan} />
                  <Daftar judul={t("traits.challenges")} isi={pangarasan.tantangan} />
                  <p className="mt-2 italic">{pangarasan.saran}</p>
                </Blok>
              )}
              {pancasuda && (
                <Blok judul={`Pancasuda · ${pancasuda.nama}`}>
                  <p>{pancasuda.kepribadian}</p>
                  <p className="mt-2 italic">{pancasuda.saran}</p>
                </Blok>
              )}
            </Bagian>
          )}

          <Bagian judul={t("laporan.sec.perjalanan")}>
            <ul className="space-y-2.5">
              {peta.map((p, i) => {
                return (
                  <li
                    key={`${p.ageMin}-${p.ageMax}`}
                    className={cn(
                      "rounded-md px-4 py-3",
                      i === sekarang ? "bg-surface-sunk" : "",
                    )}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-ink">
                        {t("laporan.period", { a: p.ageMin, b: p.ageMax })}
                        {i === sekarang && (
                          <span className="ml-2 text-[11px] font-semibold uppercase tracking-wide text-accent-deep">
                            {t("laporan.current")}
                          </span>
                        )}
                      </span>
                      <span className="text-sm font-semibold text-ink">{p.label ?? "-"}</span>
                    </div>
                    {(p.rejeki || p.saran) && (
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                        {[p.rejeki, p.saran].filter(Boolean).join(" ")}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </Bagian>

          <Bagian judul={t("laporan.sec.nama")}>
            {makna ? (
              <>
                <p className="text-[15px] leading-relaxed text-ink-soft">
                  <strong className="text-ink">{makna.unsur}</strong>.{" "}
                  {UNSUR_INTERP[makna.unsur]}
                </p>
                <p className="mt-2 text-[13px] text-ink-faint">
                  {makna.rincian.map((r) => `${r.aksara} (${r.value})`).join(" · ")} ={" "}
                  {makna.total}
                </p>
              </>
            ) : (
              <p className="text-[15px] text-ink-soft">{t("laporan.noName")}</p>
            )}
          </Bagian>

          <footer className="border-t border-border-soft pt-4 text-[11px] leading-relaxed text-ink-faint">
            {t("laporan.generated", { tanggal: tanggalMedium(hariIni, lang) })}.{" "}
            {t("laporan.footer")}
          </footer>
        </article>
      </div>
    </PageContainer>
  );
}

function Bagian({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <section className="cetak-utuh">
      <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
        {judul}
      </h2>
      {children}
    </section>
  );
}

function Blok({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <div className="mt-3.5 rounded-md bg-surface-sunk px-4 py-3.5 text-[14px] leading-relaxed text-ink-soft">
      <p className="mb-1.5 font-semibold text-ink">{judul}</p>
      {children}
    </div>
  );
}

function Daftar({ judul, isi }: { judul: string; isi: string[] }) {
  if (!isi.length) return null;
  return (
    <p className="mt-2">
      <span className="font-medium text-ink">{judul}: </span>
      {isi.join(", ")}
    </p>
  );
}

function Rincian({ baris }: { baris: [string, string][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
      {baris.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3 border-b border-border-soft pb-1.5">
          <dt className="text-[13px] text-ink-faint">{k}</dt>
          <dd className="text-[13px] font-medium text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
