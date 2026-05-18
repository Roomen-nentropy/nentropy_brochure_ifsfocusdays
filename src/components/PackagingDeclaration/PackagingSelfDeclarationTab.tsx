import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
} from '@mui/material';
import axios from 'axios';
import { api } from '../../services';
import { useWorkflow } from '../../hooks/useWorkflow';
import RichTextEditor from '../RichTextEditor/RichTextEditor';
import { PACKAGING_EU_2025_40_TEMPLATE } from '../RichTextEditor/PACKAGING_EU_2025_40_TEMPLATE';

interface EligibleProduct {
  id: string;
  name: string;
  category: string;
  supplierName?: string;
}

interface EligibleOwnGood {
  id: string;
  name: string;
  category?: string | null;
  hsCode: string;
}

interface DeclarationRow {
  id: string;
  declarationNumber?: string | null;
  status: string;
  subjectKind: string;
  productId?: string | null;
  ownGoodId?: string | null;
  contentHtml: string;
  product?: { name: string } | null;
  ownGood?: { name: string } | null;
  updatedAt: string;
}

export const PackagingSelfDeclarationTab: React.FC = () => {
  const { features } = useWorkflow();
  const canOwnGoods = features?.features.canManageOwnGoods ?? false;
  const defaultSubject: 'PRODUCT' | 'OWN_GOOD' =
    canOwnGoods && features?.businessType !== 'OPERATOR_IMPORTER'
      ? 'OWN_GOOD'
      : 'PRODUCT';

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [declarations, setDeclarations] = useState<DeclarationRow[]>([]);
  const [products, setProducts] = useState<EligibleProduct[]>([]);
  const [ownGoods, setOwnGoods] = useState<EligibleOwnGood[]>([]);
  const [subjectKind, setSubjectKind] = useState<'PRODUCT' | 'OWN_GOOD'>(
    defaultSubject
  );
  const [subjectId, setSubjectId] = useState('');
  const [declarationNumber, setDeclarationNumber] = useState('');
  const [contentHtml, setContentHtml] = useState(PACKAGING_EU_2025_40_TEMPLATE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [listRes, eligibleRes] = await Promise.all([
        api.get<DeclarationRow[]>('/api/packaging-declarations'),
        api.get<{ products: EligibleProduct[]; ownGoods: EligibleOwnGood[] }>(
          '/api/packaging-declarations/eligible-subjects'
        ),
      ]);
      setDeclarations(listRes.data);
      setProducts(eligibleRes.data.products);
      setOwnGoods(eligibleRes.data.ownGoods);
    } catch (e: unknown) {
      const apiMsg =
        axios.isAxiosError(e) &&
        e.response?.data &&
        typeof e.response.data === 'object' &&
        'error' in e.response.data
          ? String((e.response.data as { error: string }).error)
          : null;
      setErr(apiMsg ?? (e instanceof Error ? e.message : 'Failed to load'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const eligible =
    subjectKind === 'PRODUCT'
      ? products
      : ownGoods.map(og => ({
          id: og.id,
          name: og.name,
          category: og.category ?? '',
        }));

  const startNew = () => {
    setEditingId(null);
    setSubjectId('');
    setDeclarationNumber('');
    setContentHtml(PACKAGING_EU_2025_40_TEMPLATE);
  };

  const openEditFromList = (row: DeclarationRow) => {
    setEditingId(row.id);
    setSubjectKind(row.subjectKind as 'PRODUCT' | 'OWN_GOOD');
    setSubjectId(row.productId ?? row.ownGoodId ?? '');
    setDeclarationNumber(row.declarationNumber ?? '');
    setContentHtml(row.contentHtml);
  };

  const save = async (finalize: boolean) => {
    if (!editingId && !subjectId) {
      setErr('Select a product or own good with category Packaging');
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      if (editingId) {
        await api.patch(`/api/packaging-declarations/${editingId}`, {
          declarationNumber: declarationNumber || undefined,
          contentHtml,
          ...(finalize ? { status: 'FINAL' } : {}),
        });
      } else {
        const body =
          subjectKind === 'PRODUCT'
            ? {
                subjectKind,
                productId: subjectId,
                declarationNumber: declarationNumber || undefined,
                contentHtml,
              }
            : {
                subjectKind,
                ownGoodId: subjectId,
                declarationNumber: declarationNumber || undefined,
                contentHtml,
              };
        const { data } = await api.post<{ id: string }>(
          '/api/packaging-declarations',
          body
        );
        setEditingId(data.id);
      }
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {err && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr(null)}>
          {err}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" paragraph>
        Create EU Regulation 2025/40 declarations for catalog items whose
        category is Packaging. Importers typically use Products; manufacturers
        use Own goods.
      </Typography>

      {products.length === 0 && ownGoods.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No products or own goods with category Packaging found. Set category to
          Packaging on the relevant item first.
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          <Button variant="outlined" onClick={startNew}>
            New declaration
          </Button>
          {canOwnGoods && (
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Subject type</InputLabel>
              <Select
                label="Subject type"
                value={subjectKind}
                onChange={e =>
                  setSubjectKind(e.target.value as 'PRODUCT' | 'OWN_GOOD')
                }
              >
                <MenuItem value="PRODUCT">Product (imported goods)</MenuItem>
                <MenuItem value="OWN_GOOD">Own good (manufactured)</MenuItem>
              </Select>
            </FormControl>
          )}
          <FormControl size="small" sx={{ minWidth: 220 }} disabled={!!editingId}>
            <InputLabel>
              {subjectKind === 'PRODUCT' ? 'Product' : 'Own good'}
            </InputLabel>
            <Select
              label={subjectKind === 'PRODUCT' ? 'Product' : 'Own good'}
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
            >
              {eligible.map(item => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                  {'category' in item && item.category
                    ? ` (${item.category})`
                    : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Declaration №"
            value={declarationNumber}
            onChange={e => setDeclarationNumber(e.target.value)}
          />
        </Stack>

        <RichTextEditor content={contentHtml} onChange={setContentHtml} />

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            disabled={saving}
            onClick={() => void save(false)}
          >
            Save draft
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={saving}
            onClick={() => void save(true)}
          >
            Finalize
          </Button>
        </Stack>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Saved declarations
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Number</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Updated</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {declarations.map(row => (
            <TableRow key={row.id} hover>
              <TableCell>{row.declarationNumber || '—'}</TableCell>
              <TableCell>
                {row.product?.name ?? row.ownGood?.name ?? row.subjectKind}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={row.status}
                  color={row.status === 'FINAL' ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell>
                {new Date(row.updatedAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <Button size="small" onClick={() => openEditFromList(row)}>
                  Open
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default PackagingSelfDeclarationTab;
