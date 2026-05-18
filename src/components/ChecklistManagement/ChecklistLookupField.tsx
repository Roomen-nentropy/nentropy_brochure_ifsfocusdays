import React, { useCallback, useMemo } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import type { ChecklistField } from '../../lib/checklistFormTypes';
import { usePaginatedAutocomplete } from '../../hooks/usePaginatedAutocomplete';
import { apiService } from '../../services/apiService';
import { api } from '../../services';

type LookupOption = { id: string; label: string };

function labelKeyForField(fieldId: string): string {
  if (fieldId === 'supplier_id') return 'supplier_name';
  if (fieldId === 'product_batch_id') return 'batch_label';
  return `${fieldId}_label`;
}

async function fetchSuppliers(params: {
  page: number;
  limit: number;
  search: string;
}): Promise<{ data: LookupOption[]; total: number; page: number; limit: number; totalPages: number }> {
  const result = await apiService.getSuppliers({
    page: params.page,
    limit: params.limit,
    search: params.search,
  });
  return {
    ...result,
    data: result.data.map(s => ({
      id: s.id,
      label: s.code ? `${s.name} (${s.code})` : s.name,
    })),
  };
}

async function fetchBatches(
  supplierId: string,
  params: { page: number; limit: number; search: string }
): Promise<{ data: LookupOption[]; total: number; page: number; limit: number; totalPages: number }> {
  const searchParams = new URLSearchParams({
    supplierId,
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.search) searchParams.set('search', params.search);
  const { data } = await api.get<{
    data: LookupOption[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`/api/production/intake-lookups/batches?${searchParams.toString()}`);
  return data;
}

interface BaseProps {
  field: ChecklistField;
  value: unknown;
  displayLabel?: string;
  readOnly: boolean;
  onChange: (patch: Record<string, unknown>) => void;
}

function LookupAutocomplete({
  field,
  value,
  displayLabel,
  readOnly,
  disabled,
  ac,
  onChange,
}: BaseProps & {
  disabled: boolean;
  ac: ReturnType<typeof usePaginatedAutocomplete<LookupOption>>;
}) {
  const labelKey = labelKeyForField(field.id);
  const idValue = typeof value === 'string' ? value : '';

  const selectedOption = useMemo((): LookupOption | null => {
    if (!idValue) return null;
    const fromOptions = ac.options.find(o => o.id === idValue);
    if (fromOptions) return fromOptions;
    if (displayLabel) return { id: idValue, label: displayLabel };
    return { id: idValue, label: idValue };
  }, [idValue, displayLabel, ac.options]);

  return (
    <Autocomplete
      size="small"
      fullWidth
      disabled={disabled || readOnly}
      options={ac.options}
      loading={ac.loading}
      value={selectedOption}
      inputValue={ac.inputValue}
      onInputChange={(_, v, reason) => {
        if (reason === 'input') ac.setInputValue(v);
      }}
      onChange={(_, option) => {
        if (!option) {
          onChange({ [field.id]: '', [labelKey]: '' });
          return;
        }
        onChange({ [field.id]: option.id, [labelKey]: option.label });
      }}
      getOptionLabel={o => o.label}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      filterOptions={x => x}
      ListboxProps={{
        onScroll: (e: React.SyntheticEvent) => {
          const el = e.currentTarget;
          if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
            ac.onScrollToBottom();
          }
        },
      }}
      renderInput={params => (
        <TextField
          {...params}
          label={field.label}
          required={field.required}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {ac.loading ? <CircularProgress color="inherit" size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

export const SupplierLookupField: React.FC<BaseProps> = props => {
  const ac = usePaginatedAutocomplete<LookupOption>({
    fetchFunction: fetchSuppliers,
    pageSize: 25,
  });
  return <LookupAutocomplete {...props} disabled={false} ac={ac} />;
};

export const BatchLookupField: React.FC<BaseProps & { supplierId?: string }> = ({
  supplierId,
  ...props
}) => {
  const batchFetch = useCallback(
    async (params: { page: number; limit: number; search: string }) => {
      if (!supplierId) {
        return { data: [], total: 0, page: 1, limit: params.limit, totalPages: 0 };
      }
      return fetchBatches(supplierId, params);
    },
    [supplierId]
  );

  const ac = usePaginatedAutocomplete<LookupOption>({
    fetchFunction: batchFetch,
    pageSize: 25,
    additionalParams: { supplierId },
  });

  return <LookupAutocomplete {...props} disabled={!supplierId} ac={ac} />;
};

export const ChecklistLookupField: React.FC<
  BaseProps & { dependsOnValue?: string }
> = ({ field, dependsOnValue, ...rest }) => {
  if (field.lookup === 'supplier') {
    return <SupplierLookupField field={field} {...rest} />;
  }
  return (
    <BatchLookupField
      field={field}
      supplierId={dependsOnValue}
      {...rest}
    />
  );
};
