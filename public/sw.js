/*
 * Service worker Hari Baik.
 *
 * Ada dua alasan berkas ini: Chrome mensyaratkan service worker dengan
 * handler fetch sebelum menawarkan pemasangan, dan aplikasi yang sudah
 * terpasang sebaiknya tidak menampilkan layar kosong saat jaringan mati.
 *
 * Yang sengaja TIDAK dilakukan: menyimpan HTML halaman. Menyimpan HTML adalah
 * sumber paling umum dari "pengguna melihat versi lama berhari-hari", dan
 * seluruh isi aplikasi ini bergantung pada tanggal hari ini, jadi halaman
 * basi justru berbahaya. Navigasi selalu diambil dari jaringan; hanya bila
 * jaringan gagal, halaman luring ditampilkan.
 */

const VERSI = "hb-v1";
const LURING = "/offline.html";
const ASET = [LURING, "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSI).then((cache) => cache.addAll(ASET)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((kunci) =>
        Promise.all(kunci.filter((k) => k !== VERSI).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Hanya GET yang boleh disentuh; POST ke API tidak boleh diulang diam-diam.
  if (req.method !== "GET") return;

  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match(LURING)));
    return;
  }

  // Sisanya lewat apa adanya. Next.js sudah memberi berkas statisnya nama
  // ber-hash dan header cache yang benar, jadi tidak ada yang perlu ditambah.
});
