import "server-only";

import type { NextRequest } from "next/server";
import { adminAuth } from "./admin";

export interface AdminCaller {
  uid: string;
  email: string | undefined;
}

/**
 * Verifikasi bahwa pemanggil benar-benar admin.
 *
 * Sumber kebenarannya adalah custom claim `admin: true` pada ID token,
 * bukan field di Firestore, yang bisa dibaca/ditulis lewat jalur lain.
 * Token diverifikasi ulang di server tiap permintaan; tidak ada yang
 * dipercaya dari body request.
 */
export async function requireAdmin(req: NextRequest): Promise<AdminCaller> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new AdminError(401, "Token tidak ada.");

  let decoded;
  try {
    // checkRevoked: token yang sudah dicabut (mis. admin di-logout paksa)
    // langsung ditolak, tidak menunggu masa berlakunya habis.
    decoded = await adminAuth().verifyIdToken(token, true);
  } catch {
    throw new AdminError(401, "Token tidak valid atau sudah kedaluwarsa.");
  }

  if (decoded.admin !== true) throw new AdminError(403, "Butuh hak admin.");

  return { uid: decoded.uid, email: decoded.email };
}

export class AdminError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Bungkus handler supaya AdminError jadi response yang rapi. */
export function handleAdminError(err: unknown): Response {
  if (err instanceof AdminError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  console.error("[admin api]", err);
  return Response.json({ error: "Terjadi kesalahan di server." }, { status: 500 });
}
