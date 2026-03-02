import type { PresetEquation } from "../lib/presets";

type EquationInputProps = {
  expression: string;
  status: string;
  error: string | null;
  presets: PresetEquation[];
  onExpressionChange: (value: string) => void;
  onPresetSelect: (value: string) => void;
};

export default function EquationInput({
  expression,
  status,
  error,
  presets,
  onExpressionChange,
  onPresetSelect,
}: EquationInputProps) {
  return (
    <section className="panel-section">
      <div className="section-header">
        <p className="eyebrow">Equation</p>
        <p className={`status-pill ${error ? "error" : "ok"}`}>{error ? "Needs attention" : "Ready"}</p>
      </div>
      <label className="equation-label" htmlFor="equation-input">
        dy/dx =
      </label>
      <input
        id="equation-input"
        className={`equation-input ${error ? "invalid" : ""}`}
        value={expression}
        onChange={(event) => onExpressionChange(event.target.value)}
        placeholder="x - y"
        spellCheck={false}
      />
      <p className={`helper-text ${error ? "error" : ""}`}>{error ?? status}</p>
      <div className="preset-grid">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="preset-chip"
            onClick={() => onPresetSelect(preset.expression)}
            title={preset.note}
          >
            <span>{preset.label}</span>
            <strong>{preset.expression}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
