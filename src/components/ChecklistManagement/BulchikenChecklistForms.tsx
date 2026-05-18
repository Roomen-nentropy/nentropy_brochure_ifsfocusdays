import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../services';
import {
  Box,
  Button,
  Stack,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Plus, Trash2 } from 'lucide-react';
import type {
  ChecklistDefinition,
  ChecklistField,
  TableRow as TRow,
  TableState,
} from '../../lib/checklistFormTypes';
import {
  cellKey,
  newRowId,
  parseTableState,
} from '../../lib/checklistFormTypes';
import { ChecklistLookupField } from './ChecklistLookupField';

function labelKeyForField(fieldId: string): string {
  if (fieldId === 'supplier_id') return 'supplier_name';
  if (fieldId === 'product_batch_id') return 'batch_label';
  return `${fieldId}_label`;
}

type Props = {
  definition: ChecklistDefinition;
  values: Record<string, unknown>;
  readOnly: boolean;
  onChange: (values: Record<string, unknown>) => void;
};

function confirmTwice(message: string): boolean {
  if (!window.confirm(message)) return false;
  return window.confirm('Наистина ли сте сигурни? / Are you sure?');
}

function emptyRow(columns: { id: string }[], defaults?: Record<string, string>): TRow {
  const cells: Record<string, string> = {};
  for (const c of columns) {
    cells[c.id] = defaults?.[c.id] ?? '';
  }
  return { id: newRowId(), cells };
}

