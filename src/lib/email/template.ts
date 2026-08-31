/**
 * Isi email verifikasi.
 *
 * Diport dari `docs/email/verifikasi.html`, yang selama ini menganggur karena
 * Firebase mengunci kolom Message pada template email verifikasi. Begitu
 * emailnya dikirim sendiri, kuncinya tidak berlaku lagi.
 *
 * Aturan main email berbeda dari web, dan empat hal berikut yang menentukan
 * bentuknya. Semuanya bukan pilihan gaya:
 *
 * - Semua gaya ditulis inline. Gmail membuang blok `<style>` di banyak konteks.
 * - Tata letaknya `<table>`, bukan flex atau grid. Outlook di Windows merender
 *   lewat mesin Word yang tidak mengenal keduanya.
 * - Fontnya Georgia dan Arial, bukan font aplikasi. Source Serif dan Inter
 *   tidak ikut terkirim ke mana pun.
 * - Tidak ada gambar sama sekali. Kebanyakan klien email memblokirnya sampai
 *   penerima menekan "tampilkan gambar", dan logo yang tidak muncul lebih
 *   buruk daripada tidak ada logo.
 *
 * Versi teks polosnya bukan pelengkap: penyaring spam menilai email yang hanya
 * berisi HTML lebih curiga daripada yang membawa keduanya.
 */

const KANVAS = "#f2f0ec";
const KARTU = "#fbfaf8";
const GARIS = "#e4e0da";
const TINTA = "#2f2c28";
const REDUP = "#6b6660";
const AKSEN = "#a8ddc4";

/** Cegah nilai yang datang dari luar menutup atribut atau menyisipkan tag. */
function aman(teks: string): string {
  return teks
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface IsiEmail {
  subjek: string;
  html: string;
  teks: string;
}

export function emailVerifikasi({
  tautan,
  email,
}: {
  tautan: string;
  email: string;
}): IsiEmail {
  const t = aman(tautan);
  const e = aman(email);

  return {
    subjek: "Konfirmasi email kamu di Hari Baik",
    teks: [
      "Satu langkah lagi.",
      "",
      `Terima kasih sudah mendaftar di Hari Baik. Buka tautan ini untuk memastikan ${email} benar milikmu:`,
      "",
      tautan,
      "",
      "Setelah itu kalender siklus personalmu langsung terbuka, dan masa coba gratismu dimulai.",
      "",
      "Kalau kamu tidak merasa mendaftar, abaikan saja email ini.",
      "",
      "Hari Baik, dikembangkan Seawise Studio, dioperasikan Mayaloka Digital",
      "haribaik.seawise.id",
    ].join("\n"),
    html: `<body style="margin:0;padding:0;background-color:${KANVAS};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${KANVAS};margin:0;padding:0;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">

        <tr>
          <td style="padding-bottom:24px;">
            <span style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:bold;font-size:22px;color:${TINTA};">Hari Baik</span>
          </td>
        </tr>

        <tr>
          <td style="background-color:${KARTU};border:1px solid ${GARIS};border-radius:22px;padding:40px 32px;">

            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:0.09em;text-transform:uppercase;color:${REDUP};">
              Satu langkah lagi
            </p>

            <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;line-height:1.25;color:${TINTA};">
              Konfirmasi alamat emailmu
            </h1>

            <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${REDUP};">
              Terima kasih sudah mendaftar di Hari Baik. Tekan tombol di bawah untuk
              memastikan <span style="color:${TINTA};font-weight:bold;">${e}</span> benar milikmu.
            </p>

            <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${REDUP};">
              Setelah itu kalender siklus personalmu langsung terbuka, dan masa coba
              gratismu dimulai.
            </p>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td align="center" style="border-radius:999px;background-color:${AKSEN};">
                  <a href="${t}" style="display:block;padding:15px 28px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:${TINTA};text-decoration:none;border-radius:999px;">
                    Konfirmasi email
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:26px 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${REDUP};">
              Tombolnya tidak bisa ditekan? Salin tautan ini ke peramban:
            </p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;word-break:break-all;">
              <a href="${t}" style="color:${REDUP};">${t}</a>
            </p>

          </td>
        </tr>

        <tr>
          <td style="padding:22px 8px 0;">
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${REDUP};">
              Kalau kamu tidak merasa mendaftar, abaikan saja email ini.
            </p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${REDUP};">
              Hari Baik, dikembangkan Seawise Studio, dioperasikan Mayaloka Digital<br />haribaik.seawise.id
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>`,
  };
}
