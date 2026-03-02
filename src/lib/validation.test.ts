import { describe, expect, it } from "vitest";
import { MAX_POINTS, validateGrid, validateViewport } from "./validation";

describe("validation", () => {
  it("blocks invalid bounds", () => {
    expect(validateViewport({ xMin: 1, xMax: 1, yMin: -1, yMax: 1 })).toMatch(/xMin/);
    expect(validateViewport({ xMin: -1, xMax: 1, yMin: 2, yMax: 1 })).toMatch(/yMin/);
  });

  it("blocks oversized grids", () => {
    expect(validateGrid({ xSteps: MAX_POINTS, ySteps: 2 })).toMatch(/too dense/i);
  });
});
