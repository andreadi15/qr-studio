import { describe, expect, it } from 'vitest';
import { fileName } from '../export';

describe('fileName', () => {
  it('memakai hostname tanpa www', () => {
    expect(fileName('https://www.contoh.com/x')).toBe('qr-contoh.com.png');
  });

  it('memakai hostname apa adanya bila tanpa www', () => {
    expect(fileName('https://wa.me/62812345')).toBe('qr-wa.me.png');
  });

  it('jatuh ke qr-code.png untuk teks biasa', () => {
    expect(fileName('halo dunia')).toBe('qr-code.png');
    expect(fileName('kata')).toBe('qr-code.png');
    expect(fileName('')).toBe('qr-code.png');
  });

  it('membersihkan karakter yang tidak aman', () => {
    expect(fileName('https://contoh.com/a b?x=1')).toBe('qr-contoh.com.png');
  });
});