export const BulchikenTableForm: React.FC<Props> = ({
  definition,
  values,
  readOnly,
  onChange,
}) => {
  const columns = definition.columns ?? [];
  const table = parseTableState(values._table);
  const [confirmCell, setConfirmCell] = useState<string | null>(null);

  const setTable = (next: TableState) => {
    onChange({ ...values, _table: next });
  };

  const updateCell = (rowId: string, colId: string, v: string) => {
    const rows = table.rows.map(r =>
      r.id === rowId ? { ...r, cells: { ...r.cells, [colId]: v } } : r
    );
    setTable({ ...table, rows });
  };

  const lockCell = (rowId: string, colId: string) => {
    const key = cellKey(rowId, colId);
    if (definition.doubleConfirm && !confirmTwice('Заключване на клетка / Lock cell?')) {
      return;
    }
    setTable({
      ...table,
      lockedCells: { ...table.lockedCells, [key]: true },
    });
  };

  const addRow = () => {
    setTable({
      ...table,
      rows: [...table.rows, emptyRow(columns, definition.defaults)],
    });
  };

  const removeRow = (rowId: string) => {
    setTable({ ...table, rows: table.rows.filter(r => r.id !== rowId) });
  };

  const isLocked = (rowId: string, colId: string) =>
    readOnly || !!table.lockedCells[cellKey(rowId, colId)];

  const progressive = definition.uiMode.startsWith('progressive_lock');
  const live = definition.uiMode === 'live_table';
  const commentsId = definition.commentsColumnId ?? 'comments';

  const allFilledExceptComments =
    progressive &&
    table.rows.length > 0 &&
    table.rows.every(row =>
      columns.every(col => {
        if (col.id === commentsId) return true;
        const key = cellKey(row.id, col.id);
        if (!table.lockedCells[key]) return false;
        return (row.cells[col.id] ?? '').trim() !== '';
      })
    );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {definition.uiMode.replace(/_/g, ' ')}
        </Typography>
        {!readOnly && (
          <Button size="small" startIcon={<Plus size={16} />} onClick={addRow}>
            Add row
          </Button>
        )}
      </Stack>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map(c => (
              <TableCell key={c.id}>{c.label}</TableCell>
            ))}
            {!readOnly && <TableCell width={48} />}
          </TableRow>
        </TableHead>
        <TableBody>
          {table.rows.map(row => (
            <TableRow key={row.id}>
              {columns.map(col => {
                const locked = isLocked(row.id, col.id);
                return (
                  <TableCell key={col.id}>
                    <TextField
                      size="small"
                      fullWidth
                      value={row.cells[col.id] ?? ''}
                      disabled={locked}
                      onChange={e => updateCell(row.id, col.id, e.target.value)}
                      onBlur={() => {
                        if (
                          progressive &&
                          !locked &&
                          (row.cells[col.id] ?? '').trim() &&
                          col.id !== commentsId
                        ) {
                          setConfirmCell(cellKey(row.id, col.id));
                        }
                      }}
                    />
                  </TableCell>
                );
              })}
              {!readOnly && (
                <TableCell>
                  <IconButton size="small" onClick={() => removeRow(row.id)}>
                    <Trash2 size={16} />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={!!confirmCell} onClose={() => setConfirmCell(null)}>
        <DialogTitle>Lock cell?</DialogTitle>
        <DialogContent>
          This cannot be edited after locking.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCell(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (confirmCell) {
                const sep = confirmCell.indexOf('|');
                const rowId = confirmCell.slice(0, sep);
                const colId = confirmCell.slice(sep + 1);
                lockCell(rowId, colId);
              }
              setConfirmCell(null);
            }}
          >
            Lock
          </Button>
        </DialogActions>
      </Dialog>
      {live && !readOnly && table.rows.length > 0 && (
        <Button
          sx={{ mt: 2 }}
          variant="outlined"
          onClick={() => {
            const last = table.rows[table.rows.length - 1];
            const lockedRows = [...(table.lockedRows ?? []), last.id];
            setTable({
              ...table,
              lockedRows,
              rows: [...table.rows, emptyRow(columns, definition.defaults)],
            });
          }}
        >
          Save row &amp; add next
        </Button>
      )}
      {allFilledExceptComments && (
        <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
          All control points locked — submit to complete and start a new run.
        </Typography>
      )}
    </Box>
  );
};

function FieldInput({
  field,
  values,
  readOnly,
  onChange,
}: {
  field: ChecklistField;
  values: Record<string, unknown>;
  readOnly: boolean;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const value = values[field.id];

  if (field.type === 'lookup' && field.lookup) {
    const dependsOnValue =
      field.dependsOn && typeof values[field.dependsOn] === 'string'
        ? (values[field.dependsOn] as string)
        : undefined;
    return (
      <ChecklistLookupField
        field={field}
        value={value}
        displayLabel={
          typeof values[labelKeyForField(field.id)] === 'string'
            ? (values[labelKeyForField(field.id)] as string)
            : undefined
        }
        readOnly={readOnly}
        dependsOnValue={dependsOnValue}
        onChange={onChange}
      />
    );
  }

  if (field.type === 'boolean') {
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={!!value}
            disabled={readOnly}
            onChange={e => onChange({ [field.id]: e.target.checked })}
          />
        }
        label={field.label}
      />
    );
  }
  if (field.type === 'select' && field.options?.length) {
    return (
      <TextField
        select
        fullWidth
        size="small"
        label={field.label}
        value={(value as string) ?? ''}
        disabled={readOnly}
        onChange={e => onChange({ [field.id]: e.target.value })}
      >
        {field.options.map(o => (
          <MenuItem key={o} value={o}>
            {o}
          </MenuItem>
        ))}
      </TextField>
    );
  }
  return (
    <TextField
      fullWidth
      size="small"
      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
      label={field.label}
      value={(value as string) ?? field.defaultValue ?? ''}
      disabled={readOnly}
      required={field.required}
      onChange={e => onChange({ [field.id]: e.target.value })}
      InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
    />
  );
}

export const BulchikenSimpleForm: React.FC<Props> = ({
  definition,
  values,
  readOnly,
  onChange,
}) => {
  const fields = definition.fields ?? [];

  const applyFieldPatch = (field: ChecklistField, patch: Record<string, unknown>) => {
    let next = { ...values, ...patch };
    if (field.id === 'supplier_id' && patch.supplier_id !== values.supplier_id) {
      next = {
        ...next,
        product_batch_id: '',
        batch_label: '',
      };
    }
    onChange(next);
  };

  return (
    <Stack spacing={2}>
      {fields.map(f => (
        <FieldInput
          key={f.id}
          field={f}
          values={values}
          readOnly={readOnly}
          onChange={patch => applyFieldPatch(f, patch)}
        />
      ))}
    </Stack>
  );
};

type BodyProps = Props & { templateKey?: string };

export const BulchikenChecklistBody: React.FC<BodyProps> = props => {
  const mode = props.definition.uiMode;
  const isTable =
    mode === 'live_table' ||
    mode === 'entry_table' ||
    mode === 'progressive_lock_table' ||
    mode === 'progressive_lock_respawn';

  const withDefaults = useMemo(() => {
    if (!isTable) return props.values;
    const table = parseTableState(props.values._table);
    if (table.rows.length) return props.values;
    if (props.templateKey === 'pp02_od04') return props.values;
    return {
      ...props.values,
      _table: { rows: [emptyRow(props.definition.columns ?? [], props.definition.defaults)], lockedCells: {} },
    };
  }, [isTable, props.definition, props.values, props.templateKey]);

  useEffect(() => {
    if (props.templateKey !== 'pp02_od04' || !isTable) return;
    const table = parseTableState(props.values._table);
    if (table.rows.length > 0) return;

    let cancelled = false;
    void (async () => {
      try {
        const { data: employees } = await api.get<
          { id: string; employeeCode: string; name: string }[]
        >('/api/production/employees');
        if (cancelled || employees.length === 0) return;
        props.onChange({
          ...props.values,
          _table: {
            rows: employees.map(e => ({
              id: newRowId(),
              cells: {
                employee: `${e.employeeCode} — ${e.name}`,
                employee_id: e.id,
                hygiene_ok: '',
                uniform_ok: '',
                health_ok: '',
                notes: '',
              },
            })),
            lockedCells: {},
          },
        });
      } catch {
        /* server seed is primary; ignore fetch errors */
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once when table is empty
  }, [props.templateKey, isTable]);

  if (isTable) {
    return <BulchikenTableForm {...props} values={withDefaults} />;
  }
  return <BulchikenSimpleForm {...props} />;
};
