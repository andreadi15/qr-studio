interface Props {
  value: string;
  normalized: string;
  onChange: (value: string) => void;
}

export function InputSection({ value, normalized, onChange }: Props) {
  const showNormalized = normalized !== '' && normalized !== value.trim();

  return (
    <section className="section">
      <h2 className="section__title">Link atau teks</h2>
      <div className="field">
        <label className="visually-hidden" htmlFor="qr-input">
          Link atau teks
        </label>
        <input
          id="qr-input"
          className="text-input"
          type="text"
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="https://contoh.com/halaman"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {showNormalized && (
        <p className="hint" style={{ marginTop: 'var(--space-2)' }}>
          Dibaca sebagai: {normalized}
        </p>
      )}
    </section>
  );
}
