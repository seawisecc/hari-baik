import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { catatJejak } from "@/lib/audit";
import { adminDb } from "@/lib/firebase/admin";
import { AdminError, handleAdminError, requireAdmin } from "@/lib/firebase/requireAdmin";
import { DOKUMEN_HARGA as DOKUMEN, bacaHarga } from "@/lib/harga-server";
import type { AddOn, PaketLangganan } from "@/lib/harga";
import { DISKON_MAKS, type PengaturanPromo } from "@/lib/promo";

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

/**
 * Bersihkan pengaturan promo.
 *
 * Yang bisa diatur di sini cuma saklarnya: jalan atau tidak, sampai kapan, dan
 * berapa persen. Bonus add-on tiap paket tidak ikut, dan memang tidak boleh:
 * ia ada di `PROMO_BONUS` di kode, karena daftar yang tersimpan di Firestore
 * akan beku pada nilai saat pertama disimpan dan bonus yang ditambahkan
 * belakangan tidak akan pernah muncul. Itu persis kesalahan yang sudah pernah
 * terjadi pada katalog add-on.
 */
function bersihkanPromo(masuk: unknown): PengaturanPromo {
  const m = (masuk ?? {}) as Record<string, unknown>;

  let berakhirPada: string | null = null;
  if (typeof m.berakhirPada === "string" && m.berakhirPada.trim()) {
    const waktu = Date.parse(m.berakhirPada);
    if (!Number.isFinite(waktu)) {
      throw new AdminError(400, "Tanggal berakhir promo tidak bisa dibaca.");
    }
    berakhirPada = new Date(waktu).toISOString();
  }

  // Promo yang dinyalakan tanpa tanggal berakhir ditolak, bukan diterima lalu
  // dimatikan diam-diam. Kalau ditolak di sini, admin tahu apa yang kurang;
  // kalau diterima lalu tidak berlaku, yang terlihat cuma promo yang tidak
  // muncul di halaman tanpa sebab apa pun.
  if (Boolean(m.aktif) && !berakhirPada) {
    throw new AdminError(400, "Promo yang aktif harus punya tanggal berakhir.");
  }

  const masukPaket = Array.isArray(m.paket) ? m.paket : [];
  const paket = masukPaket.map((p: Record<string, unknown>) => {
    const persen = Number(p.diskonPersen);
    if (!Number.isInteger(persen) || persen < 0 || persen > DISKON_MAKS) {
      throw new AdminError(400, `Potongan promo harus 0 sampai ${DISKON_MAKS} persen.`);
    }
    return { paketId: wajibTeks(p.paketId, "id paket promo"), diskonPersen: persen };
  });

  if (paket.length !== new Set(paket.map((p) => p.paketId)).size) {
    throw new AdminError(400, "Ada paket yang disebut dua kali di promo.");
  }

  return { aktif: Boolean(m.aktif), berakhirPada, paket };
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
      promo?: unknown;
    };

    // Dokumen harga disimpan utuh, jadi field yang tidak dikirim akan hilang.
    // Panel harga yang belum tahu soal promo akan menghapusnya setiap kali
    // admin menyimpan harga, dan promo yang sedang berjalan mati di tengah
    // jalan tanpa ada yang menyentuh saklarnya. Yang tidak disebutkan berarti
    // tidak diubah, sama seperti `transferManual` di bawah.
    const promo =
      body.promo === undefined ? (await bacaHarga()).promo : bersihkanPromo(body.promo);

    const data = {
      paket: bersihkanPaket(body.paket),
      addOn: bersihkanAddOn(body.addOn),
      // Boolean() atas nilai yang hilang menghasilkan false, dan itu arah
      // salah yang berbahaya: satu permintaan lama yang belum membawa field
      // ini akan diam-diam mematikan transfer manual, lalu halaman langganan
      // kehilangan satu jalur tanpa ada yang menyentuh saklarnya. Yang tidak
      // disebutkan berarti tidak diubah, jadi bawaannya true.
      transferManual: body.transferManual === undefined ? true : Boolean(body.transferManual),
      promo,
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
        ringkasan: `Daftar harga disimpan: ${data.paket.length} paket, ${data.addOn.length} add-on, transfer manual ${data.transferManual ? "hidup" : "mati"}, promo ${data.promo.aktif ? `hidup sampai ${data.promo.berakhirPada}` : "mati"}.`,
        detail: {
          paket: data.paket.map((p) => ({ id: p.id, harga: p.harga, aktif: p.aktif })),
          addOn: data.addOn.map((a) => ({ id: a.id, harga: a.harga, aktif: a.aktif })),
          transferManual: data.transferManual,
          promo: data.promo,
        },
      },
      req,
    );

    return Response.json({ ok: true, ...data });
  } catch (err) {
    return handleAdminError(err);
  }
}
