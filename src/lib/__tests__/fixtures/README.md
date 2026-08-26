# hari210.json

Tabel 210 hari siklus pawukon, diekstrak dari berkas Excel milik pemilik
aplikasi, `Wariga - Bali's Calendar.xlsx`, lembar `tabel` rentang `A3:S212`.

`acuan` adalah tanggal Masehi untuk hari ke-1 siklus, diambil dari sel `D1` di
lembar yang sama. Semua nilai wewaran 1-based, seperti di sumbernya.

Dipakai `wariga.test.ts` untuk memeriksa mesin perhitungan terhadap seluruh
210 hari sekaligus, bukan hanya beberapa tanggal contoh. Pemeriksaan ini
menemukan tiga siklus yang salah selama ini: caturwara, astawara, dan
sangawara, yang dihitung sebagai modulo biasa padahal ketiganya tidak membagi
habis 210 dan punya aturan tahanan sendiri.

Jangan diubah dengan tangan. Kalau sumbernya diperbarui, ekstrak ulang.
