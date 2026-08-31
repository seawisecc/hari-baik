import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { catatJejak } from "@/lib/audit";
import { adminDb } from "@/lib/firebase/admin";
import { AdminError, handleAdminError, requireAdmin } from "@/lib/firebase/requireAdmin";
import { DOKUMEN_HARGA as DOKUMEN, bacaHarga } from "@/lib/harga-server";
import type { AddOn, PaketLangganan } from "@/lib/harga";

/** Halaman yang menampilkan harga hasil render server dan harus ikut segar. */
const HALAMAN_BERHARGA = ["/", "/expired"];

/** Rupiah penuh. Batas atas mencegah salah ketik nol jadi harga miliaran. */
const HARGA_MAKS = 100_000_000;
const TAHUN_MAKS = 10;

function ref() {
  return adminDb().collection(DOKUMEN[0]).doc(DOKUMEN[1]);
}

function wajibTeks(nilai: unknown, nama: string): string {
  if (typeof nilai !== "string" || nilai.trim().length === 0) {
    throw new AdminError(400, `${nama} tidak boleh kosong.`);
  }
  return nilai.trim();
}

function wajibHarga(nilai: unknown, nama: string): number {
  const n = Number(nilai);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > HARGA_MAKS) {
    throw new AdminError(400, `${nama} harus bilangan bulat 0 sampai ${HARGA_MAKS}.`);
  }
  return n;
}

/**
 * Bersihkan masukan dari klien.
 *
 * Bentuknya dibangun ulang dari nol, bukan disalin apa adanya, supaya field
 * asing tidak ikut tersimpan dan tipe tiap nilai dipastikan di sini.
 */
function bersihkanPaket(masuk: unknown): PaketLangganan[] {
  if (!Array.isArray(masuk)) throw new AdminError(400, "paket harus berupa daftar.");
  if (masuk.length === 0) throw new AdminError(400, "Minimal satu paket harus ada.");

  const hasil = masuk.map((p: Record<string, unknown>) => {
    const tahun = Number(p.tahun);
    if (!Number.isInteger(tahun) || tahun < 1 || tahun > TAHUN_MAKS) {
      throw new AdminError(400, `Lama paket harus 1 sampai ${TAHUN_MAKS} tahun.`);
    }
    return {
      id: wajibTeks(p.id, "id paket"),
      tahun,
      harga: wajibHarga(p.harga, "Harga paket"),
      nama: {
        id: wajibTeks((p.nama as Record<string, unknown>)?.id, "Nama paket (ID)"),
        en: wajibTeks((p.nama as Record<string, unknown>)?.en, "Nama paket (EN)"),
      },
      populer: Boolean(p.populer),
      aktif: Boolean(p.aktif),
    } satisfies PaketLangganan;
  });

  const ganda = hasil.length !== new Set(hasil.map((p) => p.id)).size;
  if (ganda) throw new AdminError(400, "Ada id paket yang sama.");
  if (!hasil.some((p) => p.aktif)) {
    throw new AdminError(400, "Minimal satu paket harus aktif.");
  }
  if (hasil.filter((p) => p.populer && p.aktif).length > 1) {
    throw new AdminError(400, "Hanya satu paket yang boleh ditandai populer.");
  }
  return hasil;
}

function bersihkanAddOn(masuk: unknown): AddOn[] {
  if (!Array.isArray(masuk)) throw new AdminError(400, "addOn harus berupa daftar.");

  const hasil = masuk.map((a: Record<string, unknown>) => ({
    id: wajibTeks(a.id, "id add-on"),
    harga: wajibHarga(a.harga, "Harga add-on"),
    nama: {
      id: wajibTeks((a.nama as Record<string, unknown>)?.id, "Nama add-on (ID)"),
      en: wajibTeks((a.nama as Record<string, unknown>)?.en, "Nama add-on (EN)"),
    },
    deskripsi: {
      id: wajibTeks((a.deskripsi as Record<string, unknown>)?.id, "Deskripsi add-on (ID)"),
      en: wajibTeks((a.deskripsi as Record<string, unknown>)?.en, "Deskripsi add-on (EN)"),
    },
    sekali: Boolean(a.sekali),
    aktif: Boolean(a.aktif),
  })) satisfies AddOn[];

  if (hasil.length !== new Set(hasil.map((a) => a.id)).size) {
    throw new AdminError(400, "Ada id add-on yang sama.");
  }
  return hasil;
}

/** Baca pengaturan harga. Terbuka untuk siapa pun: ini daftar harga publik. */
export async function GET() {
  try {
    return Response.json(await bacaHarga());
  } catch (err) {
    return handleAdminError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const body = (await req.json()) as {
      paket?: unknown;
      addOn?: unknown;
      transferManual?: unknown;
    };

    const data = {
      paket: bersihkanPaket(body.paket),
      addOn: bersihkanAddOn(body.addOn),
      // Boolean() atas nilai yang hilang menghasilkan false, dan itu arah
      // salah yang berbahaya: satu permintaan lama yang belum membawa field
      // ini akan diam-diam mematikan transfer manual, lalu halaman langganan
      // kehilangan satu jalur tanpa ada yang menyentuh saklarnya. Yang tidak
      // disebutkan berarti tidak diubah, jadi bawaannya true.
      transferManual: body.transferManual === undefined ? true : Boolean(body.transferManual),
      diperbaruiPada: new Date().toISOString(),
      diperbaruiOleh: admin.email ?? admin.uid,
    };

    await ref().set(data);

    // Halaman harga dirender di server dan disimpan sebagai statis. Tanpa ini
    // pengguna masih melihat harga lama sampai masa kedaluwarsanya lewat.
    for (const jalur of HALAMAN_BERHARGA) revalidatePath(jalur);

    await catatJejak(
      {
        aksi: "harga",
        aktor: admin.email ?? admin.uid,
        aktorUid: admin.uid,
        sasaran: null,
        ringkasan: `Daftar harga disimpan: ${data.paket.length} paket, ${data.addOn.length} add-on, transfer manual ${data.transferManual ? "hidup" : "mati"}.`,
        detail: {
          paket: data.paket.map((p) => ({ id: p.id, harga: p.harga, aktif: p.aktif })),
          addOn: data.addOn.map((a) => ({ id: a.id, harga: a.harga, aktif: a.aktif })),
          transferManual: data.transferManual,
        },
      },
      req,
    );

    return Response.json({ ok: true, ...data });
  } catch (err) {
    return handleAdminError(err);
  }
}
