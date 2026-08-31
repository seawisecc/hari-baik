"use client";

import { Trash2, TriangleAlert } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { alasanTolak, emailCocok } from "@/lib/admin-hapus";
import { useT } from "@/lib/content/LangProvider";
import type { PenggunaAdmin } from "@/types";

/**
 * Zona berbahaya: penghapusan akun.
 *
 * Aturan boleh atau tidaknya tidak ditulis ulang di sini, melainkan diambil
 * dari alasanTolak(), fungsi yang sama persis yang dipakai server untuk
 * menolak. Tombol yang menyala di layar lalu ditolak API adalah cara paling
 * cepat membuat admin berhenti percaya pada layarnya sendiri.
 *
 * Konfirmasinya mengetik email, bukan menekan "ya". Daftar pengguna adalah
 * baris-baris yang mirip satu sama lain, dan tombol hapus di baris yang salah
 * tidak terasa berbeda dari tombol hapus di baris yang benar.
 *
 * Yang diterima PenggunaAdmin, bukan UserProfile: alasanTolak() membaca
 * `emailTerverifikasi`, dan field itu tidak ada di UserProfile. Dengan tipe
 * yang terlalu sempit, TypeScript membacanya undefined lalu menyimpulkan
 * penjaga trial masih berlaku, sementara server memakai nilai yang sebenarnya
 * dan membolehkan. Layar dan server jadi berbeda pendapat, persis hal yang
 * paling ingin dihindari fungsi bersama ini.
 */
/*
 * Id kolom isian datang dari useId(), bukan ditulis sendiri.
 *
 * UserTable merender DUA pohon sekaligus: kartu ponsel dan tabel layar lebar.
 * Yang menyembunyikan salah satunya cuma CSS, jadi keduanya tetap ada di DOM,
 * dan panel kelola yang sedang terbuka muncul dua kali. Id yang ditulis
 * sendiri jadi kembar, dan label mana pun yang ditekan akan menunjuk elemen
 * PERTAMA yang ber-id itu, yaitu milik kartu ponsel yang display-nya none.
 * Elemen ber-display none tidak bisa menerima fokus, jadi di layar lebar
 * menekan labelnya tidak memfokuskan apa pun dan yang diketik tidak masuk ke
 * mana-mana. Terukur di peramban pada lebar 1680: fokus mendarat di BODY.
 *
 * useId() memberi id yang berbeda untuk tiap instance, jadi kedua salinan
 * punya id sendiri dan labelnya masing-masing menunjuk ke tetangganya.
 */
export function HapusPengguna({
  u,
  busy,
  onHapus,
}: {
  u: PenggunaAdmin;
  busy: boolean;
  onHapus: (email: string) => void;
}) {
  const t = useT();
  const idEmail = useId();
  const [buka, setBuka] = useState(false);
  const [ketik, setKetik] = useState("");

  const tolak = alasanTolak(u);

  // Ditulis sebagai tiga panggilan dengan kunci harfiah, bukan satu kunci yang
  // dirangkai dari `tolak`. Pemeriksa kamus di content.test.ts hanya mengenali
  // kunci yang tertulis apa adanya di dalam tanda kutip, jadi kunci yang
  // dirangkai lolos dari pemeriksaan dan baru ketahuan hilang ketika muncul
  // di layar sebagai nama kuncinya sendiri.
  const pesanTolak = () => {
    if (tolak === "admin") return t("admin.delete.no.admin");
    if (tolak === "menunggu") return t("admin.delete.no.menunggu");
    return t("admin.delete.no.aktif");
  };

  return (
    <div className="space-y-3 rounded-md border border-error/35 bg-error/8 px-5 py-5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
        <TriangleAlert className="h-3.5 w-3.5" aria-hidden />
        {t("admin.danger")}
      </p>

      {tolak ? (
        // Alasannya disebutkan, bukan tombolnya disembunyikan diam-diam.
        // Kalau tombolnya hilang tanpa keterangan, yang dicari admin
        // berikutnya adalah bug, bukan sebabnya.
        <p className="text-xs text-ink-soft">{pesanTolak()}</p>
      ) : !buka ? (
        <>
          <p className="text-xs text-ink-soft">{t("admin.delete.hint")}</p>
          <Button size="sm" variant="danger" disabled={busy} onClick={() => setBuka(true)}>
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            {t("admin.delete")}
          </Button>
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-ink-soft">{t("admin.delete.confirm")}</p>

          <div className="space-y-2">
            <Label htmlFor={idEmail} className="text-xs">
              {t("admin.delete.typeEmail", { email: u.email })}
            </Label>
            <Input
              id={idEmail}
              type="email"
              autoComplete="off"
              spellCheck={false}
              value={ketik}
              onChange={(e) => setKetik(e.target.value)}
              className="h-10 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="danger"
              disabled={busy || !emailCocok(ketik, u.email)}
              onClick={() => onHapus(ketik)}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              {t("admin.delete.confirmBtn")}
            </Button>
            <Button
              size="sm"
              variant="surface"
              disabled={busy}
              onClick={() => {
                setBuka(false);
                setKetik("");
              }}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
