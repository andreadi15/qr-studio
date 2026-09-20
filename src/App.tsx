import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InputSection } from './components/InputSection';
import { LogoSection } from './components/LogoSection';
import { ColorSection } from './components/ColorSection';
import { ShapeSection } from './components/ShapeSection';
import { ExportSection } from './components/ExportSection';
import { Preview } from './components/Preview';
import { useDebounced } from './hooks/useDebounced';
import { useSettings } from './hooks/useSettings';
import { useLogo } from './hooks/useLogo';
import { normalizeInput } from './lib/normalize';
import { buildMatrix } from './lib/qr';
import { contrastNote } from './lib/contrast';
import { canDownload, downloadBlob, exportPng, fileName } from './lib/export';
import type { Preset } from './lib/presets';

export default function App() {
  const [text, setText] = useState('');
  const [matrix, setMatrix] = useState<boolean[][] | null>(null);
  const [tooLong, setTooLong] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  const { settings, update, reset } = useSettings();
  const { logo, thumb, error: logoError, pickFile, remove } = useLogo();

  const supported = useMemo(() => canDownload(), []);
  const normalized = useDebounced(normalizeInput(text), 120);

  // Bangun matriks; error kapasitas → state "terlalu panjang"
  useEffect(() => {
    if (!normalized) {
      setMatrix(null);
      setTooLong(false);
      return;
    }
    try {
      setMatrix(buildMatrix(normalized));
      setTooLong(false);
    } catch {
      setMatrix(null);
      setTooLong(true);
    }
  }, [normalized]);

  // Fallback tanpa dukungan unduhan: sediakan <img> agar bisa disimpan manual
  useEffect(() => {
    if (supported || !matrix) {
      setFallbackUrl(null);
      return;
    }
    let url: string | null = null;
    let cancelled = false;
    exportPng({ matrix, settings, logo }, settings.exportSize)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setFallbackUrl(url);
      })
      .catch(() => setFallbackUrl(null));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [supported, matrix, settings, logo]);

  const note = matrix ? contrastNote(settings) : '';

  const applyPreset = useCallback(
    (p: Preset) => {
      update({
        fg: p.fg,
        fg2: p.fg2,
        gradient: p.gradient,
        bg: p.bg,
        eyeSame: p.eyeSame,
        eye: p.eye,
        transparent: false,
      });
    },
    [update],
  );

  const handleReset = useCallback(() => {
    reset();
    remove();
    setStatus('');
  }, [reset, remove]);

  const handleExport = useCallback(async () => {
    if (!matrix) return;
    setBusy(true);
    setStatus('');
    try {
      const blob = await exportPng({ matrix, settings, logo }, settings.exportSize);
      downloadBlob(blob, fileName(normalized));
      setStatus('QR code tersimpan.');
    } catch {
      setStatus('Ekspor gagal. Coba pakai logo berformat PNG atau JPG.');
    } finally {
      setBusy(false);
    }
  }, [matrix, settings, logo, normalized]);

  // Bersihkan pesan status setelah beberapa saat
  const statusTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!status) return;
    window.clearTimeout(statusTimer.current);
    statusTimer.current = window.setTimeout(() => setStatus(''), 3000);
    return () => window.clearTimeout(statusTimer.current);
  }, [status]);

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Pembuat QR Code</h1>
        <p className="page__sub">
          Tempel link, tambahkan logo, lalu atur warna dan bentuk. Unduh PNG resolusi tinggi.
        </p>
        <p className="page__privacy">Semua diproses di perangkatmu.</p>
      </header>

      <div className="layout">
        <div className="preview-col">
          <Preview
            matrix={matrix}
            settings={settings}
            logo={logo}
            tooLong={tooLong}
            note={note}
            fallbackUrl={fallbackUrl}
          />
        </div>

        <div className="panel">
          <InputSection value={text} normalized={normalized} onChange={setText} />
          <LogoSection
            settings={settings}
            thumb={thumb}
            error={logoError}
            hasLogo={logo !== null}
            onPick={pickFile}
            onRemove={remove}
            update={update}
          />
          <ColorSection settings={settings} update={update} applyPreset={applyPreset} />
          <ShapeSection settings={settings} update={update} />
          <ExportSection
            settings={settings}
            canExport={matrix !== null}
            busy={busy}
            status={status}
            supported={supported}
            onExport={handleExport}
            update={update}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  );
}
