import { describe, expect, it } from 'vitest';
import { pickKnown } from '../storage';
import { DEFAULTS } from '../defaults';

describe('pickKnown', () => {
  it('mempertahankan nilai yang valid', () => {
    const out = pickKnown({ fg: '#123456', margin: 4, module: 'dots', exportSize: 2048 });
    expect(out).toEqual({ fg: '#123456', margin: 4, module: 'dots', exportSize: 2048 });
  });

  it('membuang enum yang tidak dikenal', () => {
    const out = pickKnown({ module: 'segitiga', eyeShape: 'bintang', logoShape: 'kotak' });
    expect(out).toEqual({});
  });

  it('membuang angka di luar rentang', () => {
    expect(pickKnown({ logoSize: 5 })).toEqual({});
    expect(pickKnown({ logoSize: 99 })).toEqual({});
    expect(pickKnown({ logoSize: 22 })).toEqual({ logoSize: 22 });
  });

  it('membuang margin dan exportSize yang tidak diizinkan', () => {
    expect(pickKnown({ margin: 5 })).toEqual({});
    expect(pickKnown({ exportSize: 300 })).toEqual({});
  });

  it('membuang hex dengan format salah', () => {
    expect(pickKnown({ fg: 'merah' })).toEqual({});
    expect(pickKnown({ fg: '#12345' })).toEqual({});
    expect(pickKnown({ fg: '#GGGGGG' })).toEqual({});
  });

  it('membuang nilai dengan tipe salah', () => {
    expect(pickKnown({ gradient: 'ya', logoPlate: 1 })).toEqual({});
  });

  it('mengembalikan objek kosong untuk input bukan objek', () => {
    expect(pickKnown(null)).toEqual({});
    expect(pickKnown('teks')).toEqual({});
    expect(pickKnown(42)).toEqual({});
  });

  it('menggabungkan hasil dengan default menghasilkan Settings lengkap', () => {
    const s = { ...DEFAULTS, ...pickKnown({ fg: 'rusak', margin: 4 }) };
    expect(s.fg).toBe(DEFAULTS.fg);
    expect(s.margin).toBe(4);
  });
});
