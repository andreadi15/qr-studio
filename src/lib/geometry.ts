export type Radii = [number, number, number, number]; // tl, tr, br, bl

export function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: Radii,
) {
  const [tl, tr, br, bl] = r;
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  tr ? ctx.arcTo(x + w, y, x + w, y + tr, tr) : ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h - br);
  br ? ctx.arcTo(x + w, y + h, x + w - br, y + h, br) : ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + bl, y + h);
  bl ? ctx.arcTo(x, y + h, x, y + h - bl, bl) : ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + tl);
  tl ? ctx.arcTo(x, y, x + tl, y, tl) : ctx.lineTo(x, y);
  ctx.closePath();
}

/** Bentuk persegi ukuran `s`: lingkaran atau persegi dengan radius seragam. */
export function shapePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  circle: boolean,
  radius: number,
) {
  if (circle) {
    ctx.moveTo(x + s, y + s / 2); // moveTo mencegah garis penghubung antar subpath
    ctx.arc(x + s / 2, y + s / 2, s / 2, 0, Math.PI * 2);
  } else {
    const r = Math.min(radius, s / 2);
    roundedRectPath(ctx, x, y, s, s, [r, r, r, r]);
  }
}

/** Modul (r,c) bagian dari salah satu dari 3 pola pojok 7×7? */
export function isFinder(r: number, c: number, n: number): boolean {
  return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
}

/** Batas ukuran logo supaya tidak menyentuh pojok. n = jumlah modul per sisi. */
export function effectiveLogoPercent(n: number, requested: number): number {
  const maxPercent = Math.floor((100 * (n - 16)) / n); // sisakan pola pojok + pemisah
  return Math.max(10, Math.min(requested, maxPercent));
}
