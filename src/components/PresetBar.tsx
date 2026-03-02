import type { DisplaySettings } from "../types/slopeField";

type PresetBarProps = {
  settings: DisplaySettings;
  visibleCount: number;
  totalCount: number;
  onSettingsChange: (key: keyof DisplaySettings, value: number | boolean) => void;
};

export default function PresetBar({
  settings,
  visibleCount,
  totalCount,
  onSettingsChange,
}: PresetBarProps) {
  return (
    <section className="panel-section">
      <div className="section-header">
        <p className="eyebrow">Display</p>
        <p className="status-pill ok">
          {visibleCount} / {totalCount} shown
        </p>
      </div>
      <div className="field-grid compact">
        <label className="field">
          <span>Animation (ms)</span>
          <input
            type="number"
            min={80}
            max={1600}
            step={20}
            value={settings.animationMs}
            onChange={(event) => onSettingsChange("animationMs", Number(event.target.value))}
          />
        </label>
        <label className="field">
          <span>Segment scale</span>
          <input
            type="number"
            min={0.2}
            max={1}
            step={0.05}
            value={settings.segmentScale}
            onChange={(event) => onSettingsChange("segmentScale", Number(event.target.value))}
          />
        </label>
      </div>
      <label className="toggle">
        <input
          type="checkbox"
          checked={settings.showGridPoints}
          onChange={(event) => onSettingsChange("showGridPoints", event.target.checked)}
        />
        <span>Show sample points beneath visible segments</span>
      </label>
      <label className="toggle">
        <input
          type="checkbox"
          checked={settings.highlightZeroSlope}
          onChange={(event) => onSettingsChange("highlightZeroSlope", event.target.checked)}
        />
        <span>Glow zero-slope segments</span>
      </label>
    </section>
  );
}
