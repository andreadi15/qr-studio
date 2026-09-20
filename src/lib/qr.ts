import qrcode from 'qrcode-generator';

// Konversi byte eksplisit lewat TextEncoder. Ini tidak bergantung pada
// `qrcode_UTF8.js` bawaan paket (yang tidak selalu ikut pada build default),
// sehingga emoji dan huruf non-Latin tetap ter-encode benar.
type QrLib = { stringToBytes?: (s: string) => number[] };
const lib = qrcode as unknown as QrLib;
lib.stringToBytes = (s: string) => Array.from(new TextEncoder().encode(s));

/**
 * Membuat matriks modul dari teks. Melempar error jika data terlalu panjang;
 * pemanggil menangkapnya dan menampilkan state "terlalu panjang".
 * Koreksi error selalu H (30%) karena ada logo.
 */
export function buildMatrix(text: string): boolean[][] {
  const qr = qrcode(0, 'H'); // tipe 0 = otomatis
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
}
