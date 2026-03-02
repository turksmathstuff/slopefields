import { DEFAULT_PLOT_BOX, getAxisPosition, mapXToScreen, mapYToScreen } from "../lib/coordinates";
import type { SamplePoint, Viewport } from "../types/slopeField";

type GraphPanelProps = {
  points: SamplePoint[];
  visibleIds: Set<string>;
  viewport: Viewport;
  animationMs: number;
  showGridPoints: boolean;
  highlightZeroSlope: boolean;
};

const ticks = [-4, -2, 0, 2, 4];
const ZERO_SLOPE_EPSILON = 1e-9;

export default function GraphPanel({
  points,
  visibleIds,
  viewport,
  animationMs,
  showGridPoints,
  highlightZeroSlope,
}: GraphPanelProps) {
  const plotBox = DEFAULT_PLOT_BOX;
  const { xAxisY, yAxisX } = getAxisPosition(viewport, plotBox);

  return (
    <section className="graph-shell">
      <div className="graph-header">
        <div>
          <p className="eyebrow">Visualization</p>
          <h2>Slope field construction</h2>
        </div>
        <p className="graph-note">SVG rendering with deterministic reveal patterns and line-based fills.</p>
      </div>
      <svg viewBox={`0 0 ${plotBox.width} ${plotBox.height}`} className="graph-svg" role="img" aria-label="Slope field graph">
        <defs>
          <linearGradient
            id="fieldGlow"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2={plotBox.width}
            y2={plotBox.height}
          >
            <stop offset="0%" stopColor="var(--accent-strong)" />
            <stop offset="100%" stopColor="var(--accent-soft)" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={plotBox.width} height={plotBox.height} rx="32" className="graph-backdrop" />

        {ticks.map((tick) =>
          tick >= viewport.xMin && tick <= viewport.xMax ? (
            <text
              key={`x-${tick}`}
              x={mapXToScreen(tick, viewport, plotBox)}
              y={plotBox.height - 26}
              textAnchor="middle"
              className="axis-label"
            >
              {tick}
            </text>
          ) : null,
        )}
        {ticks.map((tick) =>
          tick >= viewport.yMin && tick <= viewport.yMax ? (
            <text key={`y-${tick}`} x={20} y={mapYToScreen(tick, viewport, plotBox) + 4} className="axis-label">
              {tick}
            </text>
          ) : null,
        )}

        {xAxisY !== null ? (
          <line
            x1={plotBox.padding.left}
            x2={plotBox.width - plotBox.padding.right}
            y1={xAxisY}
            y2={xAxisY}
            className="axis-line"
          />
        ) : null}
        {yAxisX !== null ? (
          <line
            x1={yAxisX}
            x2={yAxisX}
            y1={plotBox.padding.top}
            y2={plotBox.height - plotBox.padding.bottom}
            className="axis-line"
          />
        ) : null}

        {showGridPoints
          ? points
              .filter((point) => point.valid)
              .map((point) => (
                <circle
                  key={`dot-${point.id}`}
                  cx={point.screenX}
                  cy={point.screenY}
                  r="2.2"
                  className={`grid-point ${visibleIds.has(point.id) ? "visible" : ""}`}
                />
              ))
          : null}

        {points
          .filter((point) => point.valid && point.segment)
          .map((point) => (
            <line
              key={point.id}
              x1={point.segment!.x1}
              y1={point.segment!.y1}
              x2={point.segment!.x2}
              y2={point.segment!.y2}
              className={`slope-segment ${visibleIds.has(point.id) ? "visible" : ""} ${
                highlightZeroSlope &&
                point.slope !== null &&
                Math.abs(point.slope) <= ZERO_SLOPE_EPSILON
                  ? "zero-slope"
                  : ""
              }`}
              style={{ ["--segment-duration" as string]: `${animationMs}ms` }}
            />
          ))}
      </svg>
    </section>
  );
}
