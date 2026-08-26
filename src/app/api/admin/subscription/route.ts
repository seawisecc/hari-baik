import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { AdminError, handleAdminError, requireAdmin } from "@/lib/firebase/requireAdmin";
import { HARGA_BAWAAN } from "@/lib/harga";
import { extendYears } from "@/lib/subscription";
import type { SubscriptionStatus } from "@/types";

type Action = "extend" | "set" | "lifetime" | "deactivate" | "addon";
const ACTIONS: Action[] = ["extend", "set", "lifetime", "deactivate", "addon"];

/** Batas wajar agar salah ketik tidak membuat langganan 900 tahun. */
const MAX_TAHUN = 20;

interface Body {
  uid?: string;
  action?: Action;
  /** Untuk "extend": jumlah tahun yang ditambahkan. */
  tahun?: number;
  /** Untuk "set": tanggal habis, "YYYY-MM-DD". */
  expiresAt?: string;
  /** Untuk "addon": daftar id add-on yang dimiliki pengguna ini. */
  addOn?: string[];
}

const POLA_TANGGAL = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Ubah status langganan seorang pengguna.
 *
 * - `extend`     tambah N tahun, ditumpuk dari tanggal habis yang ada
 * - `set`        tetapkan tanggal habis tertentu
 * - `lifetime`   tanpa batas waktu
 * - `deactivate` matikan sekarang juga
 * - `addon`      tetapkan add-on mana yang dimiliki pengguna ini
 *
 * `addon` sengaja menetapkan daftar penuh, bukan menambah atau mengurangi
 * satu per satu. Admin melihat daftar lengkapnya di layar lalu menyimpan apa
 * yang terlihat, jadi tidak ada keadaan yang bisa berbeda antara yang tampil
 * dan yang tersimpan.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const { uid, action, tahun, expiresAt, addOn } = (await req.json()) as Body;

    if (!uid) throw new AdminError(400, "uid wajib diisi.");
    if (!action || !ACTIONS.includes(action)) {
      throw new AdminError(400, `action harus salah satu dari: ${ACTIONS.join(", ")}.`);
    }

    const ref = adminDb().collection("users").doc(uid);
    const snap = await ref.get();
    if (!snap.exists) throw new AdminError(404, "Pengguna tidak ditemukan.");

    // Add-on ditangani terpisah: ini tidak menyentuh status langganan sama
    // sekali, karena keduanya memang dibeli terpisah.
    if (action === "addon") {
      if (!Array.isArray(addOn)) throw new AdminError(400, "addOn harus berupa daftar id.");
      // Hanya id yang benar-benar ada di katalog yang diterima. Tanpa ini,
      // salah ketik akan tersimpan diam-diam dan tidak pernah membuka apa pun.
      const dikenal = new Set(HARGA_BAWAAN.addOn.map((a) => a.id));
      const asing = addOn.filter((id) => typeof id !== "string" || !dikenal.has(id));
      if (asing.length) {
        throw new AdminError(400, `Add-on tidak dikenal: ${asing.join(", ")}.`);
      }
      const bersih = [...new Set(addOn)];
      await ref.update({
        addOn: bersih,
        lastChangedBy: admin.email ?? admin.uid,
        lastChangedAt: new Date().toISOString(),
      });
      return Response.json({ ok: true, addOn: bersih });
    }

    const current = snap.data() as { subscriptionExpiresAt?: string | null };
    const now = new Date();

    let update: {
      subscriptionStatus: SubscriptionStatus;
      subscriptionExpiresAt: string | null;
    };

    if (action === "deactivate") {
      update = { subscriptionStatus: "expired", subscriptionExpiresAt: null };
    } else if (action === "lifetime") {
      update = { subscriptionStatus: "lifetime", subscriptionExpiresAt: null };
    } else if (action === "extend") {
      const n = Number(tahun ?? 1);
      if (!Number.isInteger(n) || n < 1 || n > MAX_TAHUN) {
        throw new AdminError(400, `tahun harus bilangan bulat 1 sampai ${MAX_TAHUN}.`);
      }
      update = {
        subscriptionStatus: "active",
        subscriptionExpiresAt: extendYears(current.subscriptionExpiresAt ?? null, n, now),
      };
    } else {
      // action === "set"
      if (!expiresAt || !POLA_TANGGAL.test(expiresAt)) {
        throw new AdminError(400, "expiresAt harus berformat YYYY-MM-DD.");
      }
      // Akhir hari waktu Indonesia Tengah (UTC+8), supaya tanggal yang dipilih
      // admin masih terhitung aktif sepanjang hari itu.
      const akhir = new Date(`${expiresAt}T23:59:59+08:00`);
      if (Number.isNaN(akhir.getTime())) {
        throw new AdminError(400, "Tanggal tidak valid.");
      }
      if (akhir <= now) {
        throw new AdminError(400, "Tanggal habis harus di masa depan.");
      }
      const batas = new Date(now);
      batas.setFullYear(batas.getFullYear() + MAX_TAHUN);
      if (akhir > batas) {
        throw new AdminError(
          400,
          `Tanggal terlalu jauh. Untuk tanpa batas waktu, pakai "selamanya".`,
        );
      }
      update = {
        subscriptionStatus: "active",
        subscriptionExpiresAt: akhir.toISOString(),
      };
    }

    await ref.update({
      ...update,
      lastChangedBy: admin.email ?? admin.uid,
      lastChangedAt: now.toISOString(),
    });

    return Response.json({ ok: true, uid, ...update });
  } catch (err) {
    return handleAdminError(err);
  }
}
