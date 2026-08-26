/**
 * Nyalakan atau matikan Vercel Deployment Protection untuk project ini.
 *
 * Selama proteksi menyala, hanya anggota tim Vercel yang bisa membuka
 * aplikasi; pengunjung biasa dialihkan ke halaman login Vercel. Ini berguna
 * saat masih dipoles, tapi harus dimatikan agar aplikasi bisa dipakai publik.
 *
 *   npm run protection -- off
 *   npm run protection -- on
 *   npm run protection            # lihat status
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const AUTH = join(homedir(), "Library/Application Support/com.vercel.cli/auth.json");
const PROJECT = join(process.cwd(), ".vercel/project.json");

function baca<T>(path: string, apa: string): T {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    console.error(`Tidak bisa membaca ${apa} di ${path}.`);
    process.exit(1);
  }
}

const { token } = baca<{ token?: string }>(AUTH, "kredensial Vercel CLI");
const { projectId, orgId } = baca<{ projectId: string; orgId: string }>(
  PROJECT,
  "tautan project",
);

if (!token) {
  console.error("Belum login. Jalankan: npx vercel login");
  process.exit(1);
}

const mode = process.argv[2];
if (mode && mode !== "on" && mode !== "off") {
  console.error("Pakai: npm run protection -- on|off");
  process.exit(1);
}

const url = `https://api.vercel.com/v9/projects/${projectId}?teamId=${orgId}`;
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

interface Project {
  name: string;
  ssoProtection: { deploymentType?: string } | null;
  passwordProtection: unknown | null;
}

async function main() {
  if (!mode) {
    const p = (await (await fetch(url, { headers })).json()) as Project;
    console.log(`\nProject   : ${p.name}`);
    console.log(`SSO       : ${p.ssoProtection ? "AKTIF (hanya tim yang bisa buka)" : "mati"}`);
    console.log(`Password  : ${p.passwordProtection ? "aktif" : "mati"}\n`);
    return;
  }

  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      // null mematikan proteksi; "all" melindungi seluruh deployment.
      ssoProtection: mode === "on" ? { deploymentType: "all" } : null,
    }),
  });
  const data = (await res.json()) as Project & { error?: { message?: string } };
  if (!res.ok) {
    console.error("\n✗ Gagal:", data.error?.message ?? JSON.stringify(data, null, 2), "\n");
    process.exit(1);
  }

  console.log(
    mode === "off"
      ? "\n✓ Proteksi dimatikan. Aplikasi bisa diakses siapa saja.\n"
      : "\n✓ Proteksi dinyalakan. Hanya anggota tim Vercel yang bisa membuka.\n",
  );
}

main().catch((err) => {
  console.error("\n✗ Gagal:", err instanceof Error ? err.message : err, "\n");
  process.exit(1);
});
