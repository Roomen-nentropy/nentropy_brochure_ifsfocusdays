import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Plus, Package, FileText, Edit, Trash2, ScrollText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { OwnGood } from '../types/own-goods.types';
import axios from 'axios';
import { ownGoodsService } from '../services/ownGoodsService';
import OwnGoodForm from '../components/OwnGoods/OwnGoodForm';
import BillOfMaterialsDialog from '../components/OwnGoods/BillOfMaterialsDialog';
import OwnGoodBatchSidebar from '../components/OwnGoods/OwnGoodBatchSidebar';
import { OwnGoodDossier } from '../components/Dossiers/OwnGoodDossier';

const OwnGoods: React.FC = () => {
  const { t } = useTranslation(['ownGoods', 'common']);
  const [ownGoods, setOwnGoods] = useState<OwnGood[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bomDialogOpen, setBomDialogOpen] = useState(false);
  const [batchSidebarOpen, setBatchSidebarOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedOwnGood, setSelectedOwnGood] = useState<OwnGood | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [ownGoodDossierId, setOwnGoodDossierId] = useState<string | null>(null);

  useEffect(() => {
    loadOwnGoods();
  }, []);

  const loadOwnGoods = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ownGoodsService.getOwnGoods();
      setOwnGoods(data);
    } catch (err) {
      console.error('Error loading own goods:', err);
      const apiMsg =
        axios.isAxiosError(err) &&
        err.response?.data &&
        typeof err.response.data === 'object' &&
        'error' in err.response.data
          ? String((err.response.data as { error: string }).error)
          : null;
      setError(apiMsg ?? 'Failed to load own goods');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBOM = (batchId: string) => {
    setSelectedBatchId(batchId);
    setBomDialogOpen(true);
  };

  const handleManageBatches = (ownGood: OwnGood) => {
    setSelectedOwnGood(ownGood);
    setBatchSidebarOpen(true);
  };

  const handleEdit = (ownGood: OwnGood) => {
    setSelectedOwnGood(ownGood);
    setEditDialogOpen(true);
  };

  const handleDelete = (ownGood: OwnGood) => {
    setSelectedOwnGood(ownGood);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedOwnGood) return;

    try {
      setDeleteLoading(true);
      await ownGoodsService.deleteOwnGood(selectedOwnGood.id);
      setDeleteDialogOpen(false);
      setSelectedOwnGood(null);
      loadOwnGoods();
    } catch (err) {
      console.error('Error deleting own good:', err);
      setError('Failed to delete own good');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;

    try {
      setCsvUploading(true);
      const formData = new FormData();
      formData.append('file', csvFile);

      await ownGoodsService.importRecipesFromCsv(formData);

      setCsvDialogOpen(false);
      setCsvFile(null);
      loadOwnGoods();
    } catch (err) {
      console.error('Error uploading CSV:', err);
      setError('Failed to import recipes from CSV');
    } finally {
      setCsvUploading(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: t('ownGoods:fields.productName'),
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'category',
      headerName: t('ownGoods:fields.category'),
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'hsCode',
      headerName: t('ownGoods:fields.hsCode'),
      width: 120,
    },
    {
      field: 'batches',
      headerName: t('ownGoods:fields.batches'),
      width: 100,
      renderCell: params => params.row.batches?.length || 0,
    },
    {
      field: 'actions',
      headerName: t('common:actions.actions'),
      width: 220,
      sortable: false,
      renderCell: params => (
        <Box
          display="flex"
          height={'100%'}
          justifyContent="center"
          alignItems="center"
          gap={1}
        >
          <IconButton
            size="small"
            onClick={() => setOwnGoodDossierId((params.row as OwnGood).id)}
            title={t('ownGoods:dossier.title', { defaultValue: 'Dossier' })}
          >
            <ScrollText size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              if (params.row.batches?.[0]?.id) {
                handleViewBOM(params.row.batches[0].id);
              }
            }}
            disabled={!params.row.batches?.[0]?.id}
            title={t('ownGoods:viewBOM')}
          >
            <FileText size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleManageBatches(params.row as OwnGood)}
            title={t('common:actions.manageBatches')}
          >
            <Package size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row as OwnGood)}
            title={t('common:actions.edit')}
          >
            <Edit size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row as OwnGood)}
            color="error"
            title={t('common:actions.delete')}
          >
            <Trash2 size={16} />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4">{t('ownGoods:title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('ownGoods:subtitle')}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<FileText size={20} />}
            onClick={() => setCsvDialogOpen(true)}
          >
            Import CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={() => setCreateDialogOpen(true)}
          >
            {t('ownGoods:createOwnGood')}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {ownGoods.length === 0 && !loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Package size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
          <Typography variant="h6" gutterBottom>
            {t('ownGoods:noOwnGoods')}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t('ownGoods:noOwnGoodsDescription')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={() => setCreateDialogOpen(true)}
          >
            {t('ownGoods:createFirstOwnGood')}
          </Button>
        </Paper>
      ) : (
        <Paper>
          <DataGrid
            rows={ownGoods}
            columns={columns}
            autoHeight
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
          />
        </Paper>
      )}

      {/* Create Own Good Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('ownGoods:createOwnGood')}</DialogTitle>
        <DialogContent>
          <OwnGoodForm
            onSuccess={() => {
              setCreateDialogOpen(false);
              loadOwnGoods();
            }}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Own Good Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedOwnGood(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t('common:actions.edit')} {selectedOwnGood?.name}
        </DialogTitle>
        <DialogContent>
          <OwnGoodForm
            ownGood={selectedOwnGood}
            onSuccess={() => {
              setEditDialogOpen(false);
              setSelectedOwnGood(null);
              loadOwnGoods();
            }}
            onCancel={() => {
              setEditDialogOpen(false);
              setSelectedOwnGood(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle>{t('common:actions.confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('common:actions.deleteConfirmation', {
              item: selectedOwnGood?.name,
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setSelectedOwnGood(null);
            }}
            disabled={deleteLoading}
          >
            {t('common:cancel')}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={
              deleteLoading ? (
                <CircularProgress size={16} />
              ) : (
                <Trash2 size={16} />
              )
            }
          >
            {t('common:actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bill of Materials Dialog */}
      {selectedBatchId && (
        <BillOfMaterialsDialog
          open={bomDialogOpen}
          onClose={() => {
            setBomDialogOpen(false);
            setSelectedBatchId(null);
          }}
          batchId={selectedBatchId}
        />
      )}

      {selectedOwnGood && (
        <OwnGoodBatchSidebar
          open={batchSidebarOpen}
          onClose={() => {
            setBatchSidebarOpen(false);
            setSelectedOwnGood(null);
          }}
          ownGood={selectedOwnGood}
          onBatchesUpdate={loadOwnGoods}
        />
      )}

      {/* CSV Import Dialog */}
      <Dialog
        open={csvDialogOpen}
        onClose={() => !csvUploading && setCsvDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Import Recipes from CSV</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3, mt: 1 }}>
            <Typography variant="body2" gutterBottom>
              CSV format: name, category, country, hsCode, unit, ingredients
              (JSON array)
            </Typography>
            <Typography variant="caption">
              Example: &quot;Chocolate Bar&quot;, &quot;Food&quot;,
              &quot;Belgium&quot;, &quot;1806.32&quot;, &quot;kg&quot;,{' '}
              <code>
                {`[{"productId": "123", "quantityUsed": 0.5, "unit": "kg", "percentageOfTotal": 50}]`}
              </code>
            </Typography>
          </Alert>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            disabled={csvUploading}
          >
            {csvFile ? csvFile.name : 'Choose CSV File'}
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={e => setCsvFile(e.target.files?.[0] || null)}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCsvDialogOpen(false)}
            disabled={csvUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCsvUpload}
            variant="contained"
            disabled={!csvFile || csvUploading}
            startIcon={
              csvUploading ? (
                <CircularProgress size={16} />
              ) : (
                <FileText size={16} />
              )
            }
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!ownGoodDossierId}
        onClose={() => setOwnGoodDossierId(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {t('ownGoods:dossier.title', { defaultValue: 'Own good dossier' })}
        </DialogTitle>
        <DialogContent>
          {ownGoodDossierId && <OwnGoodDossier ownGoodId={ownGoodDossierId} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOwnGoodDossierId(null)}>
            {t('common:cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OwnGoods;
