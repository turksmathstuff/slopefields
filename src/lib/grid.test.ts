import { describe, expect, it } from "vitest";
import { buildSlopeField } from "./grid";
import type { DisplaySettings, GridConfig, Viewport } from "../types/slopeField";

const viewport: Viewport = { xMin: -1, xMax: 1, yMin: -1, yMax: 1 };
const grid: GridConfig = { xSteps: 3, ySteps: 3 };
const settings: DisplaySettings = {
  segmentScale: 0.5,
  animationMs: 200,
  showGridPoints: true,
  highlightZeroSlope: true,
};

describe("buildSlopeField", () => {
  it("creates the expected number of points with row and column metadata", () => {
    const evaluator = { expression: "x-y", evaluate: (x: number, y: number) => x - y };
    const result = buildSlopeField(evaluator, viewport, grid, settings);

    expect(result.points).toHaveLength(9);
    expect(result.points[0].row).toBe(0);
    expect(result.points[0].col).toBe(0);
    expect(result.points[8].row).toBe(2);
    expect(result.points[8].col).toBe(2);
  });

  it("omits vertical segments for infinite slopes", () => {
    const evaluator = { expression: "vertical", evaluate: () => Number.POSITIVE_INFINITY };
    const result = buildSlopeField(evaluator, viewport, grid, settings);
    const first = result.points[0].segment;

    expect(first).toBeNull();
  });

  it("renders horizontal segments when the slope is zero", () => {
    const evaluator = { expression: "zero", evaluate: () => 0 };
    const result = buildSlopeField(evaluator, viewport, grid, settings);
    const first = result.points[0].segment;

    expect(first?.y1).toBe(first?.y2);
    expect(first?.x1).not.toBe(first?.x2);
  });
});
