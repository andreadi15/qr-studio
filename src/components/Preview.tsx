import { useEffect, useRef } from 'react';
import type { Settings } from '../lib/types';
import { renderQr } from '../lib/render';

const PREVIEW_PX = 720;

interface Props {
  matrix: boolean[][] | null;
  settings: Settings;
  logo: HTMLImageElement | null;
  tooLong: boolean;
  note: string;
  /** Saat unduhan tidak didukung, kanvas diganti <img> agar bisa disimpan manual. */
  fallbackUrl: string | null;
}

export function Preview({ matrix, settings, logo, tooLong, note, fallbackUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!matrix || fallbackUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    cancelAnimationFrame(frame.current ?? 0);
    frame.current = requestAnimationFrame(() => {
      renderQr(canvas, PREVIEW_PX, { matrix, settings, logo });
    });
    return () => cancelAnimationFrame(frame.current ?? 0);
  }, [matrix, settings, logo, fallbackUrl]);

  let body;
  if (tooLong) {
    body = (
      <p className="preview__error" role="alert">
        Teks terlalu panjang untuk QR code. Coba link yang lebih pendek.
      </p>
    );
  } else if (!matrix) {
    body = <p className="preview__empty">Masukkan link untuk melihat QR code di sini.</p>;
  } else if (fallbackUrl) {
    body = (
      <img className="preview__img" src={fallbackUrl} alt="Pratinjau QR code" />
    );
  } else {
    body = (
      <canvas
        ref={canvasRef}
        className="preview__canvas"
        role="img"
        aria-label="Pratinjau QR code"
      />
    );
  }

  return (
    <div className="preview">
      <div className="preview__frame">{body}</div>
      <p className="note" role="status">
        {note}
      </p>
      {fallbackUrl && (
        <p className="hint">
          Tekan lama gambar lalu pilih Simpan untuk menyimpan QR code.
        </p>
      )}
    </div>
  );
}
