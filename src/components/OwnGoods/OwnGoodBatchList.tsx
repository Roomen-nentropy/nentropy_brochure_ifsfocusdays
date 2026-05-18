import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Trash2, FileText, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { OwnGoodBatch } from '../../types/own-goods.types';

interface OwnGoodBatchListProps {
  batches: OwnGoodBatch[];
  loading: boolean;
  onViewBOM: (batchId: string) => void;
  onDelete: (batchId: string) => void;
  onCreateNew: () => void;
}

const OwnGoodBatchList: React.FC<OwnGoodBatchListProps> = ({
  batches,
  loading,
  onViewBOM,
  onDelete,
  onCreateNew,
}) => {
  const { t } = useTranslation(['ownGoods', 'common']);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (batches.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          {t('ownGoods:noBatches')}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('ownGoods:noBatchesDescription')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={onCreateNew}
        >
          {t('ownGoods:createFirstBatch')}
        </Button>
      </Paper>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="subtitle1">
          {t('ownGoods:batchList')} ({batches.length})
        </Typography>
        <Button
          size="small"
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={onCreateNew}
        >
          {t('ownGoods:addBatch')}
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('ownGoods:fields.batchNumber')}</TableCell>
              <TableCell>{t('ownGoods:fields.productionDate')}</TableCell>
              <TableCell align="right">
                {t('ownGoods:fields.quantity')}
              </TableCell>
              <TableCell>{t('ownGoods:fields.ingredients')}</TableCell>
              <TableCell align="right">{t('common:actions.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {batches.map(batch => (
              <TableRow key={batch.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {batch.batchNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  {new Date(batch.productionDate).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  {batch.quantity} {batch.unit}
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${batch.ingredients?.length || 0} ${t('ownGoods:ingredients').toLowerCase()}`}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" gap={0.5} justifyContent="flex-end">
                    <IconButton
                      size="small"
                      onClick={() => onViewBOM(batch.id)}
                      title={t('ownGoods:viewBOM')}
                    >
                      <FileText size={16} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(batch.id)}
                      color="error"
                      title={t('common:actions.delete')}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OwnGoodBatchList;
