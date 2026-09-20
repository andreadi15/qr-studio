import { describe, expect, it } from 'vitest';
import { effectiveLogoPercent, isFinder } from '../geometry';

describe('effectiveLogoPercent', () => {
  it('memangkas permintaan agar tidak menyentuh pojok', () => {
    expect(effectiveLogoPercent(21, 30)).toBe(23);
    expect(effectiveLogoPercent(29, 30)).toBe(30);
  });

  it('tidak pernah turun di bawah 10 persen', () => {
    expect(effectiveLogoPercent(21, 5)).toBe(10);
    expect(effectiveLogoPercent(45, 1)).toBe(10);
  });

  it('meneruskan permintaan yang masih dalam batas', () => {
    expect(effectiveLogoPercent(45, 22)).toBe(22);
  });
});

describe('isFinder', () => {
  it('mengenali tiga pola pojok pada matriks 21 modul', () => {
    const n = 21;
    expect(isFinder(0, 0, n)).toBe(true);
    expect(isFinder(6, 6, n)).toBe(true);
    expect(isFinder(0, 20, n)).toBe(true);
    expect(isFinder(20, 0, n)).toBe(true);
  });

  it('menolak modul di luar pola pojok', () => {
    const n = 21;
    expect(isFinder(7, 7, n)).toBe(false);
    expect(isFinder(10, 10, n)).toBe(false);
    expect(isFinder(0, 7, n)).toBe(false);
    expect(isFinder(7, 0, n)).toBe(false);
  });
});
