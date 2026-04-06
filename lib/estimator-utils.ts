import { CustomVariable, Item } from "./types";
import { normalizeKey, buildContext, evaluateFormula, validateFormula as validateEngineFormula } from '../services/formulaEngine';

export const DEFAULT_QTY_FORMULA = "[qty] * (1 + [overage_pct] / 100)";

export function evaluateMath(expression: string): number | string {
  if (!expression || typeof expression !== 'string') return "";
  try {
    const result = evaluateFormula(expression, {});
    if (result === "ERR") return "";
    return typeof result === 'number' ? result : "";
  } catch (e) {
    return "";
  }
}

export function extractVariablesFromFormula(formula: string): string[] {
  const varRegex = /\[([^\]]+)\]/g;
  const variables: string[] = [];
  let match;
  while ((match = varRegex.exec(formula)) !== null) {
    variables.push(match[1]);
  }
  return Array.from(new Set(variables));
}

export function getUniqueVals<T>(array: T[], key: keyof T): string[] {
  if (!array) return [];
  const vals = array.map(item => String(item[key] || ""));
  return Array.from(new Set(vals)).filter(v => v !== "").sort();
}

export function recalculateCustomVariables(variables: CustomVariable[]): CustomVariable[] {
  const newVars = [...variables];
  const varMap: Record<string, CustomVariable> = {};
  const scope: Record<string, number> = {};
  
  // Initialize scope and map
  newVars.forEach(v => {
    const key = normalizeKey(v.name);
    varMap[key] = v;
    scope[key] = 0;
  });

  // Build dependency graph
  const adj: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};
  
  newVars.forEach(v => {
    const targetKey = normalizeKey(v.name);
    if (!inDegree[targetKey]) inDegree[targetKey] = 0;
    
    if (v.formula) {
      const deps = extractVariablesFromFormula(v.formula);
      deps.forEach(d => {
        const sourceKey = normalizeKey(d);
        if (varMap[sourceKey]) {
          if (!adj[sourceKey]) adj[sourceKey] = [];
          adj[sourceKey].push(targetKey);
          inDegree[targetKey]++;
        }
      });
    }
  });

  // Topological sort (Kahn's algorithm)
  const queue: string[] = [];
  Object.keys(varMap).forEach(key => {
    if ((inDegree[key] || 0) === 0) {
      queue.push(key);
    }
  });

  const sorted: string[] = [];
  while (queue.length > 0) {
    const u = queue.shift()!;
    sorted.push(u);
    
    if (adj[u]) {
      adj[u].forEach(v => {
        inDegree[v]--;
        if (inDegree[v] === 0) {
          queue.push(v);
        }
      });
    }
  }

  // Handle cycles or missing variables by adding remaining variables
  if (sorted.length < Object.keys(varMap).length) {
    Object.keys(varMap).forEach(key => {
      if (!sorted.includes(key)) sorted.push(key);
    });
  }

  // Calculate in sorted order
  sorted.forEach(key => {
    const v = varMap[key];
    if (v && v.formula) {
      try {
        const context: Record<string, any> = { ...scope };
        // Add math functions
        context['ROUNDUP'] = (val: number, decimals: number = 0) => {
          const multiplier = Math.pow(10, decimals);
          return Math.ceil(val * multiplier) / multiplier;
        };
        context['ROUNDDOWN'] = (val: number, decimals: number = 0) => {
          const multiplier = Math.pow(10, decimals);
          return Math.floor(val * multiplier) / multiplier;
        };
        context['ROUND'] = (val: number, decimals: number = 0) => {
          const multiplier = Math.pow(10, decimals);
          return Math.round(val * multiplier) / multiplier;
        };
        context['IF'] = (condition: any, trueVal: any, falseVal: any) => condition ? trueVal : falseVal;
        context['AND'] = (...args: any[]) => args.every(Boolean);
        context['OR'] = (...args: any[]) => args.some(Boolean);
        context['NOT'] = (val: any) => !val;
        context['MAX'] = Math.max;
        context['MIN'] = Math.min;
        context['CEILING'] = Math.ceil;
        context['FLOOR'] = Math.floor;
        context['ABS'] = Math.abs;
        context['SQRT'] = Math.sqrt;
        context['POWER'] = Math.pow;

        const result = evaluateFormula(v.formula, context);
        if (typeof result === 'number') {
          scope[key] = result;
          v.value = result;
        }
      } catch (e) {
        v.value = 0;
        scope[key] = 0;
      }
    }
  });
  
  return newVars;
}

export function evaluateCustomFormula(
  formula: string,
  qty: string | number,
  overagePct: string | number,
  orderQty: string | number,
  customVariables: CustomVariable[],
  dynamicScope: Record<string, any> = {},
  dataTables: any[] = []
): number | string {
  if (!formula) return 0;
  
  const row = {
    qty,
    overage_pct: overagePct,
    order_qty: orderQty,
    takeoff: qty
  };

  const context = buildContext(row, [], customVariables, dynamicScope);

  // Add lookup function
  context['LOOKUP'] = (tableName: string, searchCol: string, searchVal: any, resultCol: string) => {
    const table = dataTables.find(t => t.name === tableName);
    if (!table) throw new Error(`Table not found: ${tableName}`);
    const r = table.rows.find((r: any) => String(r[searchCol]) === String(searchVal));
    if (!r) throw new Error(`Value not found in table: ${searchVal}`);
    const result = r[resultCol];
    if (result === undefined) throw new Error(`Column not found: ${resultCol}`);
    const numResult = Number(result);
    return !isNaN(numResult) && isFinite(numResult) ? numResult : result;
  };

  return evaluateFormula(formula, context);
}

export function validateCustomFormula(
  formula: string,
  customVariables: CustomVariable[],
  dynamicScope: Record<string, any> = {},
  variableRegistry: any = {},
  dataTables: any[] = []
): { isValid: boolean; error?: string } {
  if (!formula) return { isValid: true };
  
  const row = {
    qty: 1,
    overage_pct: 1,
    order_qty: 1,
    takeoff: 1
  };

  const context = buildContext(row, [], customVariables, dynamicScope);
  
  // Add variable registry to context
  Object.keys(variableRegistry).forEach(k => {
    context[normalizeKey(k)] = 1;
  });

  // Add lookup function
  context['LOOKUP'] = (tableName: string, searchCol: string, searchVal: any, resultCol: string) => 1;

  return validateEngineFormula(formula, context);
}

