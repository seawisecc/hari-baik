/**
 * Terapkan firestore.rules ke project lewat Firebase Rules API.
 *
 * Dipakai sebagai ganti `firebase deploy` karena service account Admin SDK
 * tidak punya izin `serviceusage.services.get` yang diminta CLI sebelum
 * menerapkan apa pun. API Rules sendiri bisa diakses dengan kredensial ini.
 *
 *   npm run deploy-rules
 */
import { readFileSync } from "node:fs";
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

const BERKAS = "firestore.rules";
const isi = readFileSync(BERKAS, "utf8");

async function main() {
  const auth = new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/firebase"],
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  if (!token) throw new Error("Gagal mendapatkan access token.");

  const panggil = async (url: string, method: string, body?: unknown) => {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`${method} ${url}\n${JSON.stringify(data, null, 2)}`);
    }
    return data;
  };

  const dasar = `https://firebaserules.googleapis.com/v1/projects/${projectId}`;

  // Ruleset dibuat dulu, baru dirilis. Ruleset yang belum dirilis tidak
  // berpengaruh apa-apa, jadi kalau langkah kedua gagal tidak ada yang rusak.
  const ruleset = (await panggil(`${dasar}/rulesets`, "POST", {
    source: { files: [{ name: BERKAS, content: isi }] },
  })) as { name: string };

  const namaRuleset = ruleset.name.split("/").pop();
  console.log(`  ruleset dibuat: ${namaRuleset}`);

  // UpdateRelease membungkus resource-nya dalam field `release`,
  // dan updateMask ikut di body, bukan sebagai query string.
  await panggil(`${dasar}/releases/cloud.firestore`, "PATCH", {
    release: {
      name: `projects/${projectId}/releases/cloud.firestore`,
      rulesetName: ruleset.name,
    },
    updateMask: "rulesetName",
  });

  console.log(`\n✓ ${BERKAS} (${isi.split("\n").length} baris) diterapkan ke ${projectId}\n`);
}

main().catch((err) => {
  console.error("\n✗ Gagal menerapkan rules:\n");
  console.error(err instanceof Error ? err.message : err);
  console.error("");
  process.exit(1);
});
