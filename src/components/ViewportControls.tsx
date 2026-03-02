import { useEffect, useState } from "react";
import type { GridConfig, Viewport } from "../types/slopeField";

type ViewportControlsProps = {
  viewport: Viewport;
  grid: GridConfig;
  viewportError: string | null;
  gridError: string | null;
  onViewportChange: (key: keyof Viewport, value: number) => void;
  onGridChange: (key: keyof GridConfig, value: number) => void;
};

function NumberField({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        value={draft}
        step={step ?? 1}
        onChange={(event) => {
          const nextValue = event.target.value;
          setDraft(nextValue);

          if (nextValue === "") {
            return;
          }

          const parsed = Number(nextValue);
          if (!Number.isNaN(parsed)) {
            onChange(parsed);
          }
        }}
        onBlur={() => {
          if (draft === "" || Number.isNaN(Number(draft))) {
            setDraft(String(value));
          }
        }}
      />
    </label>
  );
}

export default function ViewportControls({
  viewport,
  grid,
  viewportError,
  gridError,
  onViewportChange,
  onGridChange,
}: ViewportControlsProps) {
  return (
    <section className="panel-section">
      <div className="section-header">
        <p className="eyebrow">Window</p>
        <p className={`status-pill ${viewportError || gridError ? "error" : "ok"}`}>
          {viewportError || gridError ? "Check ranges" : "Bounds locked"}
        </p>
      </div>
      <div className="field-grid">
        <NumberField label="x min" value={viewport.xMin} step={0.5} onChange={(value) => onViewportChange("xMin", value)} />
        <NumberField label="x max" value={viewport.xMax} step={0.5} onChange={(value) => onViewportChange("xMax", value)} />
        <NumberField label="y min" value={viewport.yMin} step={0.5} onChange={(value) => onViewportChange("yMin", value)} />
        <NumberField label="y max" value={viewport.yMax} step={0.5} onChange={(value) => onViewportChange("yMax", value)} />
        <NumberField label="x steps" value={grid.xSteps} onChange={(value) => onGridChange("xSteps", value)} />
        <NumberField label="y steps" value={grid.ySteps} onChange={(value) => onGridChange("ySteps", value)} />
      </div>
      <p className={`helper-text ${viewportError || gridError ? "error" : ""}`}>
        {viewportError || gridError || "Adjust the plotting window and sampling density."}
      </p>
    </section>
  );
}
