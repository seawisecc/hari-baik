#!/usr/bin/env bash
# Kirim variabel Firebase dari .env.local ke Vercel.
#
# Nilainya dialirkan lewat stdin, tidak pernah muncul sebagai argumen perintah
# ataupun tercetak ke layar; argumen proses bisa terbaca pengguna lain di mesin
# yang sama.
set -euo pipefail

KUNCI=(
  NEXT_PUBLIC_FIREBASE_API_KEY
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  NEXT_PUBLIC_FIREBASE_PROJECT_ID
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  NEXT_PUBLIC_FIREBASE_APP_ID
  FIREBASE_PROJECT_ID
  FIREBASE_CLIENT_EMAIL
  FIREBASE_PRIVATE_KEY
)

for lingkungan in production preview development; do
  echo "── $lingkungan ──"
  for k in "${KUNCI[@]}"; do
    # Ambil nilai apa adanya dari .env.local, buang tanda kutip pembungkus.
    nilai=$(grep "^${k}=" .env.local | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//')
    if [ -z "$nilai" ]; then
      echo "  ! $k kosong, dilewati"
      continue
    fi
    # Timpa bila sudah ada, supaya script aman dijalankan ulang.
    npx vercel env rm "$k" "$lingkungan" --yes >/dev/null 2>&1 || true
    printf '%s' "$nilai" | npx vercel env add "$k" "$lingkungan" >/dev/null 2>&1
    echo "  ✓ $k"
  done
done

echo
echo "Selesai. Periksa dengan: npx vercel env ls"
