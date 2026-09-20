import type { Hex, Settings } from '../lib/types';
import type { Preset } from '../lib/presets';
import { ColorField } from './ColorField';
import { ColorPresets } from './ColorPresets';
import { ToggleField } from './ToggleField';

interface Props {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  applyPreset: (preset: Preset) => void;
}

export function ColorSection({ settings, update, applyPreset }: Props) {
  return (
    <section className="section">
      <h2 className="section__title">Warna</h2>

      <ColorPresets onApply={applyPreset} />

      <div className="field">
        <ColorField
          id="color-fg"
          label="Warna QR"
          value={settings.fg}
          onChange={(v: Hex) => update({ fg: v })}
        />
      </div>

      <div className="field">
        <ToggleField
          id="color-gradient"
          label="Pakai warna gradasi"
          checked={settings.gradient}
          onChange={(v) => update({ gradient: v })}
        />
      </div>

      <div className="field" hidden={!settings.gradient}>
        <ColorField
          id="color-fg2"
          label="Warna gradasi kedua"
          value={settings.fg2}
          onChange={(v: Hex) => update({ fg2: v })}
        />
      </div>

      <div className="field">
        <ToggleField
          id="color-eye-same"
          label="Pojok sama dengan warna QR"
          checked={settings.eyeSame}
          onChange={(v) => update({ eyeSame: v })}
        />
      </div>

      <div className="field" hidden={settings.eyeSame}>
        <ColorField
          id="color-eye"
          label="Warna pojok"
          value={settings.eye}
          onChange={(v: Hex) => update({ eye: v })}
        />
      </div>

      <div className="field">
        <ColorField
          id="color-bg"
          label="Warna latar"
          value={settings.bg}
          onChange={(v: Hex) => update({ bg: v })}
        />
      </div>

      <div className="field">
        <ToggleField
          id="color-transparent"
          label="Latar transparan"
          checked={settings.transparent}
          onChange={(v) => update({ transparent: v })}
        />
      </div>
    </section>
  );
}
