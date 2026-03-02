import { describe, expect, it } from "vitest";
import { createEquationEvaluator } from "./evaluator";

describe("createEquationEvaluator", () => {
  it("accepts valid expressions", () => {
    expect(createEquationEvaluator("x - y").evaluate(3, 1)).toBe(2);
    expect(createEquationEvaluator("sin(x) + y^2").evaluate(0, 2)).toBe(4);
    expect(createEquationEvaluator("x / (1 + y^2)").evaluate(4, 1)).toBe(2);
  });

  it("rejects malformed syntax", () => {
    expect(() => createEquationEvaluator("x - ")).toThrow();
  });

  it("rejects unknown variables", () => {
    expect(() => createEquationEvaluator("x + z")).toThrow(/Unknown symbol/);
  });
});
