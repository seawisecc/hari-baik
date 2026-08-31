/**
 * Midtrans: bagian yang murni, tanpa jaringan dan tanpa kunci rahasia.
 *
 * Sengaja tidak memakai `node:crypto` maupun `server-only`. Tanda tangan
 * notifikasi diperiksa lewat Web Crypto yang ada di Node maupun peramban,
 * jadi berkas ini bisa diimpor dari mana saja dan yang lebih penting, bisa
 * diuji langsung oleh `midtrans.test.ts`. Pemeriksaan tanda tangan adalah
 * satu-satunya hal yang memisahkan "Midtrans bilang lunas" dari "siapa pun
 * di internet bilang lunas", jadi ia harus punya tes yang benar-benar
 * menjalankannya, bukan tes yang membaca kodenya sebagai teks.
 *
 * Yang butuh kunci server ada di `midtrans-server.ts`.
 */

/** Sandbox atau produksi. Ditentukan dari awalan kunci, bukan dari env terpisah. */
export type ModeMidtrans = "sandbox" | "produksi";

/**
 * Mode dibaca dari kuncinya sendiri.
 *
 * Midtrans memberi kunci sandbox dengan awalan `SB-`, dan kunci produksi
 * tanpa awalan itu. Menyimpannya sebagai env var tersendiri berarti ada dua
 * sumber kebenaran yang bisa berbeda, dan yang paling mungkin terjadi adalah
 * kunci produksi terpasang sementara saklarnya masih menunjuk sandbox: setiap
 * pembayaran dikirim ke server yang salah dan tidak ada satu pun yang lunas.
 * Kuncinya sendiri sudah membawa jawabannya.
 */
export function modeDariKunci(kunci: string): ModeMidtrans {
  return kunci.trim().startsWith("SB-") ? "sandbox" : "produksi";
}

/** Endpoint pembuatan transaksi Snap. */
export function urlTransaksiSnap(mode: ModeMidtrans): string {
  return mode === "produksi"
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
}

/** Skrip Snap yang dimuat peramban untuk membuka jendela pembayaran. */
export function urlSnapJs(mode: ModeMidtrans): string {
  return mode === "produksi"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
}

/** Endpoint status transaksi, dipakai untuk bertanya langsung ke Midtrans. */
export function urlStatusTransaksi(mode: ModeMidtrans, orderId: string): string {
  const asal =
    mode === "produksi" ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";
  return `${asal}/v2/${encodeURIComponent(orderId)}/status`;
}

/**
 * Id pesanan.
 *
 * Midtrans membatasi 50 karakter dan hanya menerima huruf, angka, serta
 * `-`, `_`, `.`, `~`. Yang lebih mengikat: id ini harus unik selamanya untuk
 * satu akun merchant, termasuk terhadap pesanan yang gagal. Karena itu waktu
 * dan angka acak ikut masuk, bukan hanya uid: orang yang membatalkan
 * pembayaran lalu mencoba lagi harus mendapat id baru, kalau tidak Midtrans
 * menolak percobaan keduanya dan yang terlihat pengguna cuma tombol yang
 * tidak melakukan apa-apa.
 */
export function buatOrderId(uid: string, waktu: number, acak: string): string {
  const potonganUid = uid.replace(/[^A-Za-z0-9]/g, "").slice(0, 10);
  const potonganAcak = acak.replace(/[^A-Za-z0-9]/g, "").slice(0, 6) || "0";
  return `HB-${potonganUid}-${waktu.toString(36)}-${potonganAcak}`.slice(0, 50);
}

/** Apakah untaian ini berbentuk order id buatan kita? */
export function orderIdValid(id: string): boolean {
  return /^HB-[A-Za-z0-9]{1,10}-[a-z0-9]+-[A-Za-z0-9]+$/.test(id) && id.length <= 50;
}

/** Bentuk notifikasi Midtrans, seperlunya saja. */
export interface NotifikasiMidtrans {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
  transaction_id?: string;
  payment_type?: string;
  transaction_time?: string;
  settlement_time?: string;
  status_message?: string;
}

/**
 * Keadaan sebuah pembayaran menurut kita.
 *
 * - `lunas`     : uangnya diterima, langganan boleh dinyalakan
 * - `menunggu`  : sudah dibuat tapi belum dibayar, atau sedang ditinjau
 * - `gagal`     : dibatalkan, ditolak, atau kedaluwarsa
 * - `dikembalikan` : uangnya dikembalikan setelah sempat lunas
 */
export type StatusPembayaran = "lunas" | "menunggu" | "gagal" | "dikembalikan";

