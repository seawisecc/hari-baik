"use client";

import { Pencil, Plus, Trash2, UsersRound, X } from "lucide-react";
import { useState } from "react";
import { Memuat } from "@/components/ProGate";
import { PageContainer } from "@/components/shell/AppShell";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";
import { useLang, useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { perbaruiProfil } from "@/lib/firebase/client";
import { KATEGORI_SOLID } from "@/lib/kategori";
import { tanggalMedium } from "@/lib/tanggal";
import { MAKS_KELUARGA, type AnggotaKeluarga } from "@/types";
import { getKategoriHari, getWarigaDay, toDateString } from "@/lib/wariga";

/** Id dari nama dan waktu: cukup stabil untuk daftar sekecil ini. */
const buatId = () => `k${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export default function KeluargaPage() {
  const t = useT();
  const { lang } = useLang();
  const { user, profile, loading } = useAuth();

  const [form, setForm] = useState<AnggotaKeluarga | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  if (loading) return <Memuat />;

  const daftar = profile?.keluarga ?? [];
  const hariIni = toDateString(new Date());
  const penuh = daftar.length >= MAKS_KELUARGA;

  const simpan = async (anggota: AnggotaKeluarga) => {
    if (!user) return;
    const nama = anggota.nama.trim();
    if (!nama) return setGalat(t("keluarga.nameRequired"));
    if (!anggota.tanggalLahir) return setGalat(t("keluarga.birthRequired"));
    if (anggota.tanggalLahir > toDateString(new Date())) {
      return setGalat(t("keluarga.birthFuture"));
    }

    const bersih: AnggotaKeluarga = { ...anggota, nama, hubungan: anggota.hubungan.trim() };
    const ada = daftar.some((a) => a.id === bersih.id);
    const baru = ada
      ? daftar.map((a) => (a.id === bersih.id ? bersih : a))
      : [...daftar, bersih];

    setGalat(null);
    setSibuk(true);
    try {
      await perbaruiProfil(user.uid, { keluarga: baru });
      setForm(null);
    } catch {
      setGalat(t("keluarga.saveFailed"));
    } finally {
      setSibuk(false);
    }
  };

  const hapus = async (anggota: AnggotaKeluarga) => {
    if (!user) return;
    setSibuk(true);
    try {
      await perbaruiProfil(user.uid, { keluarga: daftar.filter((a) => a.id !== anggota.id) });
    } catch {
      setGalat(t("keluarga.saveFailed"));
    } finally {
      setSibuk(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader title={t("keluarga.title")} subtitle={t("keluarga.subtitle")} />

        {galat && <Alert tone="error">{galat}</Alert>}

        {form ? (
          <FormAnggota
            nilai={form}
            sibuk={sibuk}
            onUbah={setForm}
            onSimpan={() => simpan(form)}
            onBatal={() => {
              setForm(null);
              setGalat(null);
            }}
          />
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-faint">
              {t("keluarga.count", { n: daftar.length, maks: MAKS_KELUARGA })}
            </p>
            <Button
              size="sm"
              disabled={penuh}
              onClick={() =>
                setForm({ id: buatId(), nama: "", tanggalLahir: "", hubungan: "" })
              }
            >
              <Plus className="h-4 w-4" aria-hidden />
              {t("keluarga.add")}
            </Button>
          </div>
        )}

        {penuh && !form && (
          <Alert tone="warning">{t("keluarga.full", { n: MAKS_KELUARGA })}</Alert>
        )}

        {daftar.length === 0 && !form ? (
          <Card elevation={1}>
            <CardBody className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-pill bg-surface-sunk hb-sink">
                <UsersRound className="h-5 w-5 text-ink-faint" aria-hidden />
              </span>
              <p className="max-w-sm text-[15px] leading-relaxed text-ink-soft">
                {t("keluarga.empty")}
              </p>
            </CardBody>
          </Card>
        ) : (
          <ul className="space-y-3">
            {daftar.map((a) => (
              <KartuAnggota
                key={a.id}
                anggota={a}
                hariIni={hariIni}
                lang={lang}
                sibuk={sibuk}
                onUbah={() => setForm(a)}
                onHapus={() => hapus(a)}
              />
            ))}
          </ul>
        )}
      </div>
    </PageContainer>
  );
}

function KartuAnggota({
  anggota,
  hariIni,
  lang,
  sibuk,
  onUbah,
  onHapus,
}: {
  anggota: AnggotaKeluarga;
  hariIni: string;
  lang: "id" | "en";
  sibuk: boolean;
  onUbah: () => void;
  onHapus: () => void;
}) {
  const t = useT();
  const [konfirmasi, setKonfirmasi] = useState(false);

  const kategori = getKategoriHari(anggota.tanggalLahir, hariIni).name;
  const w = getWarigaDay(anggota.tanggalLahir, anggota.tanggalLahir);

  return (
    <li>
      <Card elevation={1} className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="min-w-0 flex-1">
            <p className="break-words font-heading text-lg font-semibold text-ink">
              {anggota.nama}
            </p>
            {anggota.hubungan && (
              <p className="break-words text-sm text-ink-soft">{anggota.hubungan}</p>
            )}
            <p className="mt-1 text-xs text-ink-faint">
              {tanggalMedium(anggota.tanggalLahir, lang)} · {t("keluarga.weton")} {w.saptaWara}{" "}
              {w.pancaWara}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wide text-ink-faint">
              {t("keluarga.today")}
            </span>
            <span
              className={cn(
                "rounded-pill px-3.5 py-1.5 text-xs font-semibold",
                KATEGORI_SOLID[kategori],
              )}
            >
              {t(`day.${kategori.toLowerCase()}`)}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-1 border-t border-border-soft pt-3">
          {konfirmasi ? (
            <>
              <span className="mr-auto text-[13px] text-ink-soft">
                {t("keluarga.removeConfirm", { nama: anggota.nama })}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setKonfirmasi(false)}>
                {t("keluarga.cancel")}
              </Button>
              <Button size="sm" disabled={sibuk} onClick={onHapus}>
                {t("keluarga.remove")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onUbah}>
                <Pencil className="h-3.5 w-3.5" aria-hidden />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setKonfirmasi(true)}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </>
          )}
        </div>
      </Card>
    </li>
  );
}

function FormAnggota({
  nilai,
  sibuk,
  onUbah,
  onSimpan,
  onBatal,
}: {
  nilai: AnggotaKeluarga;
  sibuk: boolean;
  onUbah: (a: AnggotaKeluarga) => void;
  onSimpan: () => void;
  onBatal: () => void;
}) {
  const t = useT();
  const hariIni = toDateString(new Date());

  return (
    <Card elevation={2}>
      <CardBody className="pt-6">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSimpan();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="nama">{t("keluarga.name")}</Label>
            <Input
              id="nama"
              value={nilai.nama}
              placeholder={t("keluarga.namePlaceholder")}
              maxLength={40}
              onChange={(e) => onUbah({ ...nilai, nama: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lahir">{t("keluarga.birth")}</Label>
              <Input
                id="lahir"
                type="date"
                max={hariIni}
                value={nilai.tanggalLahir}
                onChange={(e) => onUbah({ ...nilai, tanggalLahir: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hubungan">{t("keluarga.relation")}</Label>
              <Input
                id="hubungan"
                value={nilai.hubungan}
                placeholder={t("keluarga.relationPlaceholder")}
                maxLength={24}
                onChange={(e) => onUbah({ ...nilai, hubungan: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={sibuk} block>
              {sibuk ? t("keluarga.saving") : t("keluarga.save")}
            </Button>
            <Button type="button" variant="surface" onClick={onBatal} className="shrink-0">
              <X className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
