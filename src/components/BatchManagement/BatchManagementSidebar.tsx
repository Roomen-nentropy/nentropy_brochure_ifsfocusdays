import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import { X } from 'lucide-react';
import type { Product } from '../../types';
import type { ProductBatch } from '../../types/batch.types';
import { batchService } from '../../services/batchService';
import BatchList from './BatchList';
import BatchForm from './BatchForm';
import { BatchIntakeDialog } from './BatchIntakeDialog';

interface BatchManagementSidebarProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onBatchesUpdate?: () => void;
}

export const BatchManagementSidebar: React.FC<BatchManagementSidebarProps> = ({
  open,
  onClose,
  product,
  onBatchesUpdate,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBatch, setEditingBatch] = useState<ProductBatch | null>(null);
  const [intakeBatchId, setIntakeBatchId] = useState<string | null>(null);

  // Check if this is an own good (manufactured product)
  const isOwnGood = product?.productType === 'MANUFACTURED';

  const loadBatches = React.useCallback(async () => {
    if (!product || isOwnGood) return;
    try {
      setLoading(true);
      const data = await batchService.getBatchesByProduct(product.id);
      setBatches(data);
    } catch (err) {
      console.error('Error loading batches:', err);
    } finally {
      setLoading(false);
    }
  }, [product, isOwnGood]);

  useEffect(() => {
    if (open && product?.id) {
      loadBatches();
    }
  }, [open, product?.id, loadBatches]);

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
    }
  };

  const handleCancelEdit = () => {
    setEditingBatch(null);
    setActiveTab(0);
  };

  if (!product) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '40%',
          maxWidth: '600px',
          minWidth: '450px',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography variant="h6">Batch Management</Typography>
            <Typography variant="body2" color="text.secondary">
              {product.name} {product.hsCode && `(${product.hsCode})`}
            </Typography>
            <Chip
              label={`${batches.length} ${batches.length === 1 ? 'batch' : 'batches'}`}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
            <Tab label="Batches" />
            <Tab label={editingBatch ? 'Edit Batch' : 'Add Batch'} />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {activeTab === 0 && (
            <BatchList
              batches={batches}
              loading={loading}
              onEdit={handleEditBatch}
              onDelete={handleDeleteBatch}
              onCreateNew={() => setActiveTab(1)}
              onOpenIntake={b => setIntakeBatchId(b.id)}
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
        </Box>
      </Box>
      <BatchIntakeDialog
        open={!!intakeBatchId}
        batchId={intakeBatchId}
        onClose={() => setIntakeBatchId(null)}
        onUpdated={() => {
          void loadBatches();
          onBatchesUpdate?.();
        }}
      />
    </Drawer>
  );
};
