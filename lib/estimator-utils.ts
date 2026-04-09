import { create, all } from 'mathjs';

const math = create(all);

export const DEFAULT_QTY_FORMULA = "1";

export function evaluateMath(formula: string, scope: any = {}): number {
  try {
    const result = math.evaluate(formula, scope);
    return typeof result === 'number' ? result : parseFloat(result) || 0;
  } catch (e) {
    return 0;
  }
}

export function evaluateCustomFormula(
  formula: string,
  qty: any = 0,
  overage: any = 0,
  orderQty: any = 0,
  customVars: any[] = [],
  dynamicCols: any = {},
  dataTables: any[] = []
): any {
  try {
    const scope: Record<string, any> = {
      qty: parseFloat(qty) || 0,
      overage: parseFloat(overage) || 0,
      orderQty: parseFloat(orderQty) || 0,
      ...dynamicCols
    };

    // Add custom variables to scope
    customVars.forEach(v => {
      scope[v.name] = v.value;
    });

    // Add data tables to scope if needed (this might need more logic depending on how they are used)
    // For now just basic math evaluation
    return math.evaluate(formula, scope);
  } catch (e) {
    return 0;
  }
}

export function validateCustomFormula(formula: string, customVars: any[] = [], dynamicCols: any = {}, variableRegistry: any = {}, dataTables: any[] = []): { isValid: boolean; error?: string } {
  try {
    math.parse(formula);
    return { isValid: true };
  } catch (e: any) {
    return { isValid: false, error: e.message };
  }
}

export function getUniqueVals(arr: any[], key: string): any[] {
  if (!Array.isArray(arr)) return [];
  return Array.from(new Set(arr.map(item => item[key]).filter(val => val !== undefined && val !== null && val !== '')));
}

export function recalculateCustomVariables(vars: any[]): any[] {
  const scope: Record<string, any> = {};
  return vars.map(v => {
    const value = evaluateCustomFormula(v.formula, scope);
    scope[v.name] = value;
    return { ...v, value };
  });
}

export function extractVariablesFromFormula(formula: string): string[] {
  try {
    const node = math.parse(formula);
    const variables: string[] = [];
    node.traverse((n: any) => {
      if ((n as any).isSymbolNode) {
        variables.push((n as any).name);
      }
    });
    return Array.from(new Set(variables));
  } catch (e) {
    return [];
  }
}
