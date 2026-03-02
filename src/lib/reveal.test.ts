import { describe, expect, it } from "vitest";
import { createInitialRevealState, revealAlongLine, revealNextColumn, revealNextRow, revealNextSegment } from "./reveal";
import type { GridConfig, SamplePoint } from "../types/slopeField";

const grid: GridConfig = { xSteps: 3, ySteps: 3 };

const points: SamplePoint[] = [
  { id: "r0-c0", x: -1, y: 1, slope: 0, row: 0, col: 0, screenX: 0, screenY: 0, visible: false, valid: true, segment: { x1: 0, y1: 0, x2: 1, y2: 1 } },
  { id: "r0-c1", x: 0, y: 1, slope: 0, row: 0, col: 1, screenX: 0, screenY: 0, visible: false, valid: true, segment: { x1: 0, y1: 0, x2: 1, y2: 1 } },
  { id: "r0-c2", x: 1, y: 1, slope: 0, row: 0, col: 2, screenX: 0, screenY: 0, visible: false, valid: true, segment: { x1: 0, y1: 0, x2: 1, y2: 1 } },
  { id: "r1-c0", x: -1, y: 0, slope: 0, row: 1, col: 0, screenX: 0, screenY: 0, visible: false, valid: true, segment: { x1: 0, y1: 0, x2: 1, y2: 1 } },
  { id: "r1-c1", x: 0, y: 0, slope: 0, row: 1, col: 1, screenX: 0, screenY: 0, visible: false, valid: true, segment: { x1: 0, y1: 0, x2: 1, y2: 1 } },
  { id: "r1-c2", x: 1, y: 0, slope: 0, row: 1, col: 2, screenX: 0, screenY: 0, visible: false, valid: true, segment: { x1: 0, y1: 0, x2: 1, y2: 1 } },
  { id: "r2-c0", x: -1, y: -1, slope: 0, row: 2, col: 0, screenX: 0, screenY: 0, visible: false, valid: true, segment: { x1: 0, y1: 0, x2: 1, y2: 1 } },
  { id: "r2-c1", x: 0, y: -1, slope: 0, row: 2, col: 1, screenX: 0, screenY: 0, visible: false, valid: true, segment: { x1: 0, y1: 0, x2: 1, y2: 1 } },
  { id: "r2-c2", x: 1, y: -1, slope: 0, row: 2, col: 2, screenX: 0, screenY: 0, visible: false, valid: true, segment: { x1: 0, y1: 0, x2: 1, y2: 1 } },
];

describe("reveal logic", () => {
  it("reveals one segment at a time", () => {
    const initial = createInitialRevealState(points, grid);
    const next = revealNextSegment(points, initial, grid);
    expect(next.visibleIds.size).toBe(1);
    expect(next.visibleIds.has("r0-c0")).toBe(true);
  });

  it("reveals one row at a time", () => {
    const initial = createInitialRevealState(points, grid);
    const next = revealNextRow(points, initial, grid);
    expect(next.visibleIds.size).toBe(3);
    expect(next.visibleIds.has("r0-c1")).toBe(true);
  });

  it("reveals one column at a time", () => {
    const initial = createInitialRevealState(points, grid);
    const next = revealNextColumn(points, initial, grid);
    expect(next.visibleIds.size).toBe(3);
    expect(next.visibleIds.has("r1-c0")).toBe(true);
  });

  it("reveals diagonal line members without duplicating visible points", () => {
    const initial = createInitialRevealState(points, grid);
    const rowRevealed = revealNextRow(points, initial, grid);
    const diagonal = revealAlongLine(points, rowRevealed, grid, "y=x", 0.01);

    expect(diagonal.visibleIds.has("r0-c2")).toBe(true);
    expect(diagonal.visibleIds.has("r1-c1")).toBe(true);
    expect(diagonal.visibleIds.has("r2-c0")).toBe(true);
    expect(diagonal.visibleIds.size).toBe(5);
  });
});