/**
 * Terjemahan status Midtrans ke status kita.
 *
 * `capture` tidak otomatis berarti lunas. Untuk kartu kredit, Midtrans
 * menahan transaksi yang mencurigakan dengan `fraud_status: "challenge"`:
 * uangnya belum tentu jadi milik kita dan merchant yang harus memutuskan.
 * Memperlakukannya sama dengan `accept` berarti membuka langganan atas
 * pembayaran yang beberapa jam kemudian bisa dibatalkan.
 *
 * Pengembalian dana dipisahkan dari `gagal` dengan sengaja. Keduanya berarti
 * uangnya tidak ada, tapi yang satu belum pernah masuk dan yang satu sudah
 * sempat membuka akses. Yang kedua butuh keputusan orang, bukan pencabutan
 * otomatis di tengah masa langganan yang mungkin sudah dipakai.
 */
export function statusDariNotifikasi(n: NotifikasiMidtrans): StatusPembayaran {
  const status = (n.transaction_status ?? "").toLowerCase();
  const fraud = (n.fraud_status ?? "").toLowerCase();

  if (status === "capture") return fraud === "challenge" ? "menunggu" : "lunas";
  if (status === "settlement") return "lunas";
  if (status === "pending") return "menunggu";
  if (status === "refund" || status === "partial_refund" || status === "chargeback") {
    return "dikembalikan";
  }
  return "gagal";
}

/** Heksadesimal dari untaian byte, huruf kecil, seperti yang dikirim Midtrans. */
function keHeks(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Tanda tangan yang seharusnya, menurut rumus Midtrans:
 * sha512(order_id + status_code + gross_amount + server_key).
 *
 * `gross_amount` dipakai apa adanya seperti yang dikirim Midtrans, termasuk
 * dua angka desimalnya ("150000.00"). Membulatkannya atau membuang koma akan
 * menghasilkan tanda tangan yang tidak pernah cocok, dan gejalanya adalah
 * setiap pembayaran yang benar-benar lunas ditolak sebagai palsu.
 */
export async function tandaTanganDiharapkan(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
): Promise<string> {
  const data = new TextEncoder().encode(orderId + statusCode + grossAmount + serverKey);
  return keHeks(await crypto.subtle.digest("SHA-512", data));
}

/**
 * Perbandingan yang tidak bocor lewat waktu.
 *
 * Berlebihan? Mungkin. Tapi yang dibandingkan di sini adalah satu-satunya
 * pembeda antara notifikasi asli dari Midtrans dan permintaan POST buatan
 * siapa pun, dan biayanya cuma beberapa baris.
 */
function samaPersis(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let beda = 0;
  for (let i = 0; i < a.length; i++) beda |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return beda === 0;
}

/**
 * Apakah notifikasi ini benar-benar datang dari Midtrans?
 *
 * Route notifikasi terbuka untuk umum: ia tidak bisa meminta token Firebase
 * karena yang memanggilnya server Midtrans, bukan peramban pengguna. Tanda
 * tangan inilah pengganti autentikasinya. Tanpa pemeriksaan ini, satu
 * permintaan POST berisi `{"order_id":"...","transaction_status":"settlement"}`
 * cukup untuk memberi diri sendiri langganan tiga tahun gratis.
 */
export async function tandaTanganCocok(
  n: NotifikasiMidtrans,
  serverKey: string,
): Promise<boolean> {
  if (!n.order_id || !n.status_code || !n.gross_amount || !n.signature_key) return false;
  const harus = await tandaTanganDiharapkan(
    n.order_id,
    n.status_code,
    n.gross_amount,
    serverKey,
  );
  return samaPersis(harus, n.signature_key.toLowerCase());
}

/**
 * Apakah nominal yang dikabarkan Midtrans sama dengan yang kita catat?
 *
 * `gross_amount` datang sebagai untaian berdesimal ("150000.00"), sementara
 * yang kita simpan bilangan bulat rupiah. Dibandingkan sebagai angka, bukan
 * sebagai teks.
 */
export function nominalCocok(grossAmount: string | undefined, total: number): boolean {
  if (!grossAmount) return false;
  const n = Number(grossAmount);
  return Number.isFinite(n) && Math.round(n) === total;
}

/** Satu baris rincian belanja yang dikirim ke Midtrans. */
export interface ItemMidtrans {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

/**
 * Rincian belanja untuk satu pesanan.
 *
 * Midtrans menolak transaksi bila jumlah `price * quantity` seluruh item
 * tidak sama persis dengan `gross_amount`, jadi keduanya dirakit dari daftar
 * yang sama di sini, bukan dihitung dua kali di tempat berbeda. Nama item
 * dipotong 50 karakter karena itu batas Midtrans; nama yang lebih panjang
 * membuat seluruh transaksi ditolak, bukan namanya yang terpotong.
 */
export function rincianItem(
  paket: { id: string; nama: string; harga: number },
  addOn: { id: string; nama: string; harga: number }[],
): ItemMidtrans[] {
  return [paket, ...addOn].map((x) => ({
    id: x.id.slice(0, 50),
    price: x.harga,
    quantity: 1,
    name: x.nama.slice(0, 50),
  }));
}

/** Total dari rincian. Sumber `gross_amount`, supaya keduanya tidak bisa berbeda. */
export function totalItem(items: ItemMidtrans[]): number {
  return items.reduce((n, i) => n + i.price * i.quantity, 0);
}
