type RevealControlsProps = {
  disabled: boolean;
  customLine: string;
  customLineError: string | null;
  highlightZeroSlope: boolean;
  onCustomLineChange: (value: string) => void;
  onToggleZeroSlopeGlow: (value: boolean) => void;
  onNextSegment: () => void;
  onNextRow: () => void;
  onNextColumn: () => void;
  onRevealYX: () => void;
  onRevealNegativeYX: () => void;
  onRevealCustomLine: () => void;
  onRevealAll: () => void;
  onReset: () => void;
};

export default function RevealControls({
  disabled,
  customLine,
  customLineError,
  highlightZeroSlope,
  onCustomLineChange,
  onToggleZeroSlopeGlow,
  onNextSegment,
  onNextRow,
  onNextColumn,
  onRevealYX,
  onRevealNegativeYX,
  onRevealCustomLine,
  onRevealAll,
  onReset,
}: RevealControlsProps) {
  return (
    <section className="panel-section">
      <div className="section-header">
        <p className="eyebrow">Reveal</p>
        <p className="status-pill ok">Construction tools</p>
      </div>
      <div className="button-grid">
        <button type="button" onClick={onNextSegment} disabled={disabled}>
          Next segment
        </button>
        <button type="button" onClick={onNextRow} disabled={disabled}>
          Next row
        </button>
        <button type="button" onClick={onNextColumn} disabled={disabled}>
          Next column
        </button>
        <button type="button" onClick={onRevealYX} disabled={disabled}>
          Reveal y = x
        </button>
        <button type="button" onClick={onRevealNegativeYX} disabled={disabled}>
          Reveal y = -x
        </button>
        <button type="button" onClick={onRevealCustomLine} disabled={disabled || Boolean(customLineError)}>
          Reveal custom line
        </button>
        <button type="button" className="secondary" onClick={onRevealAll} disabled={disabled}>
          Reveal all
        </button>
        <button type="button" className="ghost" onClick={onReset}>
          Reset
        </button>
      </div>
      <label className="field custom-reveal-field">
        <span>Custom reveal line</span>
        <input
          type="text"
          value={customLine}
          onChange={(event) => onCustomLineChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !disabled && !customLineError) {
              event.preventDefault();
              onRevealCustomLine();
            }
          }}
          placeholder="y = x / 2 + 1"
        />
      </label>
      <p className={`helper-text ${customLineError ? "error" : ""}`}>
        {customLineError ?? "Use y = expression or x = expression to reveal along a custom line."}
      </p>
      <label className="toggle">
        <input
          type="checkbox"
          checked={highlightZeroSlope}
          onChange={(event) => onToggleZeroSlopeGlow(event.target.checked)}
        />
        <span>Glow zero-slope segments</span>
      </label>
    </section>
  );
}
