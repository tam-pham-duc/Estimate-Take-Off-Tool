export interface Item {
  item_id: string;
  item_name: string;
  uom: string;
  category: string;
  sub_category: string;
  sub_item_1: string;
  calc_factor_instruction?: string;
  unit_price?: string | number;
  notes?: string;
}

export interface TakeoffItem extends Item {
  in_scope: boolean;
  spec: string;
  qty: any;
  measured_qty: any;
  overage_pct: string;
  order_qty: any;
  evidence: string;
  qty_mode: 'auto' | 'manual';
  custom_formula: string;
  unit_price: string;
  total: number;
}

export interface CustomVariable {
  id: string;
  name: string;
  formula: string;
  value: any;
  description?: string;
}

export interface DynamicColumn {
  id: string;
  name: string;
  key: string;
  dataType: 'number' | 'text' | 'boolean';
  scope: 'category' | 'subcategory' | 'itemgroup' | 'material' | 'global';
  unit: string;
  defaultValue: string;
  category?: string;
  subCategory?: string;
  itemGroup?: string;
  materialName?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export interface FormulaTemplate {
  id: string;
  name: string;
  formula: string;
  variables: string[];
  description: string;
  scope: string;
  category?: string;
  subCategory?: string;
  itemGroup?: string;
  materialName?: string;
  createdAt?: string;
}

export interface DataTable {
  id: string;
  name: string;
  columns: { key: string; name: string; type: string }[];
  rows: any[];
}

export interface ConditionalFormatRule {
  id: string;
  field: string;
  operator: string;
  value: string;
  color: string;
  applyTo: 'row' | 'cell';
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
  projectName: string;
  clientName: string;
  jobNotes: string;
  takeoffData: Record<string, TakeoffItem>;
  history: HistoryRecord[];
  lastSaved: string;
  customVariables: CustomVariable[];
  dynamicColumns: DynamicColumn[];
  entityData: Record<string, Record<string, any>>;
  formulaTemplates: FormulaTemplate[];
  dataTables: DataTable[];
  conditionalFormatRules: ConditionalFormatRule[];
  catalog: Item[];
  defaultOveragePct: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  catalog: Item[];
  takeoffData: Record<string, TakeoffItem>;
  customVariables: CustomVariable[];
  dynamicColumns: DynamicColumn[];
  entityData: Record<string, Record<string, any>>;
  formulaTemplates: FormulaTemplate[];
  dataTables: DataTable[];
  conditionalFormatRules: ConditionalFormatRule[];
  defaultOveragePct: string;
  jobNotes: string;
  createdAt: string;
}

export interface FullBackup {
  version: string;
  timestamp: string;
  catalog: Item[];
  takeoffData: Record<string, TakeoffItem>;
  customVariables: CustomVariable[];
  projectName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  jobNotes: string;
  defaultOveragePct: string;
  savedJobs: Record<string, Job>;
  dynamicColumns: DynamicColumn[];
  entityData: Record<string, Record<string, any>>;
  formulaTemplates: FormulaTemplate[];
  dataTables: DataTable[];
  clients: Client[];
  templates: ProjectTemplate[];
  conditionalFormatRules: ConditionalFormatRule[];
}
