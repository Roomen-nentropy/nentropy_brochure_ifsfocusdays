import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { BillOfMaterials } from '../../types/own-goods.types';
import { ownGoodsService } from '../../services/ownGoodsService';

interface BillOfMaterialsDialogProps {
  open: boolean;
  onClose: () => void;
  batchId: string;
}

const BillOfMaterialsDialog: React.FC<BillOfMaterialsDialogProps> = ({
  open,
  onClose,
  batchId,
}) => {
  const { t } = useTranslation(['ownGoods', 'common']);
  const [bom, setBom] = useState<BillOfMaterials | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBOM = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ownGoodsService.getBillOfMaterials(batchId);
      setBom(data);
    } catch (err) {
      console.error('Error loading Bill of Materials:', err);
      setError('Failed to load Bill of Materials');
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    if (open && batchId) {
      loadBOM();
    }
  }, [open, batchId, loadBOM]);

  const getDDSStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'EXPIRED':
        return 'error';
      case 'EXPIRING_SOON':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{t('ownGoods:billOfMaterials')}</Typography>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {bom && !loading && (
          <Box>
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>{t('ownGoods:batchDetails')}</strong>
              </Typography>
              <Typography variant="body2">
                {t('ownGoods:fields.batchNumber')}: {bom.batch.batchNumber}
              </Typography>
              <Typography variant="body2">
                {t('ownGoods:fields.product')}: {bom.batch.product}
              </Typography>
              <Typography variant="body2">
                {t('ownGoods:fields.quantity')}: {bom.batch.quantity}{' '}
                {bom.batch.unit}
              </Typography>
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              <strong>{t('ownGoods:ingredients')}</strong>
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="15%">
                      {t('ownGoods:fields.ingredient')}
                    </TableCell>
                    <TableCell width="15%">
                      {t('ownGoods:fields.supplier')}
                    </TableCell>
                    <TableCell width="12%">
                      {t('ownGoods:fields.batch')}
                    </TableCell>
                    <TableCell align="right" width="12%">
                      {t('ownGoods:fields.quantityUsed')}
                    </TableCell>
                    <TableCell align="right" width="10%">
                      {t('ownGoods:fields.percentage')}
                    </TableCell>
                    <TableCell width="15%">
                      {t('ownGoods:fields.ddsNumber')}
                    </TableCell>
                    <TableCell width="11%">
                      {t('ownGoods:fields.ddsStatus')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bom.ingredients.map(ing => (
                    <TableRow key={ing.id}>
                      <TableCell>{ing.product}</TableCell>
                      <TableCell>{ing.supplier}</TableCell>
                      <TableCell>{ing.batch}</TableCell>
                      <TableCell align="right">
                        {ing.quantityUsed} {ing.unit}
                      </TableCell>
                      <TableCell align="right">
                        {ing.percentage ? `${ing.percentage.toFixed(1)}%` : '-'}
                      </TableCell>
                      <TableCell>{ing.ddsNumber || '-'}</TableCell>
                      <TableCell>
                        {ing.ddsStatus ? (
                          <Chip
                            label={ing.ddsStatus}
                            color={getDDSStatusColor(ing.ddsStatus)}
                            size="small"
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                {t('ownGoods:totalPercentage')}:{' '}
                {bom.totalPercentage.toFixed(1)}%
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t('common:close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BillOfMaterialsDialog;
