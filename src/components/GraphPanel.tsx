import { DEFAULT_PLOT_BOX, getAxisPosition, mapXToScreen, mapYToScreen } from "../lib/coordinates";
import type { SamplePoint, Viewport } from "../types/slopeField";

type GraphPanelProps = {
  points: SamplePoint[];
  visibleIds: Set<string>;
  viewport: Viewport;
  animationMs: number;
  showGridPoints: boolean;
  highlightZeroSlope: boolean;
  recentRevealIds: Set<string>;
  recentRevealMode: "row" | "column" | null;
  revealVersion: number;
  staggerMs: number;
};

const ZERO_SLOPE_EPSILON = 1e-9;

function buildTicks(min: number, max: number) {
  const span = max - min;
  if (span <= 0) {
    return [];
  }

  const roughStep = span / 4;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;

  let step = magnitude;
  if (normalized >= 5) {
    step = 5 * magnitude;
  } else if (normalized >= 2) {
    step = 2 * magnitude;
  }

  const firstTick = Math.ceil(min / step) * step;
  const ticks: number[] = [];

  for (let tick = firstTick; tick <= max + step * 0.25; tick += step) {
    const rounded = Number(tick.toFixed(8));
    ticks.push(Object.is(rounded, -0) ? 0 : rounded);
  }

  return ticks;
}

export default function GraphPanel({
  points,
  visibleIds,
  viewport,
  animationMs,
  showGridPoints,
  highlightZeroSlope,
  recentRevealIds,
  recentRevealMode,
  revealVersion,
  staggerMs,
}: GraphPanelProps) {
  const plotBox = DEFAULT_PLOT_BOX;
  const { xAxisY, yAxisX } = getAxisPosition(viewport, plotBox);
  const xTicks = buildTicks(viewport.xMin, viewport.xMax);
  const yTicks = buildTicks(viewport.yMin, viewport.yMax);

  return (
    <section className="graph-shell">
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

        {xTicks.map((tick) => (
          <text
            key={`x-${tick}`}
            x={mapXToScreen(tick, viewport, plotBox)}
            y={plotBox.height - 26}
            textAnchor="middle"
            className="axis-label"
          >
            {tick}
          </text>
        ))}
        {yTicks.map((tick) => (
          <text key={`y-${tick}`} x={20} y={mapYToScreen(tick, viewport, plotBox) + 4} className="axis-label">
            {tick}
          </text>
        ))}

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
          .map((point) => {
            const isRecent = recentRevealIds.has(point.id);
            const staggerIndex =
              recentRevealMode === "row" ? point.col : recentRevealMode === "column" ? point.row : 0;

            return (
              <line
                key={isRecent ? `${point.id}-${revealVersion}` : point.id}
                x1={point.segment!.x1}
                y1={point.segment!.y1}
                x2={point.segment!.x2}
                y2={point.segment!.y2}
                className={`slope-segment ${visibleIds.has(point.id) ? "visible" : ""} ${
                  isRecent && recentRevealMode ? "staggered" : ""
                } ${
                  highlightZeroSlope &&
                  point.slope !== null &&
                  Math.abs(point.slope) <= ZERO_SLOPE_EPSILON
                    ? "zero-slope"
                    : ""
                }`}
                style={{
                  ["--segment-duration" as string]: `${animationMs}ms`,
                  ["--segment-delay" as string]: `${isRecent ? staggerIndex * staggerMs : 0}ms`,
                }}
              />
            );
          })}
      </svg>
    </section>
  );
}
