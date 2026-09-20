/**
 * Menormalkan input pengguna menjadi nilai yang dipakai QR.
 * Domain tanpa skema diberi `https://`; teks biasa dan skema lain dibiarkan.
 */
export function normalizeInput(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  if (/^[a-z][a-z0-9+.\-]*:/i.test(t)) return t; // sudah ada skema (http:, mailto:, tel:, ...)
  if (/\s/.test(t)) return t; // ada spasi → teks biasa
  if (/^[^\s/]+\.[^\s/]{2,}/.test(t)) return 'https://' + t; // tampak seperti domain
  return t;
}
