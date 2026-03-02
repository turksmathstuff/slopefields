import { useEffect, useMemo, useState } from "react";
import ControlPanel from "./components/ControlPanel";
import GraphPanel from "./components/GraphPanel";
import { createEquationEvaluator, createLineEvaluator } from "./lib/evaluator";
import { buildSlopeField, countValidPoints } from "./lib/grid";
import { PRESET_EQUATIONS } from "./lib/presets";
import {
  createInitialRevealState,
  revealAll,
  revealAlongLine,
  revealAlongCustomLine,
  revealNextColumn,
  revealNextRow,
  revealNextSegment,
} from "./lib/reveal";
import { lineTolerance, MAX_POINTS, validateGrid, validateViewport } from "./lib/validation";
import type { DisplaySettings, GridConfig, Viewport } from "./types/slopeField";

const DEFAULT_VIEWPORT: Viewport = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
const DEFAULT_SETTINGS: DisplaySettings = {
  segmentScale: 0.62,
  animationMs: 260,
  showGridPoints: true,
  highlightZeroSlope: true,
};
const CUSTOM_LINE_EPSILON = 1e-9;
const STAGGER_MS = 36;

type RevealAnimationState = {
  mode: "row" | "column" | null;
  ids: Set<string>;
  version: number;
};

type AutoGridState = {
  x: boolean;
  y: boolean;
};

function isIntegerAligned(value: number) {
  return Number.isInteger(value);
}

function suggestedAxisSteps(min: number, max: number) {
  if (!isIntegerAligned(min) || !isIntegerAligned(max) || min >= max) {
    return null;
  }

  return max - min + 1;
}

function buildDefaultGrid(viewport: Viewport): GridConfig {
  return {
    xSteps: suggestedAxisSteps(viewport.xMin, viewport.xMax) ?? 15,
    ySteps: suggestedAxisSteps(viewport.yMin, viewport.yMax) ?? 15,
  };
}

const DEFAULT_GRID: GridConfig = buildDefaultGrid(DEFAULT_VIEWPORT);

