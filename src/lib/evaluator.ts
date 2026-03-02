import { all, create, type FunctionNode, type MathJsStatic, type MathNode, type SymbolNode } from "mathjs";
import type { EquationEvaluator } from "../types/slopeField";

const math = create(all, {}) as MathJsStatic;
const ALLOWED_VARIABLES = new Set(["x", "y"]);
const ALLOWED_CONSTANTS = new Set(["e", "pi", "tau", "phi", "Infinity", "NaN"]);

function validateSymbols(node: MathNode) {
  const unknown = new Set<string>();

  node.traverse((child, _path, parent) => {
    if (child.type !== "SymbolNode") {
      return;
    }

    const symbolChild = child as SymbolNode;

    if (ALLOWED_VARIABLES.has(symbolChild.name) || ALLOWED_CONSTANTS.has(symbolChild.name)) {
      return;
    }

    if (parent?.type === "FunctionNode" && (parent as FunctionNode).fn === child) {
      return;
    }

    unknown.add(symbolChild.name);
  });

  if (unknown.size > 0) {
    throw new Error(`Unknown symbol${unknown.size > 1 ? "s" : ""}: ${[...unknown].join(", ")}`);
  }
}

export function createEquationEvaluator(expression: string): EquationEvaluator {
  const trimmed = expression.trim();

  if (!trimmed) {
    throw new Error("Enter an equation in terms of x and y.");
  }

  const node = math.parse(trimmed);
  validateSymbols(node);
  const compiled = node.compile();

  return {
    expression: trimmed,
    evaluate: (x: number, y: number) => {
      const result = compiled.evaluate({ x, y });

      if (typeof result !== "number") {
        throw new Error("Expression must evaluate to a real number.");
      }

      return result;
    },
  };
}
