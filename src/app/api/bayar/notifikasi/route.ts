import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import {
  nominalCocok,
  orderIdValid,
  tandaTanganCocok,
  type NotifikasiMidtrans,
} from "@/lib/midtrans";
import { konfigurasiMidtrans } from "@/lib/midtrans-server";
import {
  KOLEKSI_PEMBAYARAN,
  PembayaranTidakDitemukan,
  terapkanPembayaran,
} from "@/lib/pembayaran-server";
import type { Pembayaran } from "@/types";

/**
 * Notifikasi pembayaran dari server Midtrans.
 *
 * Route ini terbuka untuk umum, dan memang harus begitu: yang memanggilnya
 * server Midtrans, bukan peramban pengguna, jadi tidak ada token Firebase
 * yang bisa diminta. Yang menggantikan autentikasinya adalah tanda tangan
 * sha512 di dalam badan permintaan, yang hanya bisa dibuat pihak yang tahu
 * kunci server kita. Tanpa pemeriksaan itu, satu permintaan POST berisi
 * `{"order_id":"...","transaction_status":"settlement"}` cukup untuk memberi
 * diri sendiri langganan tiga tahun gratis.
 *
 * URL-nya harus didaftarkan di dashboard Midtrans, di menu Settings lalu
 * Payment, kolom "Payment Notification URL", diisi dengan
 * `https://haribaik.seawise.id/api/bayar/notifikasi`.
 *
 * Bukan "Settings, Configuration": halaman itu sudah tidak ada. Midtrans
 * memindahkan seluruh kolom notifikasi ke Settings, Payment, dan panduan lama
 * yang masih beredar menyuruh mencari menu yang tidak akan ditemukan.
 *
 * Sandbox dan produksi punya dashboard sendiri-sendiri
 * (dashboard.sandbox.midtrans.com dan dashboard.midtrans.com), dan
 * pengaturannya tidak saling menyalin. URL yang didaftarkan di satu sisi
 * tidak berlaku di sisi lain.
 */
export async function POST(req: NextRequest) {
  try {
    const cfg = konfigurasiMidtrans();
    if (!cfg) return Response.json({ error: "Gateway belum aktif." }, { status: 503 });

    // Badan yang bukan JSON dijawab 400, bukan dibiarkan jatuh ke 500.
    // Bedanya penting saat menelusuri: 500 berbadan kosong di route ini
    // hampir selalu berarti fungsinya gagal boot, dan itu yang dicari uji
    // asap. Permintaan sampah dari pemindai tidak boleh menyamar jadi itu.
    let notif: NotifikasiMidtrans;
    try {
      notif = (await req.json()) as NotifikasiMidtrans;
    } catch {
      return Response.json({ error: "Badan permintaan bukan JSON." }, { status: 400 });
    }
    const orderId = notif.order_id ?? "";

    if (!orderIdValid(orderId)) {
      return Response.json({ error: "order_id tidak dikenali." }, { status: 400 });
    }

    if (!(await tandaTanganCocok(notif, cfg.serverKey))) {
      console.error("[midtrans notifikasi] tanda tangan tidak cocok", orderId);
      return Response.json({ error: "Tanda tangan tidak sah." }, { status: 401 });
    }

    const snap = await adminDb().collection(KOLEKSI_PEMBAYARAN).doc(orderId).get();
    if (!snap.exists) {
      // 200, bukan 404. Midtrans mengulang kirim setiap notifikasi yang tidak
      // dijawab 200 sampai berjam-jam kemudian, dan pesanan yang memang tidak
      // ada di sini tidak akan pernah muncul betapapun sering diulang. Yang
      // dibutuhkan bukan pengulangan, melainkan catatan di log.
      console.error("[midtrans notifikasi] pesanan tidak ada di Firestore", orderId);
      return Response.json({ ok: true, diabaikan: "tidak dikenal" });
    }
    const bayar = snap.data() as Pembayaran;

    // Nominalnya sudah ikut ditandatangani, jadi ini bukan lapis keamanan
    // melainkan penangkap salah pasang: notifikasi dari akun merchant lain
    // yang kebetulan diarahkan ke sini, atau pesanan yang harganya berubah
    // di tengah jalan. Menerapkannya berarti membuka langganan atas nominal
    // yang bukan nominal kita.
    if (!nominalCocok(notif.gross_amount, bayar.total)) {
      console.error(
        "[midtrans notifikasi] nominal tidak cocok",
        orderId,
        notif.gross_amount,
        bayar.total,
      );
      return Response.json({ error: "Nominal tidak cocok." }, { status: 409 });
    }

    const hasil = await terapkanPembayaran(orderId, notif, req);
    return Response.json({ ok: true, status: hasil.status, baru: hasil.baru });
  } catch (err) {
    if (err instanceof PembayaranTidakDitemukan) {
      return Response.json({ ok: true, diabaikan: "tidak dikenal" });
    }
    console.error("[midtrans notifikasi]", err);
    return Response.json({ error: "Gagal memproses notifikasi." }, { status: 500 });
  }
}
