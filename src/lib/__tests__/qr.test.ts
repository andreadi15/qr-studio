import { describe, expect, it } from 'vitest';
import { buildMatrix } from '../qr';

describe('buildMatrix', () => {
  it('menghasilkan matriks persegi', () => {
    const m = buildMatrix('https://contoh.com');
    expect(m.length).toBeGreaterThan(0);
    expect(m.every((row) => row.length === m.length)).toBe(true);
  });

  it('berukuran 21 + 4×(versi−1)', () => {
    const n = buildMatrix('https://contoh.com').length;
    expect((n - 21) % 4).toBe(0);
  });

  it('melempar error untuk data yang terlalu panjang', () => {
    expect(() => buildMatrix('a'.repeat(5000))).toThrow();
  });

  it('menerima karakter non-ASCII lewat encoding UTF-8', () => {
    expect(() => buildMatrix('café')).not.toThrow();
    expect(() => buildMatrix('🎉')).not.toThrow();
    expect(() => buildMatrix('日本語')).not.toThrow();
  });

  it('menghasilkan matriks lebih besar untuk data lebih panjang', () => {
    const small = buildMatrix('a').length;
    const big = buildMatrix('a'.repeat(400)).length;
    expect(big).toBeGreaterThan(small);
  });
});
