import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Chip,
  Alert,
} from '@mui/material';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Product } from '../../types';
import type { ProductBatch } from '../../types/batch.types';
import { batchService } from '../../services/batchService';
import BatchList from './BatchList';
import BatchForm from './BatchForm';

interface BatchManagementDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  onBatchesUpdate?: () => void;
}

const BatchManagementDialog: React.FC<BatchManagementDialogProps> = ({
  open,
  onClose,
  product,
  onBatchesUpdate,
}) => {
  const { t } = useTranslation(['products', 'common']);
  const [activeTab, setActiveTab] = useState(0);
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingBatch, setEditingBatch] = useState<ProductBatch | null>(null);

  const loadBatches = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await batchService.getBatchesByProduct(product.id);
      setBatches(data);
    } catch (err) {
      console.error('Error loading batches:', err);
      setError('Failed to load batches');
    } finally {
      setLoading(false);
    }
  }, [product.id]);

  useEffect(() => {
    if (open && product.id) {
      loadBatches();
    }
  }, [open, product.id, loadBatches]);

  const handleBatchCreated = () => {
    loadBatches();
    setActiveTab(0);
    onBatchesUpdate?.();
  };

  const handleEditBatch = (batch: ProductBatch) => {
    setEditingBatch(batch);
    setActiveTab(1);
  };

  const handleDeleteBatch = async (batchId: string) => {
    try {
      await batchService.deleteBatch(batchId);
      loadBatches();
      onBatchesUpdate?.();
    } catch (err) {
      console.error('Error deleting batch:', err);
      setError('Failed to delete batch');
    }
  };

  const handleCancelEdit = () => {
    setEditingBatch(null);
    setActiveTab(0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6">{t('products:batches.title')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {product.name} {product.hsCode && `(${product.hsCode})`}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                {t('products:batches.tabs.list')}
                <Chip label={batches.length} size="small" />
              </Box>
            }
          />
          <Tab
            label={
              editingBatch
                ? t('products:batches.tabs.edit')
                : t('products:batches.tabs.create')
            }
          />
        </Tabs>

        {activeTab === 0 && (
          <BatchList
            batches={batches}
            loading={loading}
            onEdit={handleEditBatch}
            onDelete={handleDeleteBatch}
            onCreateNew={() => {
              setEditingBatch(null);
              setActiveTab(1);
            }}
          />
        )}

        {activeTab === 1 && (
          <BatchForm
            product={product}
            batch={editingBatch}
            onSuccess={handleBatchCreated}
            onCancel={handleCancelEdit}
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t('common:cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BatchManagementDialog;
