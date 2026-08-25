# Arsitektur Aplikasi "Hari Baik"
Kalender personal yang menampilkan hari baik (kombinasi Wariga Belog & kalender Bali) di atas tampilan kalender Masehi.

## 1. Ringkasan
| | |
|---|---|
| Tipe | Web app, subscription-based |
| Frontend | Next.js (App Router) |
| Auth + Database | Firebase (Auth, Firestore) |
| Hosting | Vercel |
| Model bisnis | Langganan, approval manual oleh admin (bukan payment gateway otomatis) |

## 2. Diagram Arsitektur (garis besar)
```
┌─────────────────────────┐
│        Browser          │
│  (Next.js App Router)   │
└───────────┬──────────────┘
            │
   ┌────────┴─────────┐
   │                   │
┌──▼───────┐   ┌───────▼────────┐
│ Firebase │   │  Route Handler /│
│   Auth   │   │  Server Action  │
└──────────┘   │ (cek role admin)│
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │   Firestore    │
                │ users/         │
                │ users/{uid}/   │
                │   riwayat/     │
                └────────────────┘

Deploy: Vercel (Next.js) — Firebase project terpisah (Auth + Firestore)
```

## 3. Tech Stack
- **Next.js** (App Router) — UI, routing, server actions/API routes
- **Firebase Auth** — register, login, email verification (Spark/free tier)
- **Firestore** — data user, preferensi, riwayat, status langganan
- **Firebase Admin SDK** — dipakai di server (API routes) untuk custom claims & operasi admin
- **Vercel** — hosting & deployment

## 4. Modul Perhitungan Wariga (`lib/wariga/`)
Engine kalkulasi kalender Bali (Pawukon), murni fungsi matematis — tidak butuh database.

| File | Isi |
|---|---|
| `types.ts` | Tipe data `PawukonInfo`, `DewasaFlag` |
| `constants.ts` | Nama & urip Wuku (30), Saptawara (7), Pancawara (5), Triwara (3), Sadwara (6) + epoch referensi (5 Juli 2020) |
| `pawukon.ts` | `getPawukon(date)` → hitung Wuku/pasaran Bali untuk tanggal Masehi manapun |
| `dewasa.ts` | Deteksi hari khusus: Kajeng Kliwon, Tumpek, Anggara Kasih, Buda Kliwon |

> Status: sudah dibuat & diuji terhadap tanggal referensi. Rule "dewasa ayu" detail (sesuai sumber Wariga Belog spesifik) masih bisa ditambah belakangan.

## 5. Data Model (Firestore)
```
users/{uid}
  ├─ email
  ├─ nama
  ├─ tanggalLahir (opsional, buat fitur weton personal)
  ├─ role: "user" | "admin"
  ├─ subscriptionStatus: "pending" | "active" | "expired"
  ├─ subscriptionExpiresAt
  ├─ createdAt
  └─ riwayat/{id}            (sub-collection)
       ├─ tanggalDicek
       ├─ hasilPawukon
       └─ catatan
```

## 6. Alur Autentikasi
1. User register (email + password) → Firebase Auth
2. Trigger `sendEmailVerification()`
3. Dokumen `users/{uid}` dibuat di Firestore dengan `subscriptionStatus: "pending"`
4. User klik link verifikasi di email → `emailVerified: true`
5. User bisa login & lihat kalender, tapi fitur premium (kalau ada) terkunci sampai `subscriptionStatus: "active"`

## 7. Alur Langganan & Admin
1. User daftar/upgrade → status `pending`, biasanya disertai bukti transfer manual (upload/kirim terpisah)
2. Admin login ke `/admin` (route khusus, ter-guard)
3. Admin lihat daftar user dengan status `pending` → klik **Approve** → `subscriptionStatus` jadi `active` + set `subscriptionExpiresAt`
4. Admin juga bisa **Nonaktifkan/Perpanjang** langganan user kapan saja

**Proteksi admin:**
- Role admin ditandai via **Firebase Custom Claims** (`admin: true`), di-set lewat Firebase Admin SDK di server — bukan field yang bisa diubah dari client
- Halaman `/admin` dan API route approve/update **selalu cek claim admin di server** sebelum eksekusi
- Firestore Security Rules: user biasa hanya boleh baca datanya sendiri, tidak boleh menulis `role` atau `subscriptionStatus` sendiri; hanya request dengan claim `admin: true` yang boleh mengubahnya

## 8. Struktur Folder
```
hari-baik-app/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── verify-email/page.tsx
│   ├── (dashboard)/
│   │   ├── kalender/page.tsx
│   │   ├── riwayat/page.tsx
│   │   └── profil/page.tsx
│   ├── admin/
│   │   ├── page.tsx                 # daftar user & status langganan
│   │   └── layout.tsx               # guard: cek custom claim admin
│   └── api/
│       └── admin/
│           └── approve/route.ts     # approve/update langganan (server-only)
├── lib/
│   ├── firebase.ts                  # init firebase client
│   ├── firebase-admin.ts            # init firebase admin (server only)
│   ├── auth.ts
│   └── wariga/
│       ├── types.ts
│       ├── constants.ts
│       ├── pawukon.ts
│       └── dewasa.ts
├── components/
│   ├── BaliCalendarView.tsx
│   ├── AuthForm.tsx
│   └── admin/
│       └── UserSubscriptionTable.tsx
└── types/
    └── index.ts
```

## 9. Status Saat Ini
- [x] Rencana stack (Next.js + Firebase + Vercel)
- [x] Modul perhitungan Pawukon/Wariga (`lib/wariga/`)
- [x] Komponen kalender (`BaliCalendarView.tsx`)
- [ ] Setup project Firebase (Auth + Firestore + custom claims)
- [ ] Alur register/login/verifikasi email
- [ ] Halaman admin + API approve langganan
- [ ] Security rules Firestore
- [ ] Deploy ke Vercel
