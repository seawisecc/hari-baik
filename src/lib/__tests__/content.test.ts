/** Cek integritas data konten yang diport dari aplikasi lama. */
import { getPancasuda, getPangarasan } from "../content/kepribadian";
import { translate } from "../content/i18n";
import { hitungMaknaNama } from "../content/nama";
import { petaPerjalananHidup } from "../content/nasib";
import { getPanduan } from "../content/panduan";
import { hitungPetemon } from "../content/petemon";
import { WETON } from "../content/weton";
import { PANCAWARA, SAPTAWARA, uripHari } from "../wariga";

let fail = 0;
const eq = (label: string, expected: unknown, actual: unknown) => {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    fail++;
    console.log("FAIL:", label, "| expected", expected, "| got", actual);
  }
};

// Petemon: nilai acuan dari self-test aplikasi lama.
const p = hitungPetemon("1993-06-30", "1997-09-07");
eq("petemon orang1", 23, p.orang1.totalUrip);
eq("petemon orang2", 21, p.orang2.totalUrip);
eq("petemon total", 44, p.total);

// Tabel weton harus lengkap dan konsisten dengan engine.
eq("weton 35 entri", 35, Object.keys(WETON).length);
for (const [key, w] of Object.entries(WETON)) {
  const [s, pw] = key.split("-");
  const su = SAPTAWARA.find((x) => x.name === s)?.urip;
  const pu = PANCAWARA.find((x) => x.name === pw)?.urip;
  if (su === undefined || pu === undefined) {
    fail++;
    console.log("FAIL: nama wara tak dikenal:", key);
    continue;
  }
  if (su + pu !== w.urip) {
    fail++;
    console.log(`FAIL: urip ${key} tabel=${w.urip} engine=${su + pu}`);
  }
  if (!getPangarasan(w.pangarasan)) {
    fail++;
    console.log("FAIL: pangarasan tanpa profil:", key, w.pangarasan);
  }
  if (!getPancasuda(w.pancasuda)) {
    fail++;
    console.log("FAIL: pancasuda tanpa profil:", key, w.pancasuda);
  }
}

// Aksara: digraf dibaca satu, vokal diabaikan.
const n = hitungMaknaNama("Nyoman");
eq(
  "digraf ny satu aksara",
  true,
  n.rincian.some((r) => r.aksara === "Nya"),
);
eq(
  "vokal diabaikan",
  false,
  n.rincian.some((r) => "aiueo".includes(r.huruf)),
);

// Perjalanan hidup harus aman untuk semua urip yang mungkin (7–18) dan di luarnya.
for (let u = 7; u <= 18; u++) {
  const peta = petaPerjalananHidup(u);
  if (peta.length !== 18) {
    fail++;
    console.log("FAIL: jumlah periode urip", u, peta.length);
  }
}
eq(
  "urip di luar rentang aman",
  true,
  petaPerjalananHidup(99).every((x) => x.value === null),
);

// Urip lahir yang bisa muncul dari tanggal nyata selalu di 7–18.
const urip = uripHari("1993-06-30");
eq("urip 1993-06-30", 15, urip);

eq("panduan id", true, getPanduan("id", "GURU").supported.length > 0);
eq("panduan en", true, getPanduan("en", "PATI").affirmation.length > 0);
eq("i18n id", "Hari Mengalir", translate("id", "day.guru"));
eq("i18n en", "Flow Day", translate("en", "day.guru"));

console.log(fail === 0 ? "✓ konten: semua lolos" : `✗ konten: ${fail} gagal`);
if (fail) process.exit(1);
