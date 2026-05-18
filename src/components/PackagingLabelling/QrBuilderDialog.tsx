import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
  Box,
} from '@mui/material';
import { packagingLabellingApi } from '../../services/packagingLabellingApi';
import type { BatchDocumentOption } from '../../types/packaging-labelling.types';

type Props = {
  open: boolean;
  batchKind: 'product' | 'own-good';
  batchId: string;
  batchLabelId: string | null;
  onClose: () => void;
  onGenerated: () => void;
};

export const QrBuilderDialog: React.FC<Props> = ({
  open,
  batchKind,
  batchId,
  batchLabelId,
  onClose,
  onGenerated,
}) => {
  const [productDocs, setProductDocs] = useState<BatchDocumentOption[]>([]);
  const [batchDocs, setBatchDocs] = useState<BatchDocumentOption[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Set<string>>(new Set());
  const [selectedBatch, setSelectedBatch] = useState<Set<string>>(new Set());
  const [includeProductInfo, setIncludeProductInfo] = useState(true);
  const [includeBatchInfo, setIncludeBatchInfo] = useState(true);
  const [includeDeclaration, setIncludeDeclaration] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [traceUrl, setTraceUrl] = useState<string | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    void (async () => {
      try {
        const { data } = await packagingLabellingApi.listBatchDocuments(batchKind, batchId);
        setProductDocs(data.productLevel);
        setBatchDocs(data.batchLevel);
      } catch {
        setError('Failed to load documents');
      }
    })();
  }, [open, batchKind, batchId]);

  const toggle = (set: Set<string>, id: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  const handleGenerate = async () => {
    if (!batchLabelId) {
      setError('Save batch label first');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await packagingLabellingApi.generateQr(batchLabelId, {
        includeProductInfo,
        includeBatchInfo,
        includeDeclaration,
        productDocumentIds: [...selectedProduct],
        batchDocumentIds: [...selectedBatch],
      });
      setTraceUrl(data.traceUrl ?? null);
      setQrImageUrl(data.qrImageUrl ?? null);
      onGenerated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'QR generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configure QR code (per batch)</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeProductInfo}
                onChange={e => setIncludeProductInfo(e.target.checked)}
              />
            }
            label="Product / packaging info"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeBatchInfo}
                onChange={e => setIncludeBatchInfo(e.target.checked)}
              />
            }
            label="Batch details"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeDeclaration}
                onChange={e => setIncludeDeclaration(e.target.checked)}
              />
            }
            label="EU declaration reference"
          />
        </FormGroup>
        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Product-level documents
        </Typography>
        {productDocs.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            None
          </Typography>
        )}
        {productDocs.map(d => (
          <FormControlLabel
            key={d.id}
            control={
              <Checkbox
                checked={selectedProduct.has(d.id)}
                onChange={() => toggle(selectedProduct, d.id, setSelectedProduct)}
              />
            }
            label={d.label}
          />
        ))}
        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Batch-level documents
        </Typography>
        {batchDocs.map(d => (
          <FormControlLabel
            key={d.id}
            control={
              <Checkbox
                checked={selectedBatch.has(d.id)}
                onChange={() => toggle(selectedBatch, d.id, setSelectedBatch)}
              />
            }
            label={d.label}
          />
        ))}
        {traceUrl && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">Trace URL: {traceUrl}</Typography>
            {qrImageUrl && (
              <Box component="img" src={qrImageUrl} alt="QR" sx={{ mt: 1, width: 160 }} />
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" disabled={loading} onClick={() => void handleGenerate()}>
          Generate QR
        </Button>
      </DialogActions>
    </Dialog>
  );
};
