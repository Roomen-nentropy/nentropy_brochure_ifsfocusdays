import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Stack,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  packagingLabellingApi,
  type ManagementOwnGood,
  type ManagementProduct,
} from '../../services/packagingLabellingApi';
import { QrBuilderDialog } from './QrBuilderDialog';

export const LabelManagementPanel: React.FC = () => {
  const [menu, setMenu] = useState(0);
  const [products, setProducts] = useState<ManagementProduct[]>([]);
  const [ownGoods, setOwnGoods] = useState<ManagementOwnGood[]>([]);
  const [links, setLinks] = useState<Awaited<ReturnType<typeof packagingLabellingApi.listLinks>>['data']>([]);
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
  const [qrOpen, setQrOpen] = useState<{
    kind: 'product' | 'own-good';
    batchId: string;
    batchLabelId: string | null;
  } | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [p, o, l, t] = await Promise.all([
      packagingLabellingApi.listProducts(),
      packagingLabellingApi.listOwnGoods(),
      packagingLabellingApi.listLinks(),
      packagingLabellingApi.listTemplates(),
    ]);
    setProducts(p.data);
    setOwnGoods(o.data);
    setLinks(l.data);
    setTemplates(t.data.map(x => ({ id: x.id, name: x.name })));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const assignProfile = async (
    subjectKind: 'PRODUCT' | 'OWN_GOOD',
    productId: string | undefined,
    ownGoodId: string | undefined,
    packagingLinkId: string,
    labelTemplateId: string
  ) => {
    await packagingLabellingApi.createProfile({
      subjectKind,
      productId,
      ownGoodId,
      packagingLinkId,
      labelTemplateId,
    });
    setMsg('Label profile assigned');
    await load();
  };

  const ensureBatchLabel = async (
    kind: 'product' | 'own-good',
    batchId: string,
    profileId: string
  ) => {
    const batchKind = kind === 'product' ? 'PRODUCT_BATCH' : 'OWN_GOOD_BATCH';
    const { data } = await packagingLabellingApi.upsertBatchLabel({
      batchKind,
      productBatchId: kind === 'product' ? batchId : undefined,
      ownGoodBatchId: kind === 'own-good' ? batchId : undefined,
      labelProfileId: profileId,
    });
    return data;
  };

  const openQr = async (kind: 'product' | 'own-good', batchId: string, profileId: string) => {
    const label = await ensureBatchLabel(kind, batchId, profileId);
    setQrOpen({ kind, batchId, batchLabelId: label.id });
  };

  const renderProduct = (p: ManagementProduct) => {
    const link = p.packagingLinksAsSubject[0];
    const profile = p.labelProfiles[0];
    return (
      <Accordion key={p.id}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{p.name}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {!link && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              Set a packaging link first (Packaging links tab)
            </Alert>
          )}
          {link && !profile && (
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                select
                size="small"
                label="Label template"
                defaultValue=""
                onChange={e =>
                  void assignProfile('PRODUCT', p.id, undefined, link.id, e.target.value)
                }
              >
                {templates.map(t => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          )}
          {p.batches.map(b => (
            <Stack key={b.id} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ flex: 1 }}>
                Batch {b.batchNumber}
              </Typography>
              {profile && (
                <Button size="small" onClick={() => void openQr('product', b.id, profile.id)}>
                  QR & label
                </Button>
              )}
            </Stack>
          ))}
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderOwnGood = (o: ManagementOwnGood) => {
    const link = o.packagingLinksAsSubject[0];
    const profile = o.labelProfiles[0];
    return (
      <Accordion key={o.id}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{o.name}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {link && !profile && (
            <TextField
              select
              size="small"
              label="Label template"
              sx={{ mb: 2 }}
              onChange={e =>
                void assignProfile('OWN_GOOD', undefined, o.id, link.id, e.target.value)
              }
            >
              {templates.map(t => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </TextField>
          )}
          {o.batches.map(b => (
            <Stack key={b.id} direction="row" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ flex: 1 }}>
                Batch {b.batchNumber}
              </Typography>
              {profile && (
                <Button size="small" onClick={() => void openQr('own-good', b.id, profile.id)}>
                  QR & label
                </Button>
              )}
            </Stack>
          ))}
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Box>
      <Tabs value={menu} onChange={(_, v) => setMenu(v)} sx={{ mb: 2 }}>
        <Tab label="Purchased products" />
        <Tab label="Own goods" />
      </Tabs>
      {msg && (
        <Alert sx={{ mb: 2 }} onClose={() => setMsg(null)}>
          {msg}
        </Alert>
      )}
      {menu === 0 ? products.map(renderProduct) : ownGoods.map(renderOwnGood)}
      {qrOpen && (
        <QrBuilderDialog
          open
          batchKind={qrOpen.kind}
          batchId={qrOpen.batchId}
          batchLabelId={qrOpen.batchLabelId}
          onClose={() => setQrOpen(null)}
          onGenerated={() => setMsg('QR generated')}
        />
      )}
    </Box>
  );
};
