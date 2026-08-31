import type { NextRequest } from "next/server";
import { saringPembayaran, bolehPeriksaUlang } from "@/lib/admin-pembayaran";
import { catatJejak } from "@/lib/audit";
import { adminDb } from "@/lib/firebase/admin";
import { AdminError, handleAdminError, requireAdmin } from "@/lib/firebase/requireAdmin";
import { orderIdValid } from "@/lib/midtrans";
import { ambilStatusTransaksi, konfigurasiMidtrans } from "@/lib/midtrans-server";
import {
  KOLEKSI_PEMBAYARAN,
  PembayaranTidakDitemukan,
  terapkanPembayaran,
} from "@/lib/pembayaran-server";
import type { Pembayaran } from "@/types";

/**
 * Daftar pesanan lewat payment gateway, untuk panel admin.
 *
 * Ada karena satu kalimat yang pasti akan datang: "saya sudah bayar tapi belum
 * aktif". Tanpa layar ini jawabannya cuma bisa dicari di dashboard Midtrans,
 * dan yang ada di sana adalah transaksi, bukan pengguna: tidak ada yang
 * menghubungkan sebuah pembayaran dengan akun yang seharusnya menyala.
 */

const BATAS = 300;

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const status = req.nextUrl.searchParams.get("status") ?? "menunggu";
    const kunci = (req.nextUrl.searchParams.get("q") ?? "").trim();

    let q = adminDb().collection(KOLEKSI_PEMBAYARAN).limit(BATAS);
    if (status !== "all") q = q.where("status", "==", status).limit(BATAS);

    const snap = await q.get();
    const semua = snap.docs.map((d) => d.data() as Pembayaran);

    return Response.json({
      pembayaran: saringPembayaran(semua, kunci),
      // Batas pindai kena: mungkin ada yang cocok tapi tidak sempat dilihat.
      // Disebutkan apa adanya, bukan didiamkan, karena daftar yang diam-diam
      // terpotong terbaca sebagai daftar yang lengkap.
      terpotong: snap.size >= BATAS,
      dipindai: snap.size,
      gatewayAktif: konfigurasiMidtrans() !== null,
    });
  } catch (err) {
    return handleAdminError(err);
  }
}

/**
 * Tanya ulang status sebuah pesanan ke Midtrans, lalu terapkan.
 *
 * Ini tombol untuk keadaan yang sudah pasti terjadi cepat atau lambat:
 * notifikasi tidak sampai (URL-nya belum terdaftar, deploy sedang berganti,
 * jaringan Midtrans tersendat) dan dokumen kita masih berkata menunggu padahal
 * uangnya sudah masuk. Yang menanggung akibatnya pelanggan yang sudah
 * membayar, dan admin butuh cara menyelesaikannya tanpa menyentuh Firestore
 * dengan tangan.
 *
 * Yang diterapkan tetap jawaban Midtrans, bukan kehendak admin. Tidak ada
 * jalan di sini untuk menandai lunas sesuatu yang tidak dibayar: admin yang
 * memang ingin memberi akses gratis memakai pengatur langganan di daftar
 * pengguna, dan itu tercatat atas namanya sendiri, bukan atas nama Midtrans.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const { orderId } = (await req.json()) as { orderId?: string };

    if (!orderId || !orderIdValid(orderId)) {
      throw new AdminError(400, "orderId tidak sah.");
    }

    const cfg = konfigurasiMidtrans();
    if (!cfg) throw new AdminError(503, "Gateway pembayaran belum aktif.");

    const ref = adminDb().collection(KOLEKSI_PEMBAYARAN).doc(orderId);
    const snap = await ref.get();
    if (!snap.exists) throw new AdminError(404, "Pesanan tidak ditemukan.");
    const bayar = snap.data() as Pembayaran;

    if (!bolehPeriksaUlang(bayar)) {
      throw new AdminError(409, "Pesanan ini sudah selesai, tidak ada yang perlu diperiksa.");
    }

    const notif = await ambilStatusTransaksi(cfg, orderId);
    if (!notif) {
      // Transaksinya tidak pernah dibuat di sisi Midtrans: jendela pembayaran
      // dibuka lalu ditutup tanpa memilih cara bayar. Bukan kesalahan, dan
      // bukan sesuatu yang bisa diperbaiki dari sini.
      await catatJejak(
        {
          aksi: "aktivasi",
          aktor: admin.email ?? admin.uid,
          aktorUid: admin.uid,
          sasaran: bayar.uid,
          ringkasan: `Pesanan ${orderId} diperiksa ulang, Midtrans belum punya transaksinya.`,
          detail: { orderId, hasil: "tidak ada transaksi" },
        },
        req,
      );
      return Response.json({
        ok: true,
        status: bayar.status,
        baru: false,
        adaTransaksi: false,
      });
    }

    const hasil = await terapkanPembayaran(orderId, notif, req);

    // Dicatat walau tidak ada yang berubah. Yang ingin bisa ditelusuri bukan
    // cuma perubahannya, melainkan bahwa seorang admin pernah menanyakannya:
    // itu jejak percakapan dengan pelanggan yang mengaku sudah membayar.
    await catatJejak(
      {
        aksi: "aktivasi",
        aktor: admin.email ?? admin.uid,
        aktorUid: admin.uid,
        sasaran: bayar.uid,
        ringkasan: `Pesanan ${orderId} milik ${bayar.email} diperiksa ulang ke Midtrans, hasilnya ${hasil.status}.`,
        detail: {
          orderId,
          status: hasil.status,
          diterapkanSekarang: hasil.baru,
          transactionStatus: notif.transaction_status ?? null,
          fraudStatus: notif.fraud_status ?? null,
        },
      },
      req,
    );

    return Response.json({
      ok: true,
      status: hasil.status,
      baru: hasil.baru,
      adaTransaksi: true,
    });
  } catch (err) {
    if (err instanceof PembayaranTidakDitemukan) {
      return handleAdminError(new AdminError(404, "Pesanan tidak ditemukan."));
    }
    return handleAdminError(err);
  }
}
