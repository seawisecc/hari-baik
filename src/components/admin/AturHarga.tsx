"use client";

import { Check, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/content/LangProvider";
import { useAuth } from "@/lib/firebase/AuthProvider";
import {
  hemat,
  perTahun,
  rupiah,
  type AddOn,
  type PaketLangganan,
  type PengaturanHarga,
} from "@/lib/harga";

/** Id dibuat dari nama supaya terbaca di data, bukan angka acak. */
function buatId(nama: string, dipakai: string[]): string {
  const dasar =
    nama
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "baru";
  let id = dasar;
  let n = 2;
  while (dipakai.includes(id)) id = `${dasar}-${n++}`;
  return id;
}

export function AturHarga() {
  const t = useT();
  const { user } = useAuth();
  const [data, setData] = useState<PengaturanHarga | null>(null);
  const [pesan, setPesan] = useState<{ nada: "success" | "error"; teks: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let batal = false;
    void (async () => {
      const res = await fetch("/api/admin/harga");
      const d = (await res.json()) as PengaturanHarga;
      if (!batal) setData(d);
    })();
    return () => {
      batal = true;
    };
  }, []);

  if (!data) {
    return <p className="py-8 text-center text-sm text-ink-faint">{t("common.loading")}</p>;
  }

  const ubahPaket = (i: number, patch: Partial<PaketLangganan>) =>
    setData({
      ...data,
      paket: data.paket.map((p, j) => (j === i ? { ...p, ...patch } : p)),
    });

  const ubahAddOn = (i: number, patch: Partial<AddOn>) =>
    setData({
      ...data,
      addOn: data.addOn.map((a, j) => (j === i ? { ...a, ...patch } : a)),
    });

  // Hanya satu paket boleh populer; menandai yang baru melepas yang lama.
  const tandaiPopuler = (i: number) =>
    setData({
      ...data,
      paket: data.paket.map((p, j) => ({ ...p, populer: j === i && !p.populer })),
    });

  const simpan = async () => {
    if (!user) return;
    setBusy(true);
    setPesan(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/harga", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paket: data.paket, addOn: data.addOn }),
      });
      const hasil = await res.json();
      if (!res.ok) throw new Error(hasil.error ?? t("admin.actionFailed"));
      setData(hasil);
      setPesan({ nada: "success", teks: t("price.saved") });
    } catch (err) {
      setPesan({
        nada: "error",
        teks: err instanceof Error ? err.message : t("admin.actionFailed"),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {pesan && <Alert tone={pesan.nada}>{pesan.teks}</Alert>}

      <Card elevation={2}>
        <CardHeader>
          <CardTitle>{t("price.packages")}</CardTitle>
          <p className="mt-1 text-sm text-ink-soft">{t("price.packagesHint")}</p>
        </CardHeader>
        <CardBody className="space-y-4">
          {data.paket.map((p, i) => (
            <div
              key={p.id}
              className={cn(
                "rounded-md px-5 py-5",
                p.aktif ? "bg-surface-sunk hb-sink" : "bg-surface-sunk/40 opacity-70",
              )}
            >
              <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Kolom label={t("price.nameId")}>
                    <Input
                      value={p.nama.id}
                      onChange={(e) =>
                        ubahPaket(i, { nama: { ...p.nama, id: e.target.value } })
                      }
                      className="h-10 text-sm"
                    />
                  </Kolom>
                  <Kolom label={t("price.nameEn")}>
                    <Input
                      value={p.nama.en}
                      onChange={(e) =>
                        ubahPaket(i, { nama: { ...p.nama, en: e.target.value } })
                      }
                      className="h-10 text-sm"
                    />
                  </Kolom>
                  <Kolom label={t("price.years")}>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={p.tahun}
                      onChange={(e) => ubahPaket(i, { tahun: Number(e.target.value) })}
                      className="h-10 text-sm"
                    />
                  </Kolom>
                  <Kolom label={t("price.price")}>
                    <Input
                      type="number"
                      min={0}
                      step={5000}
                      value={p.harga}
                      onChange={(e) => ubahPaket(i, { harga: Number(e.target.value) })}
                      className="h-10 text-sm"
                    />
                  </Kolom>
                </div>

                <div className="flex flex-col justify-center gap-1 text-sm sm:min-w-36">
                  <p className="font-heading text-lg font-semibold text-ink">
                    {rupiah(p.harga)}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {rupiah(perTahun(p))} {t("price.perYear")}
                  </p>
                  {hemat(p, data.paket) > 0 && (
                    <p className="text-xs font-medium text-guru-teks">
                      {t("price.saveShort", { n: hemat(p, data.paket) })}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:justify-center">
                  <Saklar
                    aktif={p.aktif}
                    label={t("price.active")}
                    onClick={() => ubahPaket(i, { aktif: !p.aktif })}
                  />
                  <Saklar
                    aktif={p.populer}
                    label={t("price.popular")}
                    onClick={() => tandaiPopuler(i)}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card elevation={2}>
        <CardHeader>
          <CardTitle>{t("price.addons")}</CardTitle>
          <p className="mt-1 text-sm text-ink-soft">{t("price.addonsHint")}</p>
        </CardHeader>
        <CardBody className="space-y-4">
          {data.addOn.map((a, i) => (
            <div
              key={a.id}
              className={cn(
                "space-y-3 rounded-md px-5 py-5",
                a.aktif ? "bg-surface-sunk hb-sink" : "bg-surface-sunk/40 opacity-70",
              )}
            >
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <Kolom label={t("price.nameId")}>
                  <Input
                    value={a.nama.id}
                    onChange={(e) => ubahAddOn(i, { nama: { ...a.nama, id: e.target.value } })}
                    className="h-10 text-sm"
                  />
                </Kolom>
                <Kolom label={t("price.nameEn")}>
                  <Input
                    value={a.nama.en}
                    onChange={(e) => ubahAddOn(i, { nama: { ...a.nama, en: e.target.value } })}
                    className="h-10 text-sm"
                  />
                </Kolom>
                <Kolom label={t("price.price")}>
                  <Input
                    type="number"
                    min={0}
                    step={5000}
                    value={a.harga}
                    onChange={(e) => ubahAddOn(i, { harga: Number(e.target.value) })}
                    className="h-10 w-32 text-sm"
                  />
                </Kolom>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Kolom label={t("price.descId")}>
                  <textarea
                    value={a.deskripsi.id}
                    onChange={(e) =>
                      ubahAddOn(i, { deskripsi: { ...a.deskripsi, id: e.target.value } })
                    }
                    rows={2}
                    className="w-full rounded-md bg-surface px-4 py-2.5 text-sm text-ink hb-sink-sm focus:hb-ring"
                  />
                </Kolom>
                <Kolom label={t("price.descEn")}>
                  <textarea
                    value={a.deskripsi.en}
                    onChange={(e) =>
                      ubahAddOn(i, { deskripsi: { ...a.deskripsi, en: e.target.value } })
                    }
                    rows={2}
                    className="w-full rounded-md bg-surface px-4 py-2.5 text-sm text-ink hb-sink-sm focus:hb-ring"
                  />
                </Kolom>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Saklar
                  aktif={a.aktif}
                  label={t("price.active")}
                  onClick={() => ubahAddOn(i, { aktif: !a.aktif })}
                />
                <Saklar
                  aktif={a.sekali}
                  label={t("price.oneTime")}
                  onClick={() => ubahAddOn(i, { sekali: !a.sekali })}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto text-error"
                  onClick={() =>
                    setData({ ...data, addOn: data.addOn.filter((_, j) => j !== i) })
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  {t("price.remove")}
                </Button>
              </div>
            </div>
          ))}

          <Button
            variant="surface"
            onClick={() =>
              setData({
                ...data,
                addOn: [
                  ...data.addOn,
                  {
                    id: buatId(
                      "add on baru",
                      data.addOn.map((a) => a.id),
                    ),
                    harga: 50_000,
                    nama: { id: "Add-on baru", en: "New add-on" },
                    deskripsi: { id: "Keterangan singkat.", en: "Short description." },
                    sekali: false,
                    aktif: false,
                  },
                ],
              })
            }
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t("price.addAddon")}
          </Button>
        </CardBody>
      </Card>

      <div className="flex flex-wrap items-center gap-4">
        <Button size="lg" disabled={busy} onClick={simpan}>
          <Check className="h-4 w-4" aria-hidden />
          {busy ? t("common.saving") : t("price.save")}
        </Button>
        {data.diperbaruiPada && (
          <p className="text-xs text-ink-faint">
            {t("price.lastChanged")} {new Date(data.diperbaruiPada).toLocaleString("id-ID")}
            {data.diperbaruiOleh ? ` · ${data.diperbaruiOleh}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}

function Kolom({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  );
}

function Saklar({
  aktif,
  label,
  onClick,
}: {
  aktif: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={aktif}
      onClick={onClick}
      className={cn(
        "rounded-pill px-3 py-1.5 text-xs font-medium transition-[box-shadow,background-color] duration-150",
        aktif ? "bg-accent text-accent-ink hb-raise-1" : "bg-surface text-ink-faint hb-raise-1",
      )}
    >
      {label}
    </button>
  );
}
