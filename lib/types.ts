export interface Item {
  item_id: string;
  item_name: string;
  uom: string;
}

export interface TakeoffItem extends Item {
  quantity: number;
  unit_price: string;
  total: number;
}

export interface CustomVariable {
  name: string;
  value: string;
}

export interface DynamicColumn {
  id: string;
  name: string;
}

export interface Client {
  id: string;
  name: string;
}

export interface FormulaTemplate {
  id: string;
  name: string;
  formula: string;
}

export interface DataTable {
  id: string;
  name: string;
  data: any[];
}

export interface ConditionalFormatRule {
  id: string;
  condition: string;
  style: any;
}

export interface HistoryRecord {
  timestamp: string;
  action: string;
  dataState: any;
  catalogState: any;
  projectName: string;
  clientName: string;
  jobNotes: string;
  customVariables: any;
  dynamicColumns: any;
  entityData: any;
  formulaTemplates: any;
  dataTables: any;
  conditionalFormatRules: any;
}

export interface Job {
  id: string;
  name: string;
  data: any;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  data: any;
}

export interface FullBackup {
  version: string;
  date: string;
  data: any;
}
