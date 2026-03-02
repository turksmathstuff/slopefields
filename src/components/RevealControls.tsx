type RevealControlsProps = {
  disabled: boolean;
  onNextSegment: () => void;
  onNextRow: () => void;
  onNextColumn: () => void;
  onRevealYX: () => void;
  onRevealNegativeYX: () => void;
  onRevealAll: () => void;
  onReset: () => void;
};

export default function RevealControls({
  disabled,
  onNextSegment,
  onNextRow,
  onNextColumn,
  onRevealYX,
  onRevealNegativeYX,
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
        <button type="button" className="secondary" onClick={onRevealAll} disabled={disabled}>
          Reveal all
        </button>
        <button type="button" className="ghost" onClick={onReset}>
          Reset
        </button>
      </div>
    </section>
  );
}
