import "server-only";

import type { NextRequest } from "next/server";
import { catatJejak } from "@/lib/audit";
import { adminDb } from "@/lib/firebase/admin";
import { statusDariNotifikasi, type NotifikasiMidtrans } from "@/lib/midtrans";
import { extendYears } from "@/lib/subscription";
import type { Aktivasi, Pembayaran, StatusPembayaranDoc, UserProfile } from "@/types";

export const KOLEKSI_PEMBAYARAN = "pembayaran";

/**
 * Satu-satunya tempat pembayaran gateway diubah jadi langganan.
 *
 * Dipakai dua pemanggil: notifikasi dari server Midtrans, dan pemeriksaan
 * status yang dilakukan halaman pembayaran setelah jendela Snap ditutup.
 * Keduanya bisa tiba bersamaan untuk pesanan yang sama, dan keduanya harus
 * berakhir pada hasil yang persis sama. Karena itu penerapannya dibungkus
 * satu transaksi Firestore yang menolak berjalan dua kali: `diterapkanPada`
 * ditulis di dalam transaksi yang sama dengan perpanjangan langganannya, jadi
 * tidak ada celah di antara "sudah diperpanjang" dan "sudah ditandai".
 *
 * Tanpa itu, dua notifikasi yang datang berdekatan (Midtrans memang mengulang
 * kirim sampai dijawab 200) akan memperpanjang langganan dua kali untuk satu
 * kali bayar.
 */

export interface HasilPenerapan {
  status: StatusPembayaranDoc;
  /** true bila panggilan inilah yang benar-benar menerapkannya. */
  baru: boolean;
  expiresAt: string | null;
  aktivasiId: string | null;
}

/** Bahan jejak audit, dibawa keluar dari transaksi, bukan dititipkan ke closure. */
interface Ringkasan {
  uid: string;
  email: string;
  paketNama: string;
  total: number;
  sebelum: { status: string; expiresAt: string | null; addOn: string[] };
  sesudah: { status: string; expiresAt: string | null; addOn: string[] };
}

type HasilInternal = HasilPenerapan & { ringkas: Ringkasan | null };

/**
 * Terapkan keadaan terbaru sebuah pesanan.
 *
 * `notif` boleh datang dari webhook maupun dari endpoint status Midtrans:
 * bentuknya sama, dan tanda tangannya sudah diperiksa pemanggil bila memang
 * berasal dari webhook.
 */