export default function App() {
  const [expression, setExpression] = useState("x - y");
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);
  const [grid, setGrid] = useState(DEFAULT_GRID);
  const [autoGrid, setAutoGrid] = useState<AutoGridState>({ x: true, y: true });
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [customLine, setCustomLine] = useState("y = x");
  const [revealState, setRevealState] = useState(createInitialRevealState([], DEFAULT_GRID));
  const [revealAnimation, setRevealAnimation] = useState<RevealAnimationState>({
    mode: null,
    ids: new Set<string>(),
    version: 0,
  });

  const viewportError = validateViewport(viewport);
  const gridError = validateGrid(grid);

  const evaluatorState = useMemo(() => {
    try {
      return { evaluator: createEquationEvaluator(expression), error: null };
    } catch (error) {
      return { evaluator: null, error: error instanceof Error ? error.message : "Unable to parse expression." };
    }
  }, [expression]);

  const customLineState = useMemo(() => {
    try {
      return { evaluator: createLineEvaluator(customLine), error: null };
    } catch (error) {
      return { evaluator: null, error: error instanceof Error ? error.message : "Unable to parse custom line." };
    }
  }, [customLine]);

  const fieldState = useMemo(() => {
    if (!evaluatorState.evaluator || viewportError || gridError) {
      return { points: [], errors: [] };
    }

    return buildSlopeField(evaluatorState.evaluator, viewport, grid, settings);
  }, [evaluatorState.evaluator, viewport, grid, settings.segmentScale, viewportError, gridError]);

  useEffect(() => {
    setRevealState(createInitialRevealState(fieldState.points, grid));
    setRevealAnimation({ mode: null, ids: new Set<string>(), version: 0 });
  }, [fieldState.points, grid]);

  const validPointCount = useMemo(() => countValidPoints(fieldState.points), [fieldState.points]);
  const tolerance = useMemo(() => lineTolerance(viewport, grid), [viewport, grid]);
  const disableReveal = Boolean(evaluatorState.error || viewportError || gridError || validPointCount === 0);
  const visibleCount = revealState.visibleIds.size;
  const parseMessage =
    fieldState.errors.length > 0
      ? `${fieldState.errors.length} sample point${fieldState.errors.length === 1 ? "" : "s"} could not be evaluated.`
      : "Expression parsed successfully.";

  function updateViewportAxis(key: keyof Viewport, value: number) {
    const nextViewport = { ...viewport, [key]: value };
    const suggestedX = suggestedAxisSteps(nextViewport.xMin, nextViewport.xMax);
    const suggestedY = suggestedAxisSteps(nextViewport.yMin, nextViewport.yMax);

    setViewport(nextViewport);
    setGrid((current) => {
      let nextGrid = current;

      if (autoGrid.x && suggestedX !== null && suggestedX * current.ySteps <= MAX_POINTS) {
        nextGrid = { ...nextGrid, xSteps: suggestedX };
      }

      if (autoGrid.y && suggestedY !== null && nextGrid.xSteps * suggestedY <= MAX_POINTS) {
        nextGrid = { ...nextGrid, ySteps: suggestedY };
      }

      return nextGrid;
    });
  }

  function updateGridAxis(key: keyof GridConfig, value: number) {
    const rounded = Math.round(value);
    const suggestedX = suggestedAxisSteps(viewport.xMin, viewport.xMax);
    const suggestedY = suggestedAxisSteps(viewport.yMin, viewport.yMax);

    setGrid((current) => ({ ...current, [key]: rounded }));
    setAutoGrid((current) => ({
      ...current,
      [key === "xSteps" ? "x" : "y"]:
        key === "xSteps" ? suggestedX !== null && rounded === suggestedX : suggestedY !== null && rounded === suggestedY,
    }));
  }

  function applyReveal(
    updater: (current: typeof revealState) => typeof revealState,
    mode: RevealAnimationState["mode"] = null,
  ) {
    setRevealState((current) => {
      const next = updater(current);
      const newIds = new Set<string>();

      next.visibleIds.forEach((id) => {
        if (!current.visibleIds.has(id)) {
          newIds.add(id);
        }
      });

      setRevealAnimation((animation) => ({
        mode: newIds.size > 0 ? mode : null,
        ids: newIds,
        version: animation.version + 1,
      }));

      return next;
    });
  }

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
        customLine={customLine}
        customLineError={customLineState.error}
        viewportError={viewportError}
        gridError={gridError}
        presets={PRESET_EQUATIONS}
        disableReveal={disableReveal}
        visibleCount={visibleCount}
        totalCount={validPointCount}
        onExpressionChange={setExpression}
        onPresetSelect={(value) => setExpression(value)}
        onViewportChange={updateViewportAxis}
        onGridChange={updateGridAxis}
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
        onCustomLineChange={setCustomLine}
        onNextSegment={() => applyReveal((current) => revealNextSegment(fieldState.points, current, grid))}
        onNextRow={() => applyReveal((current) => revealNextRow(fieldState.points, current, grid), "row")}
        onNextColumn={() =>
          applyReveal((current) => revealNextColumn(fieldState.points, current, grid), "column")
        }
        onRevealYX={() =>
          applyReveal((current) => revealAlongLine(fieldState.points, current, grid, "y=x", tolerance))
        }
        onRevealNegativeYX={() =>
          applyReveal((current) => revealAlongLine(fieldState.points, current, grid, "y=-x", tolerance))
        }
        onRevealCustomLine={() =>
          customLineState.evaluator
            ? applyReveal((current) =>
                revealAlongCustomLine(
                  fieldState.points,
                  current,
                  grid,
                  (point) => {
                    if (customLineState.evaluator?.axis === "y") {
                      return Math.abs(point.y - customLineState.evaluator.evaluate(point.x)) <= CUSTOM_LINE_EPSILON;
                    }

                    return Math.abs(point.x - customLineState.evaluator.evaluate(point.y)) <= CUSTOM_LINE_EPSILON;
                  },
                ),
              )
            : undefined
        }
        onRevealAll={() => applyReveal(() => revealAll(fieldState.points, grid))}
        onReset={() => applyReveal(() => createInitialRevealState(fieldState.points, grid))}
      />

      <div className="visual-panel">
        <GraphPanel
          points={fieldState.points}
          visibleIds={revealState.visibleIds}
          viewport={viewport}
          animationMs={settings.animationMs}
          showGridPoints={settings.showGridPoints}
          highlightZeroSlope={settings.highlightZeroSlope}
          recentRevealIds={revealAnimation.ids}
          recentRevealMode={revealAnimation.mode}
          revealVersion={revealAnimation.version}
          staggerMs={STAGGER_MS}
        />
      </div>
    </main>
  );
}
