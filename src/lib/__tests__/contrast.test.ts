import { describe, expect, it } from 'vitest';
import { contrastNote } from '../contrast';
import { DEFAULTS } from '../defaults';
import type { Settings } from '../types';

const make = (patch: Partial<Settings> = {}): Settings => ({ ...DEFAULTS, ...patch });

describe('contrastNote', () => {
  it('tidak memberi catatan untuk hitam di atas putih', () => {
    expect(contrastNote(make({ fg: '#000000', bg: '#FFFFFF' }))).toBe('');
  });

  it('memperingatkan QR lebih terang dari latar', () => {
    const out = contrastNote(make({ fg: '#FFFFFF', bg: '#000000' }));
    expect(out).toContain('terbalik');
  });

  it('memperingatkan kontras rendah', () => {
    const out = contrastNote(make({ fg: '#CCCCCC', bg: '#FFFFFF' }));
    expect(out).toContain('Kontras warna rendah');
  });

  it('memperingatkan latar transparan', () => {
    const out = contrastNote(make({ transparent: true }));
    expect(out).toContain('Latar transparan');
  });

  it('memeriksa warna gradasi kedua', () => {
    const out = contrastNote(
      make({ fg: '#000000', fg2: '#FFFFFF', gradient: true, bg: '#808080' }),
    );
    expect(out).toContain('terbalik');
  });

  it('memeriksa warna pojok terpisah', () => {
    const out = contrastNote(make({ fg: '#000000', eyeSame: false, eye: '#FFFFFF', bg: '#808080' }));
    expect(out).toContain('terbalik');
  });

  it('menganggap latar transparan sebagai putih saat menilai kontras', () => {
    const out = contrastNote(make({ fg: '#000000', transparent: true }));
    expect(out).not.toContain('terbalik');
    expect(out).not.toContain('Kontras warna rendah');
  });
});
