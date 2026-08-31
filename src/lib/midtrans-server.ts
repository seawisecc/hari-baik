import "server-only";

import {
  modeDariKunci,
  urlStatusTransaksi,
  urlTransaksiSnap,
  type ItemMidtrans,
  type ModeMidtrans,
  type NotifikasiMidtrans,
} from "@/lib/midtrans";

/**
 * Sisi Midtrans yang memegang kunci server.
 *
 * Kunci server adalah kredensial penuh: yang memilikinya bisa membuat
 * transaksi, membatalkan, dan menarik dana. Ia tidak pernah boleh sampai ke
 * peramban, jadi berkas ini ditandai `server-only`. Yang dikirim ke klien
 * hanya kunci klien lewat `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, dan itu memang
 * dirancang untuk terlihat.
 */

export interface KonfigurasiMidtrans {
  serverKey: string;
  clientKey: string;
  mode: ModeMidtrans;
}

/**
 * Konfigurasi, atau null bila kuncinya belum dipasang.
 *
 * Mengembalikan null, bukan melempar. Aplikasi ini sudah punya jalur
 * pembayaran lewat transfer manual sebelum Midtrans ada, dan jalur itu harus
 * tetap hidup ketika gateway-nya belum dikonfigurasi atau sedang dimatikan.
 * Route pembayaran menjawab 503 dengan keterangan, halamannya menyembunyikan
 * tombol gateway, dan tidak ada satu pun halaman yang jatuh karena satu env
 * var belum diisi.
 */
export function konfigurasiMidtrans(): KonfigurasiMidtrans | null {
  const serverKey = (process.env.MIDTRANS_SERVER_KEY ?? "").trim();
  const clientKey = (process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "").trim();
  if (!serverKey || !clientKey) return null;

  const modeServer = modeDariKunci(serverKey);
  // Kunci server sandbox dengan kunci klien produksi (atau sebaliknya) adalah
  // salah pasang yang paling mungkin terjadi, karena keduanya diambil dari
  // dua kotak berbeda di dashboard Midtrans dan bentuknya mirip. Gejalanya di
  // layar cuma "transaksi tidak ditemukan", yang tidak menunjuk ke mana pun.
  if (modeServer !== modeDariKunci(clientKey)) {
    console.error(
      "[midtrans] kunci server dan kunci klien berbeda lingkungan; salah satunya sandbox, satunya produksi.",
    );
    return null;
  }

  return { serverKey, clientKey, mode: modeServer };
}

/** Basic auth Midtrans: kunci server sebagai username, kata sandi kosong. */
function kepalaOtorisasi(serverKey: string): string {
  return "Basic " + Buffer.from(`${serverKey}:`).toString("base64");
}

export interface PermintaanSnap {
  orderId: string;
  total: number;
  items: ItemMidtrans[];
  nama: string;
  email: string;
  phoneNumber: string | null;
  /** Ke mana pengguna dikembalikan setelah selesai membayar. */
  urlSelesai: string;
}

export interface HasilSnap {
  token: string;
  redirect_url: string;
}

/**
 * Buat transaksi Snap dan ambil tokennya.
 *
 * `expiry` dipatok 24 jam supaya pesanan yang ditinggalkan tidak menggantung
 * selamanya sebagai tagihan virtual account yang masih bisa dibayar orang
 * berminggu-minggu kemudian, saat harganya mungkin sudah berbeda.
 */
export async function buatTransaksiSnap(
  cfg: KonfigurasiMidtrans,
  p: PermintaanSnap,
): Promise<HasilSnap> {
  const res = await fetch(urlTransaksiSnap(cfg.mode), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: kepalaOtorisasi(cfg.serverKey),
    },
    body: JSON.stringify({
      transaction_details: { order_id: p.orderId, gross_amount: p.total },
      item_details: p.items,
      customer_details: {
        first_name: p.nama.slice(0, 50) || "Pelanggan",
        email: p.email,
        ...(p.phoneNumber ? { phone: p.phoneNumber.slice(0, 25) } : {}),
      },
      callbacks: { finish: p.urlSelesai },
      expiry: { unit: "hours", duration: 24 },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  const teks = await res.text();
  if (!res.ok) {
    // Badan jawaban Midtrans menyebut alasannya (nominal tidak cocok, id
    // pesanan sudah dipakai, kunci salah). Tanpa mencatatnya, yang tersisa di
    // log cuma "gagal membuat transaksi" dan tidak ada yang bisa ditelusuri.
    console.error("[midtrans] gagal membuat transaksi", res.status, teks.slice(0, 400));
    throw new Error(`Midtrans menolak transaksi (${res.status}).`);
  }

  const data = JSON.parse(teks) as Partial<HasilSnap>;
  if (!data.token) throw new Error("Midtrans tidak mengembalikan token.");
  return { token: data.token, redirect_url: data.redirect_url ?? "" };
}

/**
 * Tanya langsung ke Midtrans: bagaimana status pesanan ini sekarang?
 *
 * Ini bukan pengganti webhook, melainkan jaring pengamannya. Notifikasi bisa
 * gagal sampai (URL-nya belum dipasang di dashboard, deploy sedang berganti,
 * jaringan Midtrans sedang tersendat), dan yang menanggung akibatnya adalah
 * orang yang uangnya sudah keluar tapi aplikasinya masih terkunci. Karena itu
 * halaman pembayaran ikut bertanya sendiri setelah jendela Snap ditutup.
 *
 * Jawabannya diperlakukan sama persis dengan notifikasi, lewat fungsi
 * penerapan yang sama, jadi tidak ada dua jalur yang bisa berbeda kesimpulan.
 */
export async function ambilStatusTransaksi(
  cfg: KonfigurasiMidtrans,
  orderId: string,
): Promise<NotifikasiMidtrans | null> {
  const res = await fetch(urlStatusTransaksi(cfg.mode, orderId), {
    method: "GET",
    headers: { Accept: "application/json", Authorization: kepalaOtorisasi(cfg.serverKey) },
    signal: AbortSignal.timeout(15_000),
  });

  const teks = await res.text();
  if (!res.ok) {
    // 404 berarti transaksinya belum pernah dibuat di sisi Midtrans, yaitu
    // pesanan yang tokennya diambil lalu jendelanya ditutup tanpa memilih
    // cara bayar. Itu keadaan yang wajar, bukan kesalahan.
    if (res.status !== 404) {
      console.error("[midtrans] gagal membaca status", res.status, teks.slice(0, 400));
    }
    return null;
  }
  return JSON.parse(teks) as NotifikasiMidtrans;
}
