"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { uripPetemon } from "@/lib/content/petemon";
import { getDb } from "@/lib/firebase/client";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { trialEnd } from "@/lib/subscription";
import {
  getSadwara,
  pancawaraName,
  saptawaraName,
  toDateString,
  uripHari,
  wukuName,
} from "@/lib/wariga";

export default function OnboardingPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const today = toDateString(new Date());

  const [nama, setNama] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <main className="px-6 py-16 text-ink-faint">Memuat…</main>;

  if (!user) {
    return (
      <main className="mx-auto max-w-md px-6 py-20">
        <Card>
          <CardBody className="pt-6">
            <p className="text-[15px] text-ink-soft">Kamu belum masuk.</p>
            <Button className="mt-4" block onClick={() => router.push("/login")}>
              Ke halaman masuk
            </Button>
          </CardBody>
        </Card>
      </main>
    );
  }

  if (profile?.onboardingComplete) {
    router.replace("/hari-ini");
    return null;
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <p className="font-heading text-2xl font-bold italic text-ink">Hari Baik</p>
        <ThemeToggle />
      </div>

      <Card elevation={3}>
        <CardHeader>
          <CardTitle>Lengkapi profil</CardTitle>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
            Kalender siklusmu dihitung dari tanggal lahir, jadi pastikan benar: setelah ini
            hanya admin yang bisa mengubahnya.
          </p>
        </CardHeader>

        <CardBody>
          <form
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setBusy(true);
              try {
                const petemon = uripPetemon(tanggalLahir);
                await updateDoc(doc(getDb(), "users", user.uid), {
                  nama: nama.trim(),
                  tanggalLahir,
                  phoneNumber: phone.trim() || null,
                  onboardingComplete: true,
                  trialEndsAt: trialEnd(),
                  saptaWaraLahir: saptawaraName(tanggalLahir),
                  pancaWaraLahir: pancawaraName(tanggalLahir),
                  sadWaraLahir: getSadwara(tanggalLahir),
                  wukuLahir: wukuName(tanggalLahir),
                  uripLahir: uripHari(tanggalLahir),
                  uripPetemonLahir: petemon.totalUrip,
                });
                router.push("/hari-ini");
              } catch {
                setError("Gagal menyimpan. Periksa koneksi lalu coba lagi.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {error && <Alert tone="error">{error}</Alert>}

            <div className="space-y-2">
              <Label htmlFor="nama">Nama lengkap</Label>
              <Input
                id="nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lahir">Tanggal lahir Masehi</Label>
              <Input
                id="lahir"
                type="date"
                max={today}
                value={tanggalLahir}
                onChange={(e) => setTanggalLahir(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Nomor WhatsApp <span className="font-normal text-ink-faint">(opsional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                placeholder="08123456789"
                value={phone}
                onChange={(e) => {
                  const bersih = e.target.value.replace(/[^0-9+]/g, "");
                  if (bersih.length <= 15) setPhone(bersih);
                }}
              />
              <p className="text-xs text-ink-faint">
                Memudahkan admin menghubungimu soal langganan.
              </p>
            </div>

            {tanggalLahir && (
              <div className="rounded-md bg-surface-sunk px-5 py-4 hb-sink">
                <p className="text-xs text-ink-faint">Hari lahirmu</p>
                <p className="mt-0.5 font-heading text-lg font-semibold text-ink">
                  {saptawaraName(tanggalLahir)} {pancawaraName(tanggalLahir)}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Wuku {wukuName(tanggalLahir)} · Urip {uripHari(tanggalLahir)}
                </p>
              </div>
            )}

            <Button type="submit" block disabled={busy || !nama.trim() || !tanggalLahir}>
              {busy ? "Menyimpan…" : "Mulai perjalanan"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </main>
  );
}
