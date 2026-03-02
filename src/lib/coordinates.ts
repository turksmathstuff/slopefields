import type { Viewport } from "../types/slopeField";

export type PlotBox = {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
};

export const DEFAULT_PLOT_BOX: PlotBox = {
  width: 860,
  height: 860,
  padding: { top: 48, right: 48, bottom: 72, left: 72 },
};

export function mapXToScreen(x: number, viewport: Viewport, plotBox: PlotBox): number {
  const innerWidth = plotBox.width - plotBox.padding.left - plotBox.padding.right;
  return plotBox.padding.left + ((x - viewport.xMin) / (viewport.xMax - viewport.xMin)) * innerWidth;
}

export function mapYToScreen(y: number, viewport: Viewport, plotBox: PlotBox): number {
  const innerHeight = plotBox.height - plotBox.padding.top - plotBox.padding.bottom;
  return plotBox.padding.top + ((viewport.yMax - y) / (viewport.yMax - viewport.yMin)) * innerHeight;
}

export function getAxisPosition(viewport: Viewport, plotBox: PlotBox) {
  const xAxisY =
    viewport.yMin <= 0 && viewport.yMax >= 0 ? mapYToScreen(0, viewport, plotBox) : null;
  const yAxisX =
    viewport.xMin <= 0 && viewport.xMax >= 0 ? mapXToScreen(0, viewport, plotBox) : null;

  return { xAxisY, yAxisX };
}
