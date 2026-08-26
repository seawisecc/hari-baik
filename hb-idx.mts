import { config } from "dotenv";
import { GoogleAuth } from "google-auth-library";
config({ path: ".env.local" });
const auth = new GoogleAuth({
  credentials: {
    client_email: process.env.FIREBASE_CLIENT_EMAIL!,
    private_key: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/datastore"],
});
const c = await auth.getClient();
const { token } = await c.getAccessToken();
const url = `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/collectionGroups/users/indexes`;
for (let i = 0; i < 40; i++) {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const d = await r.json();
  const idx = d.indexes?.[0];
  if (!idx) { console.log("belum terdaftar"); }
  else {
    console.log(`${new Date().toLocaleTimeString()} state=${idx.state}`);
    if (idx.state === "READY") { console.log("SIAP"); break; }
  }
  await new Promise((res) => setTimeout(res, 15000));
}