export async function terapkanPembayaran(
  orderId: string,
  notif: NotifikasiMidtrans,
  req?: NextRequest,
): Promise<HasilPenerapan> {
  const db = adminDb();
  const bayarRef = db.collection(KOLEKSI_PEMBAYARAN).doc(orderId);
  const status = statusDariNotifikasi(notif);
  const now = new Date();

  const catatanMidtrans = {
    transactionId: notif.transaction_id ?? null,
    paymentType: notif.payment_type ?? null,
    transactionStatus: notif.transaction_status ?? null,
    fraudStatus: notif.fraud_status ?? null,
  };

  // Ringkasan untuk jejak audit dibawa keluar sebagai bagian dari hasil
  // transaksi, bukan dititipkan ke variabel di luarnya. Jejaknya sendiri
  // ditulis sesudah transaksi selesai: kegagalan menulis catatan tidak boleh
  // membatalkan pengaktifan langganan orang yang sudah membayar.
  const hasil = await db.runTransaction(async (tx): Promise<HasilInternal> => {
    const bayarSnap = await tx.get(bayarRef);
    if (!bayarSnap.exists) throw new PembayaranTidakDitemukan(orderId);
    const bayar = bayarSnap.data() as Pembayaran;

    // Sudah pernah diterapkan. Tidak ada yang perlu dikerjakan, dan itu
    // bukan kesalahan: Midtrans memang mengirim notifikasi yang sama
    // berulang kali sampai mendapat jawaban 200.
    if (bayar.diterapkanPada) {
      return {
        status: bayar.status,
        baru: false,
        expiresAt: null,
        aktivasiId: bayar.aktivasiId,
        ringkas: null,
      };
    }

    if (status !== "lunas") {
      tx.update(bayarRef, { status, ...catatanMidtrans });
      return { status, baru: false, expiresAt: null, aktivasiId: null, ringkas: null };
    }

    const userRef = db.collection("users").doc(bayar.uid);
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists) throw new PembayaranTidakDitemukan(orderId);
    const user = userSnap.data() as UserProfile & { addOn?: string[] };

    /*
     * Pesanan yang isinya add-on saja tidak menyentuh langganan sama sekali.
     *
     * `paketTahun` nol berarti tidak ada yang diperpanjang. Kalau ini
     * dilewatkan ke extendYears(), hasilnya tanggal habis yang sama persis
     * ditulis ulang, dan yang lebih buruk: status pengguna ikut disetel
     * "active". Untuk pemegang langganan seumur hidup itu berarti membeli satu
     * add-on menurunkannya jadi pelanggan tahunan.
     */
    const hanyaAddOn = bayar.paketTahun <= 0;
    // Seumur hidup tidak punya tanggal habis dan tidak boleh diturunkan jadi
    // langganan tahunan hanya karena pemiliknya membeli add-on. Aturan yang
    // sama persis dengan jalur persetujuan admin.
    const seumurHidup = user.subscriptionStatus === "lifetime";
    const expiresAt =
      hanyaAddOn || seumurHidup
        ? null
        : extendYears(user.subscriptionExpiresAt ?? null, bayar.paketTahun, now);

    // Add-on ditumpuk, bukan ditimpa: yang sudah dibayar sebelumnya tidak
    // boleh hilang saat membeli tambahan berikutnya.
    const addOnDimiliki = [
      ...new Set([...(user.addOn ?? []), ...bayar.addOn.map((a) => a.id)]),
    ];

    const aktivasiRef = db.collection("aktivasi").doc();
    const aktivasi: Omit<Aktivasi, "id"> = {
      uid: bayar.uid,
      email: bayar.email,
      nama: bayar.nama,
      phoneNumber: bayar.phoneNumber,
      paketId: bayar.paketId,
      paketNama: bayar.paketNama,
      paketTahun: bayar.paketTahun,
      harga: bayar.harga,
      addOn: bayar.addOn,
      total: bayar.total,
      catatan: `Dibayar lewat Midtrans (${notif.payment_type ?? "?"}), order ${orderId}.`,
      status: "disetujui",
      createdAt: bayar.createdAt,
      diputuskanPada: now.toISOString(),
      diputuskanOleh: "midtrans",
      alasanTolak: null,
    };

    tx.set(aktivasiRef, aktivasi);
    tx.update(userRef, {
      // Pembelian add-on saja tidak mengubah status maupun tanggal habis.
      ...(hanyaAddOn
        ? {}
        : {
            subscriptionStatus: seumurHidup ? "lifetime" : "active",
            ...(seumurHidup ? {} : { subscriptionExpiresAt: expiresAt }),
          }),
      addOn: addOnDimiliki,
      lastChangedBy: "midtrans",
      lastChangedAt: now.toISOString(),
    });
    tx.update(bayarRef, {
      status: "lunas" satisfies StatusPembayaranDoc,
      dibayarPada: bayar.dibayarPada ?? now.toISOString(),
      diterapkanPada: now.toISOString(),
      aktivasiId: aktivasiRef.id,
      ...catatanMidtrans,
    });

    const ringkas: Ringkasan = {
      uid: bayar.uid,
      email: bayar.email,
      paketNama: bayar.paketNama,
      total: bayar.total,
      sebelum: {
        status: user.subscriptionStatus,
        expiresAt: user.subscriptionExpiresAt ?? null,
        addOn: user.addOn ?? [],
      },
      sesudah: {
        status: hanyaAddOn ? user.subscriptionStatus : seumurHidup ? "lifetime" : "active",
        expiresAt: hanyaAddOn ? (user.subscriptionExpiresAt ?? null) : expiresAt,
        addOn: addOnDimiliki,
      },
    };

    return { status: "lunas", baru: true, expiresAt, aktivasiId: aktivasiRef.id, ringkas };
  });

  const r = hasil.ringkas;
  if (hasil.baru && r) {
    await catatJejak(
      {
        aksi: "aktivasi",
        aktor: "midtrans",
        aktorUid: "midtrans",
        sasaran: r.uid,
        ringkasan: `Pembayaran ${r.paketNama} dari ${r.email} lunas lewat Midtrans, ${hasil.expiresAt ? `aktif sampai ${hasil.expiresAt}` : "tanpa mengubah masa berlaku"}.`,
        detail: {
          orderId,
          total: r.total,
          transactionId: notif.transaction_id ?? null,
          paymentType: notif.payment_type ?? null,
          aktivasi: hasil.aktivasiId,
          sebelum: r.sebelum,
          sesudah: r.sesudah,
        },
      },
      req,
    );
  }

  return {
    status: hasil.status,
    baru: hasil.baru,
    expiresAt: hasil.expiresAt,
    aktivasiId: hasil.aktivasiId,
  };
}

/** Pesanan yang tidak ada di Firestore. Dibedakan supaya route bisa menjawab 404. */
export class PembayaranTidakDitemukan extends Error {
  constructor(orderId: string) {
    super(`Pesanan ${orderId} tidak ditemukan.`);
    this.name = "PembayaranTidakDitemukan";
  }
}
