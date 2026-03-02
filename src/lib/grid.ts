import { DEFAULT_PLOT_BOX, mapXToScreen, mapYToScreen, type PlotBox } from "./coordinates";
import type { BuildResult, DisplaySettings, EquationEvaluator, GridConfig, SamplePoint, Viewport } from "../types/slopeField";

function buildSegment(
  screenX: number,
  screenY: number,
  slope: number,
  grid: GridConfig,
  settings: DisplaySettings,
  plotBox: PlotBox,
) {
  const innerWidth = plotBox.width - plotBox.padding.left - plotBox.padding.right;
  const innerHeight = plotBox.height - plotBox.padding.top - plotBox.padding.bottom;
  const xSpacing = innerWidth / Math.max(grid.xSteps - 1, 1);
  const ySpacing = innerHeight / Math.max(grid.ySteps - 1, 1);
  const baseLength = Math.min(xSpacing, ySpacing) * settings.segmentScale;
  const halfLength = baseLength / 2;

  if (!Number.isFinite(slope)) {
    return null;
  }

  const angle = Math.atan(slope);
  const dx = Math.cos(angle) * halfLength;
  const dy = Math.sin(angle) * halfLength;

  return {
    x1: screenX - dx,
    y1: screenY + dy,
    x2: screenX + dx,
    y2: screenY - dy,
  };
}

export function buildSlopeField(
  evaluator: EquationEvaluator,
  viewport: Viewport,
  grid: GridConfig,
  settings: DisplaySettings,
  plotBox: PlotBox = DEFAULT_PLOT_BOX,
): BuildResult {
  const points: SamplePoint[] = [];
  const errors: string[] = [];

  const xDenominator = Math.max(grid.xSteps - 1, 1);
  const yDenominator = Math.max(grid.ySteps - 1, 1);

  for (let row = 0; row < grid.ySteps; row += 1) {
    const y = viewport.yMax - ((viewport.yMax - viewport.yMin) * row) / yDenominator;

    for (let col = 0; col < grid.xSteps; col += 1) {
      const x = viewport.xMin + ((viewport.xMax - viewport.xMin) * col) / xDenominator;
      const screenX = mapXToScreen(x, viewport, plotBox);
      const screenY = mapYToScreen(y, viewport, plotBox);

      let slope: number | null = null;
      let segment = null;
      let valid = true;

      try {
        slope = evaluator.evaluate(x, y);
        segment = buildSegment(screenX, screenY, slope, grid, settings, plotBox);
      } catch (error) {
        valid = false;
        const message = error instanceof Error ? error.message : "Unknown evaluation error.";
        errors.push(`(${x.toFixed(2)}, ${y.toFixed(2)}): ${message}`);
      }

      points.push({
        id: `r${row}-c${col}`,
        x,
        y,
        slope,
        row,
        col,
        screenX,
        screenY,
        visible: false,
        valid,
        segment,
      });
    }
  }

  return { points, errors };
}

export function countValidPoints(points: SamplePoint[]) {
  return points.reduce((total, point) => total + Number(point.valid && point.segment !== null), 0);
}
