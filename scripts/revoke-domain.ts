/**
 * Cabut domain dari Authorized domains Firebase Auth.
 *
 *   npm run revoke-domain -- domain-yang-salah.vercel.app
 */
import { config } from "dotenv";
import { GoogleAuth } from "google-auth-library";

config({ path: ".env.local" });

const projectId = process.env.FIREBASE_PROJECT_ID!;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!;
const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n");

const buang = process.argv.slice(2).filter(Boolean);
if (buang.length === 0) {
  console.error("Pakai: npm run revoke-domain -- domain1 [domain2 ...]");
  process.exit(1);
}

async function main() {
  const auth = new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const url = `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`;

  const cfg = (await (await fetch(url, { headers })).json()) as {
    authorizedDomains?: string[];
  };
  const sekarang = cfg.authorizedDomains ?? [];
  const sisa = sekarang.filter((d) => !buang.includes(d));

  if (sisa.length === sekarang.length) {
    console.log("\nTidak ada yang perlu dicabut.\n");
    return;
  }

  const res = await fetch(`${url}?updateMask=authorizedDomains`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ authorizedDomains: sisa }),
  });
  if (!res.ok) throw new Error(JSON.stringify(await res.json(), null, 2));

  console.log("\nDicabut:");
  sekarang.filter((d) => buang.includes(d)).forEach((d) => console.log(`  - ${d}`));
  console.log("\nSisa domain yang diizinkan:");
  sisa.forEach((d) => console.log(`  ${d}`));
  console.log("");
}

main().catch((err) => {
  console.error("\n✗ Gagal:", err instanceof Error ? err.message : err, "\n");
  process.exit(1);
});
