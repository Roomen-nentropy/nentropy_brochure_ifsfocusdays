export type ChecklistUiMode =
  | 'live_table'
  | 'entry_table'
  | 'progressive_lock_table'
  | 'progressive_lock_respawn'
  | 'one_shot_list'
  | 'one_shot_plant_fanout'
  | 'simple_form';

export interface ChecklistColumn {
  id: string;
  label: string;
  type?: string;
}

export type ChecklistLookupKind = 'supplier' | 'product_batch_by_supplier';

export interface ChecklistField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  options?: string[];
  lookup?: ChecklistLookupKind;
  dependsOn?: string;
}

export interface ChecklistDefinition {
  uiMode: ChecklistUiMode;
  columns?: ChecklistColumn[];
  fields?: ChecklistField[];
  defaults?: Record<string, string>;
  lockLastRowOnSave?: boolean;
  doubleConfirm?: boolean;
  commentsColumnId?: string;
}

export interface TableRow {
  id: string;
  cells: Record<string, string>;
}

export interface TableState {
  rows: TableRow[];
  lockedCells: Record<string, boolean>;
  lockedRows?: string[];
}

export function parseTableState(raw: unknown): TableState {
  if (!raw || typeof raw !== 'object') {
    return { rows: [], lockedCells: {} };
  }
  const t = raw as TableState;
  return {
    rows: Array.isArray(t.rows) ? t.rows : [],
    lockedCells: t.lockedCells ?? {},
    lockedRows: t.lockedRows ?? [],
  };
}

export function cellKey(rowId: string, colId: string) {
  return `${rowId}|${colId}`;
}

export function newRowId() {
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
