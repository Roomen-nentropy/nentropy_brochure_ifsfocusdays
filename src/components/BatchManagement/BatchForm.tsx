import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Typography,
  Paper,
  Stack,
} from '@mui/material';
import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Product } from '../../types';
import type {
  ProductBatch,
  CreateBatchData,
  UpdateBatchData,
} from '../../types/batch.types';
import { DDSStatus } from '../../types/batch.types';
import { batchService } from '../../services/batchService';

interface BatchFormProps {
  product: Product;
  batch?: ProductBatch | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const BatchForm: React.FC<BatchFormProps> = ({
  product,
  batch,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation(['products', 'common']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateBatchData | UpdateBatchData>({
    productId: product.id,
    batchNumber: '',
    quantity: 0,
    unit: 'kg',
    receivedDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    ddsNumber: '',
    ddsExpiryDate: '',
    notes: '',
  });

  useEffect(() => {
    if (batch) {
      setFormData({
        batchNumber: batch.batchNumber,
        quantity: batch.quantity,
        unit: batch.unit,
        receivedDate: new Date(batch.receivedDate).toISOString().split('T')[0],
        expiryDate: batch.expiryDate
          ? new Date(batch.expiryDate).toISOString().split('T')[0]
          : '',
        ddsNumber: batch.ddsNumber || '',
        ddsStatus: batch.ddsStatus,
        ddsExpiryDate: batch.ddsExpiryDate
          ? new Date(batch.ddsExpiryDate).toISOString().split('T')[0]
          : '',
        notes: batch.notes || '',
      });
    }
  }, [batch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (batch) {
        await batchService.updateBatch(batch.id, formData as UpdateBatchData);
      } else {
        await batchService.createBatch(formData as CreateBatchData);
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving batch:', err);
      setError(batch ? 'Failed to update batch' : 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {batch
          ? t('products:batches.editBatch')
          : t('products:batches.createBatch')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              label={t('products:batches.fields.batchNumber')}
              value={formData.batchNumber}
              onChange={e => handleChange('batchNumber', e.target.value)}
              disabled={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              required
              type="number"
              label={t('products:batches.fields.quantity')}
              value={formData.quantity}
              onChange={e =>
                handleChange('quantity', parseFloat(e.target.value))
              }
              disabled={loading}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              required
              select
              label={t('products:batches.fields.unit')}
              value={formData.unit}
              onChange={e => handleChange('unit', e.target.value)}
              disabled={loading}
            >
              <MenuItem value="kg">{t('products:units.kg')}</MenuItem>
              <MenuItem value="tons">{t('products:units.tons')}</MenuItem>
              <MenuItem value="liters">{t('products:units.liters')}</MenuItem>
              <MenuItem value="m3">{t('products:units.m3')}</MenuItem>
              <MenuItem value="pieces">{t('products:units.pieces')}</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              type="date"
              label={t('products:batches.fields.receivedDate')}
              value={formData.receivedDate}
              onChange={e => handleChange('receivedDate', e.target.value)}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="date"
              label={t('products:batches.fields.expiryDate')}
              value={formData.expiryDate}
              onChange={e => handleChange('expiryDate', e.target.value)}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={t('products:batches.fields.ddsNumber')}
              value={formData.ddsNumber}
              onChange={e => handleChange('ddsNumber', e.target.value)}
              disabled={loading}
              helperText={t('products:batches.ddsNumberHelp')}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="date"
              label={t('products:batches.fields.ddsExpiryDate')}
              value={formData.ddsExpiryDate}
              onChange={e => handleChange('ddsExpiryDate', e.target.value)}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {batch && (
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                label={t('products:batches.fields.ddsStatus')}
                value={
                  (formData as UpdateBatchData).ddsStatus || DDSStatus.ACTIVE
                }
                onChange={e => handleChange('ddsStatus', e.target.value)}
                disabled={loading}
              >
                <MenuItem value={DDSStatus.ACTIVE}>
                  {t('products:batches.ddsStatus.ACTIVE')}
                </MenuItem>
                <MenuItem value={DDSStatus.EXPIRED}>
                  {t('products:batches.ddsStatus.EXPIRED')}
                </MenuItem>
                <MenuItem value={DDSStatus.EXPIRING_SOON}>
                  {t('products:batches.ddsStatus.EXPIRING_SOON')}
                </MenuItem>
                <MenuItem value={DDSStatus.GEOLOCATION_MISMATCH}>
                  {t('products:batches.ddsStatus.GEOLOCATION_MISMATCH')}
                </MenuItem>
                <MenuItem value={DDSStatus.PENDING_RENEWAL}>
                  {t('products:batches.ddsStatus.PENDING_RENEWAL')}
                </MenuItem>
              </TextField>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label={t('products:batches.fields.notes')}
              value={formData.notes}
              onChange={e => handleChange('notes', e.target.value)}
              disabled={loading}
            />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} mt={3}>
          <Button
            variant="contained"
            type="submit"
            startIcon={
              loading ? <CircularProgress size={16} /> : <Save size={16} />
            }
            disabled={loading}
          >
            {batch ? t('common:save') : t('common:create')}
          </Button>
          <Button onClick={onCancel} disabled={loading}>
            {t('common:cancel')}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

export default BatchForm;
