# Hari Baik

Kalender siklus personal — memadukan Wariga & kalender Bali di atas kalender
Masehi. Pengembangan ulang dari app sebelumnya (base44).

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Firebase (Auth + Firestore)
· Vercel.

## Jalankan

```bash
npm install
npm run dev
```

| Rute | Isi |
|---|---|
| `/` | Beranda + wariga hari ini |
| `/styleguide` | Sistem desain, pemilih tema |
| `/debug-wariga` | Self-test engine (41 tes) |

## Struktur

```
src/
├── app/                  # rute App Router
├── components/ui/        # primitif desain (Button, Card, Input, Chip, Alert)
├── lib/
│   ├── wariga/           # engine kalender Bali — murni fungsi, tanpa DB
│   │   ├── constants.ts  # nama wara, urip, epoch
│   │   ├── pawukon.ts    # semua siklus wara + sasih + fase bulan
│   │   ├── dewasa.ts     # hari raya + kategori siklus personal
│   │   ├── holidays.ts   # tabel libur (perlu update tiap tahun)
│   │   └── selftest.ts   # 41 tes terhadap tanggal acuan
│   └── theme/            # provider tema
└── types/
docs/
├── arsitektur.md            # dokumen arsitektur awal
└── inventaris-app-lama.md   # hasil pembacaan app lama + sisa pekerjaan
```

## Tema

Dua tema aksen di atas dasar netral off-white yang sama:

- **Mint** (default) — hijau mint, sesuai styleguide referensi
- **Senja** — jingga hangat

Dipilih lewat `[data-theme]` di `<html>`, disimpan di `localStorage`, dan
dipasang sebelum paint pertama supaya tidak berkedip. Semua warna adalah
token CSS di `src/app/globals.css` — komponen tidak pernah memakai nilai hex
langsung, jadi menambah tema ketiga cukup dengan satu blok `:root[data-theme=...]`.

## Status

- [x] Engine Wariga lengkap — 41/41 tes lolos
- [x] Sistem desain + 2 tema
- [ ] Konten (i18n, panduan harian, pangarasan, pancasuda, aksara nama)
- [ ] Firebase Auth + Firestore
- [ ] Halaman kalender & dashboard
- [ ] Fitur Pro (nama, kecocokan, perjalanan hidup, kepribadian)
- [ ] Admin + approval langganan
- [ ] Deploy Vercel

Rincian sisa pekerjaan ada di `docs/inventaris-app-lama.md`.
