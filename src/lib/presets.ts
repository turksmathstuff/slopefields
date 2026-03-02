export type PresetEquation = {
  label: string;
  expression: string;
  note: string;
};

export const PRESET_EQUATIONS: PresetEquation[] = [
  { label: "Linear pull", expression: "x - y", note: "Classic diagonal balance." },
  { label: "Additive plane", expression: "x + y", note: "Positive quadrants lean together." },
  { label: "Trig drift", expression: "sin(x) - y", note: "Periodic forcing with damping." },
  { label: "Nonlinear bowl", expression: "x / (1 + y^2)", note: "Flattening as |y| grows." },
];
