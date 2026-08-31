import type { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { bacaHarga } from "@/lib/harga-server";
import { addOnBelumDimiliki, alasanTolakAddOn, NAMA_PESANAN_ADDON } from "@/lib/addon-beli";
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

    const body = (await req.json()) as { paketId?: string | null; addOnIds?: string[] };

    const harga = await bacaHarga();
    const idAddOn = Array.isArray(body.addOnIds) ? body.addOnIds : [];

    const db = adminDb();
    const userRef = db.collection("users").doc(decoded.uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists)
      return Response.json({ error: "Profil tidak ditemukan." }, { status: 404 });
    const user = userSnap.data() as UserProfile;

    /*
     * Dua bentuk pesanan, satu route.
     *
     * Dengan paket: berlangganan atau memperpanjang, add-on ikut kalau
     * dipilih. Tanpa paket: pelanggan yang langganannya sudah berjalan
     * menambah add-on di tengah jalan, tanpa harus membeli setahun lagi
     * yang belum dia butuhkan.
     */
    const paket = body.paketId
      ? harga.paket.find((p) => p.id === body.paketId && p.aktif)
      : null;
    if (body.paketId && !paket) {
      return Response.json({ error: "Paket tidak ditemukan." }, { status: 400 });
    }

    // Yang sudah dimiliki tidak ditagih lagi. Tanpa ini, pelanggan yang
    // menekan tombol dua kali membayar dua kali untuk barang yang sama, dan
    // yang kedua tidak menambah apa pun ke akunnya.
    const idBaru = paket ? idAddOn : addOnBelumDimiliki(idAddOn, user.addOn);

    if (!paket) {
      const tolak = alasanTolakAddOn(user, idBaru, harga.addOn);
      if (tolak) {
        const pesan: Record<string, string> = {
          kosong: "Pilih dulu add-on yang mau ditambahkan.",
          "tidak-dijual": "Add-on itu sedang tidak dijual.",
          "sudah-punya": "Add-on itu sudah kamu miliki.",
          "tanpa-langganan":
            "Add-on hanya bisa ditambahkan kalau langgananmu sedang aktif. Aktifkan langganan dulu.",
        };
        return Response.json({ error: pesan[tolak], tolak }, { status: 409 });
      }
    }

    const addOn = harga.addOn
      .filter((a) => a.aktif && idBaru.includes(a.id))
      .map((a) => ({ id: a.id, nama: a.nama.id, harga: a.harga }));

    // Rincian dirakit dari daftar yang sama dengan totalnya, jadi keduanya
    // tidak bisa berbeda. Tanpa paket, barisnya cuma add-on.
    const items = paket
      ? rincianItem({ id: paket.id, nama: paket.nama.id, harga: paket.harga }, addOn)
      : addOn.map((a) => ({
          id: a.id,
          price: a.harga,
          quantity: 1,
          name: a.nama.slice(0, 50),
        }));
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
      paketId: paket?.id ?? null,
      paketNama: paket?.nama.id ?? NAMA_PESANAN_ADDON,
      paketTahun: paket?.tahun ?? 0,
      harga: paket?.harga ?? 0,
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
      // Dipulangkan ke halaman terima kasih, bukan ke halaman terkunci.
      // Sebagian metode (e-wallet, kartu dengan 3DS) meninggalkan halaman ini
      // sepenuhnya, dan sebelum ini mereka kembali ke /expired: orang yang
      // baru saja membayar mendarat di layar yang berbunyi "aksesmu habis".
      urlSelesai: `${req.nextUrl.origin}/terima-kasih?bayar=${encodeURIComponent(orderId)}`,
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

    // Rincian ikut dikirim supaya halaman terima kasih bisa menyebutkan apa
    // yang barusan dibeli, bukan cuma "berhasil". Yang baru membayar ingin
    // melihat kembali apa yang dia bayar, dan itu juga yang membuatnya sadar
    // lebih awal kalau ternyata salah pilih.
    const rincian = {
      paketNama: bayar.paketNama,
      paketTahun: bayar.paketTahun,
      addOn: bayar.addOn.map((a) => a.nama),
      total: bayar.total,
    };

    if (bayar.diterapkanPada) {
      return Response.json({
        ok: true,
        status: bayar.status,
        sudahDiterapkan: true,
        ...rincian,
      });
    }

    const cfg = konfigurasiMidtrans();
    if (!cfg) return Response.json({ ok: true, status: bayar.status, ...rincian });

    const notif = await ambilStatusTransaksi(cfg, orderId);
    // Belum ada transaksi di sisi Midtrans, yaitu jendela Snap dibuka lalu
    // ditutup tanpa memilih cara bayar. Statusnya tetap menunggu.
    if (!notif) return Response.json({ ok: true, status: bayar.status, ...rincian });

    const hasil = await terapkanPembayaran(orderId, notif, req);
    return Response.json({ ok: true, status: hasil.status, baru: hasil.baru, ...rincian });
  } catch (err) {
    if (err instanceof PembayaranTidakDitemukan) {
      return Response.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }
    console.error("[bayar status]", err);
    return Response.json({ error: "Gagal memeriksa pembayaran." }, { status: 500 });
  }
}
