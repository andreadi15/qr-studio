import { PRESETS, type Preset } from '../lib/presets';

interface Props {
  onApply: (preset: Preset) => void;
}

export function ColorPresets({ onApply }: Props) {
  return (
    <div className="presets">
      {PRESETS.map((p) => (
        <button
          key={p.name}
          type="button"
          className="preset"
          onClick={() => onApply(p)}
          title={`Pakai preset ${p.name}`}
        >
          <span
            className="preset__swatch"
            style={{
              background: p.gradient
                ? `linear-gradient(135deg, ${p.fg}, ${p.fg2})`
                : p.fg,
              boxShadow: `inset -6px 0 0 ${p.bg}`,
            }}
            aria-hidden="true"
          />
          {p.name}
        </button>
      ))}
    </div>
  );
}
