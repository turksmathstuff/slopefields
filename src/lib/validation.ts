import type { GridConfig, Viewport } from "../types/slopeField";

export const MAX_POINTS = 900;

export function validateViewport(viewport: Viewport) {
  if (viewport.xMin >= viewport.xMax) {
    return "xMin must be less than xMax.";
  }

  if (viewport.yMin >= viewport.yMax) {
    return "yMin must be less than yMax.";
  }

  return null;
}

export function validateGrid(grid: GridConfig) {
  if (grid.xSteps < 2 || grid.ySteps < 2) {
    return "Grid steps must be at least 2 in both directions.";
  }

  if (grid.xSteps * grid.ySteps > MAX_POINTS) {
    return `Grid is too dense. Keep total points at or below ${MAX_POINTS}.`;
  }

  return null;
}

export function lineTolerance(viewport: Viewport, grid: GridConfig) {
  const xSpacing = (viewport.xMax - viewport.xMin) / Math.max(grid.xSteps - 1, 1);
  const ySpacing = (viewport.yMax - viewport.yMin) / Math.max(grid.ySteps - 1, 1);
  return Math.max(xSpacing, ySpacing) / 2;
}
