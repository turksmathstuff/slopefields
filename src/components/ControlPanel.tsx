import type { DisplaySettings, GridConfig, Viewport } from "../types/slopeField";
import type { PresetEquation } from "../lib/presets";
import EquationInput from "./EquationInput";
import ViewportControls from "./ViewportControls";
import RevealControls from "./RevealControls";
import PresetBar from "./PresetBar";

type ControlPanelProps = {
  expression: string;
  parseMessage: string;
  equationError: string | null;
  viewport: Viewport;
  grid: GridConfig;
  settings: DisplaySettings;
  customLine: string;
  customLineError: string | null;
  viewportError: string | null;
  gridError: string | null;
  presets: PresetEquation[];
  disableReveal: boolean;
  visibleCount: number;
  totalCount: number;
  onExpressionChange: (value: string) => void;
  onPresetSelect: (value: string) => void;
  onViewportChange: (key: keyof Viewport, value: number) => void;
  onGridChange: (key: keyof GridConfig, value: number) => void;
  onSettingsChange: (key: keyof DisplaySettings, value: number | boolean) => void;
  onCustomLineChange: (value: string) => void;
  onNextSegment: () => void;
  onNextRow: () => void;
  onNextColumn: () => void;
  onRevealYX: () => void;
  onRevealNegativeYX: () => void;
  onRevealCustomLine: () => void;
  onRevealAll: () => void;
  onReset: () => void;
};

export default function ControlPanel(props: ControlPanelProps) {
  const {
    expression,
    parseMessage,
    equationError,
    viewport,
    grid,
    settings,
    customLine,
    customLineError,
    viewportError,
    gridError,
    presets,
    disableReveal,
    visibleCount,
    totalCount,
    onExpressionChange,
    onPresetSelect,
    onViewportChange,
    onGridChange,
    onSettingsChange,
    onCustomLineChange,
    onNextSegment,
    onNextRow,
    onNextColumn,
    onRevealYX,
    onRevealNegativeYX,
    onRevealCustomLine,
    onRevealAll,
    onReset,
  } = props;

  return (
    <aside className="control-panel">
      <div className="panel-intro">
        <p className="eyebrow">Slope Field Explorer</p>
        <h1>Build a slope field.</h1>
        <p>
          Enter any first-order differential equation in <code>x</code> and <code>y</code>, tune the viewing window, then
          reveal the segments in deliberate patterns.
        </p>
      </div>

      <EquationInput
        expression={expression}
        status={parseMessage}
        error={equationError}
        presets={presets}
        onExpressionChange={onExpressionChange}
        onPresetSelect={onPresetSelect}
      />

      <ViewportControls
        viewport={viewport}
        grid={grid}
        viewportError={viewportError}
        gridError={gridError}
        onViewportChange={onViewportChange}
        onGridChange={onGridChange}
      />

      <RevealControls
        disabled={disableReveal}
        customLine={customLine}
        customLineError={customLineError}
        highlightZeroSlope={settings.highlightZeroSlope}
        onCustomLineChange={onCustomLineChange}
        onToggleZeroSlopeGlow={(value) => onSettingsChange("highlightZeroSlope", value)}
        onNextSegment={onNextSegment}
        onNextRow={onNextRow}
        onNextColumn={onNextColumn}
        onRevealYX={onRevealYX}
        onRevealNegativeYX={onRevealNegativeYX}
        onRevealCustomLine={onRevealCustomLine}
        onRevealAll={onRevealAll}
        onReset={onReset}
      />

      <PresetBar
        settings={settings}
        visibleCount={visibleCount}
        totalCount={totalCount}
        onSettingsChange={onSettingsChange}
      />
    </aside>
  );
}
