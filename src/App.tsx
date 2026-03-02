import { useEffect, useMemo, useState } from "react";
import ControlPanel from "./components/ControlPanel";
import GraphPanel from "./components/GraphPanel";
import { createEquationEvaluator } from "./lib/evaluator";
import { buildSlopeField, countValidPoints } from "./lib/grid";
import { PRESET_EQUATIONS } from "./lib/presets";
import {
  createInitialRevealState,
  revealAll,
  revealAlongLine,
  revealNextColumn,
  revealNextRow,
  revealNextSegment,
} from "./lib/reveal";
import { lineTolerance, validateGrid, validateViewport } from "./lib/validation";
import type { DisplaySettings, GridConfig, Viewport } from "./types/slopeField";

const DEFAULT_VIEWPORT: Viewport = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
const DEFAULT_GRID: GridConfig = { xSteps: 15, ySteps: 15 };
const DEFAULT_SETTINGS: DisplaySettings = {
  segmentScale: 0.62,
  animationMs: 260,
  showGridPoints: true,
  highlightZeroSlope: true,
};

export default function App() {
  const [expression, setExpression] = useState("x - y");
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);
  const [grid, setGrid] = useState(DEFAULT_GRID);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [revealState, setRevealState] = useState(createInitialRevealState([], DEFAULT_GRID));

  const viewportError = validateViewport(viewport);
  const gridError = validateGrid(grid);

  const evaluatorState = useMemo(() => {
    try {
      return { evaluator: createEquationEvaluator(expression), error: null };
    } catch (error) {
      return { evaluator: null, error: error instanceof Error ? error.message : "Unable to parse expression." };
    }
  }, [expression]);

  const fieldState = useMemo(() => {
    if (!evaluatorState.evaluator || viewportError || gridError) {
      return { points: [], errors: [] };
    }

    return buildSlopeField(evaluatorState.evaluator, viewport, grid, settings);
  }, [evaluatorState.evaluator, viewport, grid, settings.segmentScale, viewportError, gridError]);

  useEffect(() => {
    setRevealState(createInitialRevealState(fieldState.points, grid));
  }, [fieldState.points, grid]);

  const validPointCount = useMemo(() => countValidPoints(fieldState.points), [fieldState.points]);
  const tolerance = useMemo(() => lineTolerance(viewport, grid), [viewport, grid]);
  const disableReveal = Boolean(evaluatorState.error || viewportError || gridError || validPointCount === 0);
  const visibleCount = revealState.visibleIds.size;
  const parseMessage =
    fieldState.errors.length > 0
      ? `${fieldState.errors.length} sample point${fieldState.errors.length === 1 ? "" : "s"} could not be evaluated.`
      : "Expression parsed successfully.";

  return (
    <main className="app-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      <ControlPanel
        expression={expression}
        parseMessage={parseMessage}
        equationError={evaluatorState.error}
        viewport={viewport}
        grid={grid}
        settings={settings}
        viewportError={viewportError}
        gridError={gridError}
        presets={PRESET_EQUATIONS}
        disableReveal={disableReveal}
        visibleCount={visibleCount}
        totalCount={validPointCount}
        onExpressionChange={setExpression}
        onPresetSelect={(value) => setExpression(value)}
        onViewportChange={(key, value) => setViewport((current) => ({ ...current, [key]: value }))}
        onGridChange={(key, value) => setGrid((current) => ({ ...current, [key]: Math.max(2, Math.round(value)) }))}
        onSettingsChange={(key, value) =>
          setSettings((current) => ({
            ...current,
            [key]:
              typeof current[key] === "boolean"
                ? Boolean(value)
                : key === "segmentScale"
                  ? Math.min(1, Math.max(0.2, Number(value)))
                  : Math.min(1600, Math.max(80, Number(value))),
          }))
        }
        onNextSegment={() => setRevealState((current) => revealNextSegment(fieldState.points, current, grid))}
        onNextRow={() => setRevealState((current) => revealNextRow(fieldState.points, current, grid))}
        onNextColumn={() => setRevealState((current) => revealNextColumn(fieldState.points, current, grid))}
        onRevealYX={() =>
          setRevealState((current) => revealAlongLine(fieldState.points, current, grid, "y=x", tolerance))
        }
        onRevealNegativeYX={() =>
          setRevealState((current) => revealAlongLine(fieldState.points, current, grid, "y=-x", tolerance))
        }
        onRevealAll={() => setRevealState(revealAll(fieldState.points, grid))}
        onReset={() => setRevealState(createInitialRevealState(fieldState.points, grid))}
      />

      <div className="visual-panel">
        <GraphPanel
          points={fieldState.points}
          visibleIds={revealState.visibleIds}
          viewport={viewport}
          animationMs={settings.animationMs}
          showGridPoints={settings.showGridPoints}
          highlightZeroSlope={settings.highlightZeroSlope}
        />
        <div className="status-bar">
          <div>
            <p className="eyebrow">Current equation</p>
            <strong>{expression}</strong>
          </div>
          <div>
            <p className="eyebrow">Window</p>
            <strong>
              x: [{viewport.xMin}, {viewport.xMax}] y: [{viewport.yMin}, {viewport.yMax}]
            </strong>
          </div>
          <div>
            <p className="eyebrow">Sample quality</p>
            <strong>{fieldState.errors.length === 0 ? "All points valid" : parseMessage}</strong>
          </div>
        </div>
      </div>
    </main>
  );
}
