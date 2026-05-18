import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import { packagingLabellingApi } from '../../services/packagingLabellingApi';
import type { PackagingLink } from '../../types/packaging-labelling.types';

export const PackagingLinksPanel: React.FC = () => {
  const [links, setLinks] = useState<PackagingLink[]>([]);
  const [subjects, setSubjects] = useState<{
    products: { id: string; name: string }[];
    ownGoods: { id: string; name: string }[];
  }>({ products: [], ownGoods: [] });
  const [packaging, setPackaging] = useState<{
    products: { id: string; name: string }[];
    ownGoods: { id: string; name: string }[];
  }>({ products: [], ownGoods: [] });
  const [subjectKind, setSubjectKind] = useState<'PRODUCT' | 'OWN_GOOD'>('PRODUCT');
  const [subjectId, setSubjectId] = useState('');
  const [packagingProductId, setPackagingProductId] = useState('');
  const [packagingOwnGoodId, setPackagingOwnGoodId] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [l, s, c] = await Promise.all([
      packagingLabellingApi.listLinks(),
      packagingLabellingApi.listSubjects(),
      packagingLabellingApi.listCandidates(),
    ]);
    setLinks(l.data);
    setSubjects(s.data);
    setPackaging(c.data);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    try {
      await packagingLabellingApi.upsertLink({
        subjectKind,
        productId: subjectKind === 'PRODUCT' ? subjectId : undefined,
        ownGoodId: subjectKind === 'OWN_GOOD' ? subjectId : undefined,
        packagingProductId: packagingProductId || undefined,
        packagingOwnGoodId: packagingOwnGoodId || undefined,
      });
      setMsg('Link saved');
      await load();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : 'Failed');
    }
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Link each filled product or own good to the packaging SKU it is sold in. Packaging
        producers can link packaging items to other packaging SKUs the same way.
      </Typography>
      {msg && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setMsg(null)}>
          {msg}
        </Alert>
      )}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2} maxWidth={480}>
          <TextField
            select
            size="small"
            label="Subject type"
            value={subjectKind}
            onChange={e => {
              setSubjectKind(e.target.value as 'PRODUCT' | 'OWN_GOOD');
              setSubjectId('');
            }}
          >
            <MenuItem value="PRODUCT">Purchased product</MenuItem>
            <MenuItem value="OWN_GOOD">Own good</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Filled product / own good"
            value={subjectId}
            onChange={e => setSubjectId(e.target.value)}
          >
            {(subjectKind === 'PRODUCT' ? candidates.products : candidates.ownGoods).map(
              s => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              )
            )}
          </TextField>
          <TextField
            select
            size="small"
            label="Packaging (product)"
            value={packagingProductId}
            onChange={e => {
              setPackagingProductId(e.target.value);
              if (e.target.value) setPackagingOwnGoodId('');
            }}
          >
            <MenuItem value="">—</MenuItem>
            {packaging.products.map(p => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Packaging (own good)"
            value={packagingOwnGoodId}
            onChange={e => {
              setPackagingOwnGoodId(e.target.value);
              if (e.target.value) setPackagingProductId('');
            }}
          >
            <MenuItem value="">—</MenuItem>
            {packaging.ownGoods.map(o => (
              <MenuItem key={o.id} value={o.id}>
                {o.name}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={() => void save()}>
            Save link
          </Button>
        </Stack>
      </Paper>
      <Typography variant="subtitle1" gutterBottom>
        Existing links
      </Typography>
      {links.map(l => (
        <Paper key={l.id} sx={{ p: 1.5, mb: 1 }}>
          <Typography variant="body2">
            {l.product?.name ?? l.ownGood?.name} →{' '}
            {l.packagingProduct?.name ?? l.packagingOwnGood?.name}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};
