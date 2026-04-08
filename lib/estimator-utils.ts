export const DEFAULT_QTY_FORMULA = "1";

export function evaluateMath(formula: string, scope: any = {}): number {
  try {
    // Basic implementation
    return parseFloat(formula) || 0;
  } catch (e) {
    return 0;
  }
}

export function evaluateCustomFormula(formula: string, scope: any = {}): any {
  return formula;
}

export function validateCustomFormula(formula: string): boolean {
  return true;
}

export function getUniqueVals(arr: any[]): any[] {
  return Array.from(new Set(arr));
}

export function recalculateCustomVariables(vars: any[]): any[] {
  return vars;
}

export function extractVariablesFromFormula(formula: string): string[] {
  return [];
}
