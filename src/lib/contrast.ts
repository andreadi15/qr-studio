import type { Settings } from './types';

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastNote(s: Settings): string {
  const bg = s.transparent ? '#FFFFFF' : s.bg;
  const fgs = [s.fg, ...(s.gradient ? [s.fg2] : []), ...(s.eyeSame ? [] : [s.eye])];
  const lb = luminance(bg);
  let lighter = false;
  let min = Infinity;
  for (const c of fgs) {
    const lc = luminance(c);
    if (lc > lb) lighter = true;
    min = Math.min(min, (Math.max(lc, lb) + 0.05) / (Math.min(lc, lb) + 0.05));
  }
  const out: string[] = [];
  if (lighter) {
    out.push('Warna QR lebih terang dari latar, dan banyak pemindai gagal membaca QR terbalik.');
  } else if (min < 3) {
    out.push('Kontras warna rendah, QR bisa sulit dipindai. Pilih warna QR yang lebih gelap.');
  }
  if (s.transparent) out.push('Latar transparan: tempel di permukaan terang agar terbaca.');
  return out.join(' ');
}
