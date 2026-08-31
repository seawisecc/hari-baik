import type { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { bacaHarga } from "@/lib/harga-server";
import { buatOrderId, orderIdValid, rincianItem, totalItem } from "@/lib/midtrans";
import {
  ambilStatusTransaksi,
  buatTransaksiSnap,
  konfigurasiMidtrans,
} from "@/lib/midtrans-server";
import {
  KOLEKSI_PEMBAYARAN,
  PembayaranTidakDitemukan,
  terapkanPembayaran,
} from "@/lib/pembayaran-server";
import type { Pembayaran, UserProfile } from "@/types";

/**
 * Pembayaran langganan lewat Midtrans.
 *
 * POST membuat pesanan dan mengembalikan token Snap. GET menanyakan status
 * satu pesanan langsung ke Midtrans, lalu menerapkannya.
 *
 * Harga tidak pernah datang dari klien. Yang dikirim peramban cuma id paket
 * dan id add-on; nominalnya dirakit di sini dari `bacaHarga()`, sama seperti
 * pada route pengajuan aktivasi manual. Kalau nominalnya ikut dikirim, siapa
 * pun bisa membeli paket tiga tahun seharga seribu rupiah, dan Midtrans akan
 * dengan senang hati menerimanya karena yang menentukan tagihan adalah kita.
 */

async function penggunaDari(req: NextRequest) {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    return await adminAuth().verifyIdToken(token);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await penggunaDari(req);
    if (!decoded) return Response.json({ error: "Token tidak valid." }, { status: 401 });

    const cfg = konfigurasiMidtrans();
    if (!cfg) {
      // 503, bukan 500: bukan kode yang rusak, melainkan layanan yang belum
      // dipasang. Halaman langganan menyembunyikan tombolnya kalau kunci
      // kliennya kosong, jadi yang sampai ke sini cuma percobaan langsung.
      return Response.json(
        { error: "Pembayaran otomatis belum aktif. Silakan pakai transfer manual." },
        { status: 503 },
      );
    }

    const body = (await req.json()) as { paketId?: string; addOnIds?: string[] };

    const harga = await bacaHarga();
    const paket = harga.paket.find((p) => p.id === body.paketId && p.aktif);
    if (!paket) return Response.json({ error: "Paket tidak ditemukan." }, { status: 400 });

    const idAddOn = Array.isArray(body.addOnIds) ? body.addOnIds : [];
    const addOn = harga.addOn
      .filter((a) => a.aktif && idAddOn.includes(a.id))
      .map((a) => ({ id: a.id, nama: a.nama.id, harga: a.harga }));

    const db = adminDb();
    const userRef = db.collection("users").doc(decoded.uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists)
      return Response.json({ error: "Profil tidak ditemukan." }, { status: 404 });
    const user = userSnap.data() as UserProfile;

    const items = rincianItem({ id: paket.id, nama: paket.nama.id, harga: paket.harga }, addOn);
    const total = totalItem(items);

    const orderId = buatOrderId(
      decoded.uid,
      Date.now(),
      Math.random().toString(36).slice(2, 8),
    );

    const doc: Pembayaran = {
      orderId,
      uid: decoded.uid,
      email: user.email ?? decoded.email ?? "",
      nama: user.nama ?? "",
      phoneNumber: user.phoneNumber ?? null,
      paketId: paket.id,
      paketNama: paket.nama.id,
      paketTahun: paket.tahun,
      harga: paket.harga,
      addOn,
      total,
      status: "menunggu",
      mode: cfg.mode,
      createdAt: new Date().toISOString(),
      dibayarPada: null,
      diterapkanPada: null,
      aktivasiId: null,
      transactionId: null,
      paymentType: null,
      transactionStatus: null,
      fraudStatus: null,
    };

    // Dicatat sebelum token diminta, bukan sesudah. Kalau urutannya dibalik
    // dan penulisan Firestore gagal, yang tersisa adalah transaksi hidup di
    // Midtrans yang bisa dibayar orang sementara di sisi kita tidak ada
    // dokumen apa pun untuk dicocokkan notifikasinya nanti.
    await db.collection(KOLEKSI_PEMBAYARAN).doc(orderId).set(doc);

    const snap = await buatTransaksiSnap(cfg, {
      orderId,
      total,
      items,
      nama: doc.nama,
      email: doc.email,
      phoneNumber: doc.phoneNumber,
      urlSelesai: `${req.nextUrl.origin}/expired?bayar=${encodeURIComponent(orderId)}`,
    });

    return Response.json({
      ok: true,
      orderId,
      token: snap.token,
      redirectUrl: snap.redirect_url,
      total,
      mode: cfg.mode,
    });
  } catch (err) {
    console.error("[bayar]", err);
    return Response.json({ error: "Gagal memulai pembayaran." }, { status: 500 });
  }
}

/**
 * Bagaimana pesanan ini sekarang?
 *
 * Dipanggil halaman pembayaran setelah jendela Snap ditutup. Statusnya
 * ditanyakan langsung ke Midtrans, bukan dibaca dari dokumen kita, karena
 * yang paling sering terjadi adalah notifikasinya belum sampai: dokumen kita
 * masih "menunggu" padahal uangnya sudah masuk. Jawaban Midtrans lalu
 * diterapkan lewat jalur yang sama dengan webhook, jadi tidak ada dua sumber
 * kebenaran yang bisa berbeda.
 */
export async function GET(req: NextRequest) {
  try {
    const decoded = await penggunaDari(req);
    if (!decoded) return Response.json({ error: "Token tidak valid." }, { status: 401 });

    const orderId = req.nextUrl.searchParams.get("orderId") ?? "";
    if (!orderIdValid(orderId)) {
      return Response.json({ error: "orderId tidak sah." }, { status: 400 });
    }

    const snap = await adminDb().collection(KOLEKSI_PEMBAYARAN).doc(orderId).get();
    if (!snap.exists)
      return Response.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    const bayar = snap.data() as Pembayaran;

    // Pesanan orang lain dijawab 404, bukan 403: yang bertanya tidak berhak
    // tahu bahwa id itu ada.
    if (bayar.uid !== decoded.uid) {
      return Response.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    if (bayar.diterapkanPada) {
      return Response.json({ ok: true, status: bayar.status, sudahDiterapkan: true });
    }

    const cfg = konfigurasiMidtrans();
    if (!cfg) return Response.json({ ok: true, status: bayar.status });

    const notif = await ambilStatusTransaksi(cfg, orderId);
    // Belum ada transaksi di sisi Midtrans, yaitu jendela Snap dibuka lalu
    // ditutup tanpa memilih cara bayar. Statusnya tetap menunggu.
    if (!notif) return Response.json({ ok: true, status: bayar.status });

    const hasil = await terapkanPembayaran(orderId, notif, req);
    return Response.json({ ok: true, status: hasil.status, baru: hasil.baru });
  } catch (err) {
    if (err instanceof PembayaranTidakDitemukan) {
      return Response.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }
    console.error("[bayar status]", err);
    return Response.json({ error: "Gagal memeriksa pembayaran." }, { status: 500 });
  }
}
