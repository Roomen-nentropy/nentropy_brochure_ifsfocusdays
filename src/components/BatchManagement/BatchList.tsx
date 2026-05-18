import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Plus, Edit, Trash2, FileText, Download, ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProductBatch } from '../../types/batch.types';
import { DDSStatus } from '../../types/batch.types';
import { downloadBatchVerificationPDF } from '../../lib/pdf-generator';

interface BatchListProps {
  batches: ProductBatch[];
  loading: boolean;
  onEdit: (batch: ProductBatch) => void;
  onDelete: (batchId: string) => void;
  onCreateNew: () => void;
  onOpenIntake?: (batch: ProductBatch) => void;
}

const BatchList: React.FC<BatchListProps> = ({
  batches,
  loading,
  onEdit,
  onDelete,
  onCreateNew,
  onOpenIntake,
}) => {
  const { t } = useTranslation(['products', 'common']);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<ProductBatch | null>(null);

  const handleDeleteClick = (batch: ProductBatch) => {
    setBatchToDelete(batch);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (batchToDelete) {
      onDelete(batchToDelete.id);
      setDeleteConfirmOpen(false);
      setBatchToDelete(null);
    }
  };

  const getDDSStatusColor = (status: string) => {
    switch (status) {
      case DDSStatus.ACTIVE:
        return 'success';
      case DDSStatus.EXPIRED:
        return 'error';
      case DDSStatus.EXPIRING_SOON:
        return 'warning';
      case DDSStatus.GEOLOCATION_MISMATCH:
        return 'error';
      case DDSStatus.PENDING_RENEWAL:
        return 'warning';
      default:
        return 'default';
    }
  };

  const intakeColor = (o?: string) => {
    if (o === 'PASS') return 'success';
    if (o === 'FAIL') return 'error';
    return 'default';
  };

  const columns: GridColDef[] = [
    {
      field: 'intakeQualityOutcome',
      headerName: 'Intake',
      width: 100,
      renderCell: params => (
        <Chip
          label={params.row.intakeQualityOutcome || 'PENDING'}
          color={intakeColor(params.row.intakeQualityOutcome)}
          size="small"
        />
      ),
    },
    {
      field: 'batchNumber',
      headerName: t('products:batches.fields.batchNumber'),
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'quantity',
      headerName: t('products:batches.fields.quantity'),
      flex: 1,
      minWidth: 120,
      renderCell: params => `${params.row.quantity} ${params.row.unit}`,
    },
    {
      field: 'receivedDate',
      headerName: t('products:batches.fields.receivedDate'),
      flex: 1,
      minWidth: 130,
      renderCell: params => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'ddsNumber',
      headerName: t('products:batches.fields.ddsNumber'),
      flex: 1,
      minWidth: 150,
      renderCell: params => params.value || '-',
    },
    {
      field: 'ddsStatus',
      headerName: t('products:batches.fields.ddsStatus'),
      flex: 1,
      minWidth: 150,
      renderCell: params => (
        <Chip
          label={t(`products:batches.ddsStatus.${params.value}`)}
          color={getDDSStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'ddsExpiryDate',
      headerName: t('products:batches.fields.ddsExpiryDate'),
      flex: 1,
      minWidth: 130,
      renderCell: params =>
        params.value ? new Date(params.value).toLocaleDateString() : '-',
    },
    {
      field: 'actions',
      headerName: '',
      width: 200,
      sortable: false,
      renderCell: params => (
        <Stack direction="row" spacing={1}>
          {onOpenIntake && (
            <IconButton
              size="small"
              onClick={() => onOpenIntake(params.row)}
              title="Intake control"
              color="secondary"
            >
              <ClipboardList size={16} />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={() =>
              downloadBatchVerificationPDF(params.row.id, 'PRODUCT')
            }
            title="Download PDF"
            color="primary"
          >
            <Download size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onEdit(params.row)}
            title={t('common:edit')}
          >
            <Edit size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteClick(params.row)}
            title={t('common:delete')}
            color="error"
          >
            <Trash2 size={16} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="body2" color="text.secondary">
            {t('products:batches.totalBatches', { count: batches.length })}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={onCreateNew}
          >
            {t('products:batches.createBatch')}
          </Button>
        </Box>

        {batches.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <FileText size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {t('products:batches.noBatches')}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Plus size={16} />}
              onClick={onCreateNew}
              sx={{ mt: 2 }}
            >
              {t('products:batches.createFirstBatch')}
            </Button>
          </Paper>
        ) : (
          <DataGrid
            rows={batches}
            columns={columns}
            autoHeight
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
          />
        )}
      </Box>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>{t('products:batches.deleteBatch')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('products:batches.deleteConfirm', {
              batchNumber: batchToDelete?.batchNumber,
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            {t('common:cancel')}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            {t('common:delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BatchList;
