/**
 * Daftarkan domain produksi ke Authorized domains Firebase Auth.
 *
 * Tanpa ini, Firebase menolak login dari domain manapun selain localhost
 * dengan error auth/unauthorized-domain, dan gejalanya baru terlihat setelah
 * aplikasi live.
 *
 *   npm run authorize-domains -- hari-baik.vercel.app app.contoh.com
 */
import { config } from "dotenv";
import { GoogleAuth } from "google-auth-library";

config({ path: ".env.local" });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Kredensial belum lengkap di .env.local.");
  process.exit(1);
}

const tambahan = process.argv.slice(2).filter(Boolean);
if (tambahan.length === 0) {
  console.error("Pakai: npm run authorize-domains -- domain1 [domain2 ...]");
  process.exit(1);
}

async function main() {
  const auth = new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  if (!token) throw new Error("Gagal mendapatkan access token.");

  const url = `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, { headers });
  const cfg = (await res.json()) as { authorizedDomains?: string[]; error?: unknown };
  if (!res.ok) throw new Error(JSON.stringify(cfg, null, 2));

  const sekarang = cfg.authorizedDomains ?? [];
  // Gabungkan, jangan timpa: localhost dan domain bawaan Firebase harus tetap ada.
  const gabungan = Array.from(new Set([...sekarang, ...tambahan]));

  const baru = gabungan.filter((d) => !sekarang.includes(d));
  if (baru.length === 0) {
    console.log("\nSemua domain sudah terdaftar:");
    sekarang.forEach((d) => console.log(`  ${d}`));
    console.log("");
    return;
  }

  const patch = await fetch(`${url}?updateMask=authorizedDomains`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ authorizedDomains: gabungan }),
  });
  const hasil = await patch.json();
  if (!patch.ok) throw new Error(JSON.stringify(hasil, null, 2));

  console.log("\nDitambahkan:");
  baru.forEach((d) => console.log(`  + ${d}`));
  console.log("\nSeluruh domain yang diizinkan:");
  gabungan.forEach((d) => console.log(`  ${d}`));
  console.log("");
}

main().catch((err) => {
  console.error("\n✗ Gagal:", err instanceof Error ? err.message : err, "\n");
  process.exit(1);
});
