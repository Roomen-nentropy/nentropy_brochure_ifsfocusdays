import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Chip,
  Alert,
} from '@mui/material';
import { X } from 'lucide-react';
import type { OwnGood, OwnGoodBatch } from '../../types/own-goods.types';
import OwnGoodBatchList from './OwnGoodBatchList';
import OwnGoodBatchForm from './OwnGoodBatchForm';
import { ownGoodsService } from '../../services/ownGoodsService';

interface OwnGoodBatchSidebarProps {
  open: boolean;
  onClose: () => void;
  ownGood: OwnGood | null;
  onBatchesUpdate?: () => void;
}

export const OwnGoodBatchSidebar: React.FC<OwnGoodBatchSidebarProps> = ({
  open,
  onClose,
  ownGood,
  onBatchesUpdate,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [batches, setBatches] = useState<OwnGoodBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBatches = React.useCallback(async () => {
    if (!ownGood) return;
    try {
      setLoading(true);
      setError(null);
      // Batches are included in the ownGood object
      setBatches(ownGood.batches || []);
    } catch (err) {
      console.error('Error loading batches:', err);
      setError('Failed to load batches');
    } finally {
      setLoading(false);
    }
  }, [ownGood]);

  useEffect(() => {
    if (open && ownGood?.id) {
      loadBatches();
    }
  }, [open, ownGood?.id, loadBatches]);

  const handleBatchCreated = () => {
    setActiveTab(0);
    onBatchesUpdate?.();
  };

  const handleDeleteBatch = async (batchId: string) => {
    try {
      await ownGoodsService.deleteBatch(batchId);
      onBatchesUpdate?.();
    } catch (err) {
      console.error('Error deleting batch:', err);
      setError('Failed to delete batch');
    }
  };

  const handleViewBOM = (batchId: string) => {
    // This will be handled by the parent component
    console.log('View BOM:', batchId);
  };

  if (!ownGood) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '50%',
          maxWidth: '700px',
          minWidth: '500px',
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
              {ownGood.name} {ownGood.hsCode && `(${ownGood.hsCode})`}
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
            <Tab label="Add Batch" />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {activeTab === 0 && (
            <OwnGoodBatchList
              batches={batches}
              loading={loading}
              onViewBOM={handleViewBOM}
              onDelete={handleDeleteBatch}
              onCreateNew={() => setActiveTab(1)}
            />
          )}

          {activeTab === 1 && ownGood && (
            <OwnGoodBatchForm
              ownGoodId={ownGood.id}
              ownGoodName={ownGood.name}
              recipeIngredients={ownGood.recipeIngredients || []}
              onSuccess={handleBatchCreated}
              onCancel={() => setActiveTab(0)}
            />
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default OwnGoodBatchSidebar;
