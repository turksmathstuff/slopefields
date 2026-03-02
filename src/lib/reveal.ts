import type { GridConfig, RevealState, SamplePoint } from "../types/slopeField";

function isRevealable(point: SamplePoint) {
  return point.valid && point.segment !== null;
}

function cloneVisible(visibleIds: Set<string>) {
  return new Set<string>(visibleIds);
}

function updateIndexes(points: SamplePoint[], visibleIds: Set<string>, grid: GridConfig) {
  const nextSegmentIndex = points.findIndex((point) => isRevealable(point) && !visibleIds.has(point.id));

  let nextRowIndex = grid.ySteps;
  for (let row = 0; row < grid.ySteps; row += 1) {
    if (points.some((point) => point.row === row && isRevealable(point) && !visibleIds.has(point.id))) {
      nextRowIndex = row;
      break;
    }
  }

  let nextColIndex = grid.xSteps;
  for (let col = 0; col < grid.xSteps; col += 1) {
    if (points.some((point) => point.col === col && isRevealable(point) && !visibleIds.has(point.id))) {
      nextColIndex = col;
      break;
    }
  }

  return {
    visibleIds,
    nextSegmentIndex,
    nextRowIndex,
    nextColIndex,
  };
}

export function createInitialRevealState(points: SamplePoint[], grid: GridConfig): RevealState {
  return updateIndexes(points, new Set<string>(), grid);
}

export function revealNextSegment(
  points: SamplePoint[],
  current: RevealState,
  grid: GridConfig,
): RevealState {
  const visibleIds = cloneVisible(current.visibleIds);
  const nextPoint = points.find((point) => isRevealable(point) && !visibleIds.has(point.id));

  if (nextPoint) {
    visibleIds.add(nextPoint.id);
  }

  return updateIndexes(points, visibleIds, grid);
}

export function revealNextRow(
  points: SamplePoint[],
  current: RevealState,
  grid: GridConfig,
): RevealState {
  const visibleIds = cloneVisible(current.visibleIds);
  const row = points.find((point) => isRevealable(point) && !visibleIds.has(point.id))?.row;

  if (row === undefined) {
    return updateIndexes(points, visibleIds, grid);
  }

  points.forEach((point) => {
    if (isRevealable(point) && point.row === row) {
      visibleIds.add(point.id);
    }
  });

  return updateIndexes(points, visibleIds, grid);
}

export function revealNextColumn(
  points: SamplePoint[],
  current: RevealState,
  grid: GridConfig,
): RevealState {
  const visibleIds = cloneVisible(current.visibleIds);

  for (let col = 0; col < grid.xSteps; col += 1) {
    const hasHidden = points.some(
      (point) => isRevealable(point) && point.col === col && !visibleIds.has(point.id),
    );
    if (!hasHidden) {
      continue;
    }

    points.forEach((point) => {
      if (isRevealable(point) && point.col === col) {
        visibleIds.add(point.id);
      }
    });
    break;
  }

  return updateIndexes(points, visibleIds, grid);
}

export function revealAlongLine(
  points: SamplePoint[],
  current: RevealState,
  grid: GridConfig,
  line: "y=x" | "y=-x",
  tolerance: number,
): RevealState {
  const visibleIds = cloneVisible(current.visibleIds);

  points.forEach((point) => {
    if (!isRevealable(point)) {
      return;
    }

    const distance = line === "y=x" ? Math.abs(point.y - point.x) : Math.abs(point.y + point.x);
    if (distance <= tolerance) {
      visibleIds.add(point.id);
    }
  });

  return updateIndexes(points, visibleIds, grid);
}

export function revealAlongCustomLine(
  points: SamplePoint[],
  current: RevealState,
  grid: GridConfig,
  matchesPoint: (point: SamplePoint) => boolean,
): RevealState {
  const visibleIds = cloneVisible(current.visibleIds);

  points.forEach((point) => {
    if (!isRevealable(point) || !matchesPoint(point)) {
      return;
    }
    visibleIds.add(point.id);
  });

  return updateIndexes(points, visibleIds, grid);
}

export function revealAll(points: SamplePoint[], grid: GridConfig): RevealState {
  const visibleIds = new Set(points.filter(isRevealable).map((point) => point.id));
  return updateIndexes(points, visibleIds, grid);
}
