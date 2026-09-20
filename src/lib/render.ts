import type { RenderInput } from './types';
import { roundedRectPath, shapePath, isFinder, effectiveLogoPercent } from './geometry';

const TAU = Math.PI * 2;

export function renderQr(
  canvas: HTMLCanvasElement,
  px: number,
  { matrix, settings: s, logo }: RenderInput,
) {
  const n = matrix.length;
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, px, px);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (!s.transparent) {
    ctx.fillStyle = s.bg;
    ctx.fillRect(0, 0, px, px);
  }

  const cell = px / (n + 2 * s.margin);
  const o = s.margin * cell;

  let main: string | CanvasGradient = s.fg;
  if (s.gradient) {
    const g = ctx.createLinearGradient(0, 0, px, px);
    g.addColorStop(0, s.fg);
    g.addColorStop(1, s.fg2);
    main = g;
  }
  const eyeFill = s.eyeSame ? main : s.eye;

  // kotak logo
  let box: { x: number; y: number; w: number } | null = null;
  if (logo) {
    const side = (n * cell * effectiveLogoPercent(n, s.logoSize)) / 100;
    box = { x: px / 2 - side / 2, y: px / 2 - side / 2, w: side };
  }
  const pad = cell * 0.5;
  const skipped = (r: number, c: number) => {
    if (!box) return false;
    const x = o + c * cell;
    const y = o + r * cell;
    return (
      x + cell > box.x - pad &&
      x < box.x + box.w + pad &&
      y + cell > box.y - pad &&
      y < box.y + box.w + pad
    );
  };
  const dark = (r: number, c: number) =>
    r >= 0 && c >= 0 && r < n && c < n && !isFinder(r, c, n) && matrix[r][c] && !skipped(r, c);

  // 1) titik data
  ctx.fillStyle = main;
  ctx.beginPath();
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!dark(r, c)) continue;
      const x = o + c * cell;
      const y = o + r * cell;
      if (s.module === 'square') {
        ctx.rect(x, y, cell, cell);
      } else if (s.module === 'dots') {
        const rad = cell * 0.45;
        ctx.moveTo(x + cell / 2 + rad, y + cell / 2);
        ctx.arc(x + cell / 2, y + cell / 2, rad, 0, TAU);
      } else {
        const R = cell * 0.45;
        const u = dark(r - 1, c);
        const d = dark(r + 1, c);
        const l = dark(r, c - 1);
        const rt = dark(r, c + 1);
        roundedRectPath(ctx, x, y, cell, cell, [
          !u && !l ? R : 0,
          !u && !rt ? R : 0,
          !d && !rt ? R : 0,
          !d && !l ? R : 0,
        ]);
      }
    }
  }
  ctx.fill();

  // 2) pojok
  const circ = s.eyeShape === 'circle';
  const k = s.eyeShape === 'square' ? 0 : 1;
  const eyes: [number, number][] = [
    [0, 0],
    [n - 7, 0],
    [0, n - 7],
  ];
  for (const [c, r] of eyes) {
    const x = o + c * cell;
    const y = o + r * cell;
    ctx.fillStyle = eyeFill;
    ctx.beginPath();
    shapePath(ctx, x, y, 7 * cell, circ, k * 2.2 * cell);
    shapePath(ctx, x + cell, y + cell, 5 * cell, circ, k * 1.3 * cell);
    ctx.fill('evenodd');
    ctx.beginPath();
    shapePath(ctx, x + 2 * cell, y + 2 * cell, 3 * cell, circ, k * 1.0 * cell);
    ctx.fill();
  }

  // 3) logo
  if (box && logo) {
    const iw = logo.naturalWidth || logo.width || 300;
    const ih = logo.naturalHeight || logo.height || 300;
    const side = box.w;
    const isCirc = s.logoShape === 'circle';
    const lr =
      s.logoShape === 'rounded' ? side * 0.22 : s.logoShape === 'original' ? side * 0.12 : 0;

    if (s.logoPlate) {
      const pp = cell * 0.4;
      ctx.fillStyle = s.transparent ? '#FFFFFF' : s.bg;
      ctx.beginPath();
      shapePath(ctx, box.x - pp, box.y - pp, side + 2 * pp, isCirc, lr + pp);
      ctx.fill();
    }
    ctx.save();
    ctx.beginPath();
    if (s.logoShape === 'original') ctx.rect(box.x, box.y, side, side);
    else shapePath(ctx, box.x, box.y, side, isCirc, lr);
    ctx.clip();
    const sc =
      s.logoShape === 'original' ? Math.min(side / iw, side / ih) : Math.max(side / iw, side / ih);
    const dw = iw * sc;
    const dh = ih * sc;
    ctx.drawImage(logo, box.x + (side - dw) / 2, box.y + (side - dh) / 2, dw, dh);
    ctx.restore();
  }
}
