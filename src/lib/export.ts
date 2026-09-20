import type { RenderInput } from './types';
import { renderQr } from './render';

export function fileName(value: string): string {
  try {
    const h = new URL(value).hostname.replace(/^www\./, '').replace(/[^a-z0-9.-]/gi, '');
    if (h) return `qr-${h}.png`;
  } catch {
    /* bukan URL */
  }
  return 'qr-code.png';
}

export function exportPng(input: RenderInput, px: number): Promise<Blob> {
  const c = document.createElement('canvas');
  renderQr(c, px, input);
  return new Promise((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob null'))), 'image/png'),
  );
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function canDownload(): boolean {
  return typeof HTMLAnchorElement !== 'undefined' && 'download' in HTMLAnchorElement.prototype;
}
