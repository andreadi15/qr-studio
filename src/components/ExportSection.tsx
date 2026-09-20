import type { Settings } from '../lib/types';
import { Segmented } from './Segmented';

interface Props {
  settings: Settings;
  canExport: boolean;
  busy: boolean;
  status: string;
  supported: boolean;
  onExport: () => void;
  update: (patch: Partial<Settings>) => void;
  onReset: () => void;
}

export function ExportSection({
  settings,
  canExport,
  busy,
  status,
  supported,
  onExport,
  update,
  onReset,
}: Props) {
  return (
    <section className="section">
      <h2 className="section__title">Unduh</h2>

      <div className="field">
        <p className="hint" style={{ marginBottom: 'var(--space-2)' }}>
          Ukuran
        </p>
        <Segmented<512 | 1024 | 2048>
          label="Ukuran unduhan"
          value={settings.exportSize}
          onChange={(v) => update({ exportSize: v })}
          options={[
            { value: 512, label: '512 px' },
            { value: 1024, label: '1024 px' },
            { value: 2048, label: '2048 px' },
          ]}
        />
      </div>

      {supported && (
        <div className="field">
          <button
            type="button"
            className="btn btn--primary"
            disabled={!canExport || busy}
            onClick={onExport}
          >
            {busy ? 'Menyiapkan…' : 'Unduh PNG'}
          </button>
        </div>
      )}

      <p className="status" role="status">
        {status}
      </p>

      <div className="field">
        <button type="button" className="btn" onClick={onReset}>
          Reset pengaturan
        </button>
      </div>
    </section>
  );
}
