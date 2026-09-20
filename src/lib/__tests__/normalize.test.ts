import { describe, expect, it } from 'vitest';
import { normalizeInput } from '../normalize';

describe('normalizeInput', () => {
  // Tabel 8.2
  it('menambah https:// pada domain tanpa skema', () => {
    expect(normalizeInput('contoh.com')).toBe('https://contoh.com');
  });

  it('menambah https:// pada domain dengan path', () => {
    expect(normalizeInput('wa.me/62812345')).toBe('https://wa.me/62812345');
  });

  it('membiarkan skema yang sudah ada', () => {
    expect(normalizeInput('http://situs.id')).toBe('http://situs.id');
    expect(normalizeInput('mailto:a@b.co')).toBe('mailto:a@b.co');
    expect(normalizeInput('tel:+628123')).toBe('tel:+628123');
  });

  it('membiarkan teks biasa yang mengandung spasi', () => {
    expect(normalizeInput('halo dunia')).toBe('halo dunia');
  });

  it('membiarkan satu kata tanpa titik', () => {
    expect(normalizeInput('kata')).toBe('kata');
  });

  it('mengembalikan string kosong untuk spasi saja', () => {
    expect(normalizeInput('   ')).toBe('');
    expect(normalizeInput('')).toBe('');
  });

  it('memangkas spasi di tepi', () => {
    expect(normalizeInput('  contoh.com  ')).toBe('https://contoh.com');
  });
});
