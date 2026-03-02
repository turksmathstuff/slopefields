export type Viewport = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

export type GridConfig = {
  xSteps: number;
  ySteps: number;
};

export type DisplaySettings = {
  segmentScale: number;
  animationMs: number;
  showGridPoints: boolean;
  highlightZeroSlope: boolean;
};

export type EquationEvaluator = {
  expression: string;
  evaluate: (x: number, y: number) => number;
};

export type RevealMode =
  | "segment"
  | "row"
  | "column"
  | "line:y=x"
  | "line:y=-x"
  | "all";

export type SegmentGeometry = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type SamplePoint = {
  id: string;
  x: number;
  y: number;
  slope: number | null;
  row: number;
  col: number;
  screenX: number;
  screenY: number;
  visible: boolean;
  valid: boolean;
  segment: SegmentGeometry | null;
};

export type RevealState = {
  visibleIds: Set<string>;
  nextSegmentIndex: number;
  nextRowIndex: number;
  nextColIndex: number;
};

export type BuildResult = {
  points: SamplePoint[];
  errors: string[];
};
