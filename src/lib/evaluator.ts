import { all, create, type FunctionNode, type MathJsStatic, type MathNode, type SymbolNode } from "mathjs";
import type { EquationEvaluator } from "../types/slopeField";

const math = create(all, {}) as MathJsStatic;
const ALLOWED_VARIABLES = new Set(["x", "y"]);
const ALLOWED_CONSTANTS = new Set(["e", "pi", "tau", "phi", "Infinity", "NaN"]);

function validateSymbols(node: MathNode, allowedVariables: Set<string>) {
  const unknown = new Set<string>();

  node.traverse((child, _path, parent) => {
    if (child.type !== "SymbolNode") {
      return;
    }

    const symbolChild = child as SymbolNode;

    if (allowedVariables.has(symbolChild.name) || ALLOWED_CONSTANTS.has(symbolChild.name)) {
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
  validateSymbols(node, ALLOWED_VARIABLES);
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

export type LineEvaluator =
  | {
      axis: "y";
      expression: string;
      evaluate: (x: number) => number;
    }
  | {
      axis: "x";
      expression: string;
      evaluate: (y: number) => number;
    };

export function createLineEvaluator(input: string): LineEvaluator {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("Enter a line such as y = x or y = 2x + 1.");
  }

  const match = trimmed.match(/^([xyXY])\s*=\s*(.+)$/);
  if (!match) {
    throw new Error("Use the format y = expression or x = expression.");
  }

  const axis = match[1].toLowerCase() as "x" | "y";
  const expression = match[2].trim();
  const variable = axis === "y" ? "x" : "y";
  const node = math.parse(expression);
  validateSymbols(node, new Set([variable]));
  const compiled = node.compile();

  if (axis === "y") {
    return {
      axis,
      expression,
      evaluate: (x: number) => {
        const result = compiled.evaluate({ x });
        if (typeof result !== "number" || !Number.isFinite(result)) {
          throw new Error("Custom reveal must evaluate to a finite number.");
        }
        return result;
      },
    };
  }

  return {
    axis,
    expression,
    evaluate: (y: number) => {
      const result = compiled.evaluate({ y });
      if (typeof result !== "number" || !Number.isFinite(result)) {
        throw new Error("Custom reveal must evaluate to a finite number.");
      }
      return result;
    },
  };
}
