import type { Hex } from '../lib/types';

interface Props {
  id: string;
  label: string;
  value: Hex;
  onChange: (value: Hex) => void;
}

export function ColorField({ id, label, value, onChange }: Props) {
  return (
    <div className="row">
      <label htmlFor={id}>{label}</label>
      <div className="color-field">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value as Hex)}
        />
        <span className="color-field__hex">{value}</span>
      </div>
    </div>
  );
}
