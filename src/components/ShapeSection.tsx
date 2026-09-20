import type { EyeShape, ModuleShape, Settings } from '../lib/types';
import { Segmented } from './Segmented';

interface Props {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
}

export function ShapeSection({ settings, update }: Props) {
  return (
    <section className="section">
      <h2 className="section__title">Bentuk</h2>

      <div className="field">
        <p className="hint" style={{ marginBottom: 'var(--space-2)' }}>
          Titik QR
        </p>
        <Segmented<ModuleShape>
          label="Titik QR"
          value={settings.module}
          onChange={(v) => update({ module: v })}
          options={[
            { value: 'square', label: 'Kotak' },
            { value: 'smooth', label: 'Halus' },
            { value: 'dots', label: 'Titik' },
          ]}
        />
      </div>

      <div className="field">
        <p className="hint" style={{ marginBottom: 'var(--space-2)' }}>
          Pojok
        </p>
        <Segmented<EyeShape>
          label="Pojok"
          value={settings.eyeShape}
          onChange={(v) => update({ eyeShape: v })}
          options={[
            { value: 'square', label: 'Kotak' },
            { value: 'rounded', label: 'Membulat' },
            { value: 'circle', label: 'Bulat' },
          ]}
        />
      </div>

      <div className="field">
        <p className="hint" style={{ marginBottom: 'var(--space-2)' }}>
          Tepi kosong
        </p>
        <Segmented<2 | 3 | 4>
          label="Tepi kosong"
          value={settings.margin}
          onChange={(v) => update({ margin: v })}
          options={[
            { value: 2, label: 'Tipis' },
            { value: 3, label: 'Sedang' },
            { value: 4, label: 'Lebar' },
          ]}
        />
      </div>
    </section>
  );
}
