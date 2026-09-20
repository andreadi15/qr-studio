import { useCallback, useState } from 'react';

const MAX_BYTES = 5 * 1024 * 1024;
const NOT_IMAGE = 'File harus berupa gambar (PNG, JPG, SVG, atau WebP).';
const TOO_BIG = 'Ukuran gambar maksimal 5 MB.';
const UNREADABLE = 'Gambar ini tidak bisa dibaca. Coba file lain.';

/**
 * Logo hanya hidup di memori komponen: tidak dikirim atau disimpan ke mana pun.
 */
export function useLogo() {
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [thumb, setThumb] = useState<string | null>(null);
  const [error, setError] = useState('');

  const pickFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(NOT_IMAGE);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(TOO_BIG);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const img = new Image();
      img.onload = () => {
        setLogo(img);
        setThumb(dataUrl);
        setError('');
      };
      img.onerror = () => setError(UNREADABLE);
      img.src = dataUrl;
    };
    reader.onerror = () => setError(UNREADABLE);
    reader.readAsDataURL(file);
  }, []);

  const remove = useCallback(() => {
    setLogo(null);
    setThumb(null);
    setError('');
  }, []);

  return { logo, thumb, error, pickFile, remove };
}
