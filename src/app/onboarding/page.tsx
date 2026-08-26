"use client";

import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Wordmark } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Bidang } from "@/app/(auth)/AuthShell";
import { uripPetemon } from "@/lib/content/petemon";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { getDb } from "@/lib/firebase/client";
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

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center text-sm text-ink-faint">
        Memuat…
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <Card>
          <CardBody className="pt-6">
            <p className="text-[15px] text-ink-soft">Kamu belum masuk.</p>
            <Button className="mt-5" block onClick={() => router.push("/login")}>
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

  const siap = nama.trim().length > 0 && tanggalLahir.length > 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-14">
      <div className="mb-9 flex items-center justify-between gap-4">
        <Wordmark size={28} textClassName="text-2xl" />
        <ThemeToggle />
      </div>

      <Card elevation={3}>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Satu langkah lagi</CardTitle>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Kalender siklusmu dihitung dari tanggal lahir, jadi pastikan benar.
          </p>
        </CardHeader>

        <CardBody className="pb-7">
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

            <Bidang label={<Label htmlFor="nama">Nama lengkap</Label>}>
              <Input
                id="nama"
                autoComplete="name"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />
            </Bidang>

            <Bidang label={<Label htmlFor="lahir">Tanggal lahir Masehi</Label>}>
              <Input
                id="lahir"
                type="date"
                max={today}
                value={tanggalLahir}
                onChange={(e) => setTanggalLahir(e.target.value)}
                required
              />
            </Bidang>

            {/* Pratinjau langsung: kalau wetonnya terasa asing, kemungkinan
                tanggalnya salah ketik, dan itu ketahuan sebelum disimpan. */}
            {tanggalLahir && (
              <div className="rounded-md bg-surface-sunk px-5 py-4 hb-sink">
                <p className="text-[11px] uppercase tracking-wide text-ink-faint">
                  Hari lahirmu
                </p>
                <p className="mt-1 font-heading text-xl font-semibold text-ink">
                  {saptawaraName(tanggalLahir)} {pancawaraName(tanggalLahir)}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Wuku {wukuName(tanggalLahir)} · Urip {uripHari(tanggalLahir)}
                </p>
              </div>
            )}

            <Bidang
              label={
                <Label htmlFor="phone">
                  Nomor WhatsApp <span className="font-normal text-ink-faint">(opsional)</span>
                </Label>
              }
              hint="Memudahkan admin menghubungimu soal langganan."
            >
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="08123456789"
                value={phone}
                onChange={(e) => {
                  const bersih = e.target.value.replace(/[^0-9+]/g, "");
                  if (bersih.length <= 15) setPhone(bersih);
                }}
              />
            </Bidang>

            <Button type="submit" block size="lg" disabled={busy || !siap}>
              {busy ? "Menyimpan…" : "Mulai perjalanan"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </main>
  );
}
