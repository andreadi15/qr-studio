import { useRef } from 'react';
import type { LogoShape, Settings } from '../lib/types';
import { Segmented } from './Segmented';
import { ToggleField } from './ToggleField';

interface Props {
  settings: Settings;
  thumb: string | null;
  error: string;
  hasLogo: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
  update: (patch: Partial<Settings>) => void;
}

export function LogoSection({
  settings,
  thumb,
  error,
  hasLogo,
  onPick,
  onRemove,
  update,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const remove = () => {
    onRemove();
    // reset value agar file yang sama bisa dipilih lagi
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <section className="section">
      <h2 className="section__title">Logo</h2>

      <div className="logo-row">
        {thumb && <img className="logo-picker__thumb" src={thumb} alt="Logo terpilih" />}
        <label className="logo-picker">
          {hasLogo ? 'Ganti gambar logo' : 'Pilih gambar logo'}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPick(f);
            }}
          />
        </label>
        {hasLogo && (
          <button type="button" className="btn" onClick={remove}>
            Hapus logo
          </button>
        )}
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="field" hidden={!hasLogo}>
        <label htmlFor="logo-size">Ukuran logo ({settings.logoSize}%)</label>
        <input
          id="logo-size"
          type="range"
          min={10}
          max={30}
          step={1}
          value={settings.logoSize}
          onChange={(e) => update({ logoSize: Number(e.target.value) })}
          style={{ width: '100%', marginTop: 'var(--space-2)' }}
        />
      </div>

      <div className="field" hidden={!hasLogo}>
        <p className="hint" style={{ marginBottom: 'var(--space-2)' }}>
          Bentuk logo
        </p>
        <Segmented<LogoShape>
          label="Bentuk logo"
          value={settings.logoShape}
          onChange={(v) => update({ logoShape: v })}
          options={[
            { value: 'original', label: 'Asli' },
            { value: 'rounded', label: 'Membulat' },
            { value: 'circle', label: 'Bulat' },
          ]}
        />
      </div>

      <div className="field" hidden={!hasLogo}>
        <ToggleField
          id="logo-plate"
          label="Beri latar di belakang logo"
          checked={settings.logoPlate}
          onChange={(v) => update({ logoPlate: v })}
        />
      </div>
    </section>
  );
}
