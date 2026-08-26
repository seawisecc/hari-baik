/**
 * Buat composite index Firestore dari firestore.indexes.json.
 *
 * Query yang menggabungkan filter dan urutan pada field berbeda butuh index
 * yang dibuat lebih dulu; tanpa itu query gagal dengan FAILED_PRECONDITION.
 *
 *   npm run deploy-indexes
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

interface IndexField {
  fieldPath: string;
  order: "ASCENDING" | "DESCENDING";
}
interface IndexSpec {
  collectionGroup: string;
  queryScope: string;
  fields: IndexField[];
}

const spec = JSON.parse(readFileSync("firestore.indexes.json", "utf8")) as {
  indexes: IndexSpec[];
};

async function main() {
  const auth = new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/datastore"],
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  if (!token) throw new Error("Gagal mendapatkan access token.");

  const dasar =
    `https://firestore.googleapis.com/v1/projects/${projectId}` +
    `/databases/(default)/collectionGroups`;

  for (const idx of spec.indexes) {
    const url = `${dasar}/${idx.collectionGroup}/indexes`;
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        queryScope: idx.queryScope,
        fields: idx.fields,
      }),
    });
    const data = await res.json();

    const label = `${idx.collectionGroup}: ${idx.fields.map((f) => f.fieldPath).join(" + ")}`;

    if (res.ok) {
      console.log(`  dibuat   ${label}`);
    } else if (
      data?.error?.code === 409 ||
      /already exists/i.test(data?.error?.message ?? "")
    ) {
      // Index yang sudah ada bukan kegagalan: script ini harus aman diulang.
      console.log(`  ada      ${label}`);
    } else {
      console.error(`  GAGAL    ${label}`);
      console.error(JSON.stringify(data, null, 2));
      process.exitCode = 1;
    }
  }

  console.log(
    "\nIndex dibangun di latar belakang. Untuk koleksi kecil biasanya" +
      "\nselesai dalam hitungan detik.\n",
  );
}

main().catch((err) => {
  console.error("\n✗ Gagal:", err instanceof Error ? err.message : err, "\n");
  process.exit(1);
});
