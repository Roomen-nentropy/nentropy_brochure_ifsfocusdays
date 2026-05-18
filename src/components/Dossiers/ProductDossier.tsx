import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../../services';

interface ProductDossierProps {
  productId: string;
}

export const ProductDossier: React.FC<ProductDossierProps> = ({ productId }) => {
  const [tab, setTab] = React.useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['product-dossier', productId],
    queryFn: async () => {
      const res = await axios.get(
        `${API_BASE_URL}/api/dossiers/products/${productId}`,
        { withCredentials: true }
      );
      return res.data;
    },
  });

  if (isLoading) return <LinearProgress />;
  if (error)
    return (
      <Alert severity="error">
        {error instanceof Error ? error.message : 'Failed to load dossier'}
      </Alert>
    );
  if (!data) return <Alert severity="info">No data</Alert>;

  const batches = data.batches || [];

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">{data.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {data.supplierName} · {data.category} · {data.country}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {data.internalProductCode && (
            <Chip size="small" label={`Internal: ${data.internalProductCode}`} />
          )}
          {data.supplierProductCode && (
            <Chip size="small" label={`Supplier code: ${data.supplierProductCode}`} />
          )}
          <Chip size="small" label={`HS: ${data.hsCode || '—'}`} />
        </Box>
      </Paper>

      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label={`Batches (${batches.length})`} />
        <Tab label="Supplier" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {tab === 0 && (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Batch #</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Received</TableCell>
                  <TableCell>Intake runs</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batches.map((b: any) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.batchNumber}</TableCell>
                    <TableCell>
                      {b.quantity} {b.unit}
                    </TableCell>
                    <TableCell>
                      {b.receivedDate
                        ? new Date(b.receivedDate).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {(b.checklistRuns || []).map((r: any) => (
                        <Chip
                          key={r.id}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                          label={`${r.kind} ${r.outcome || ''}`}
                          color={
                            r.outcome === 'PASS'
                              ? 'success'
                              : r.outcome === 'FAIL'
                                ? 'error'
                                : 'default'
                          }
                        />
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {tab === 1 && (
          <Paper sx={{ p: 2 }}>
            {data.supplier ? (
              <>
                <Typography variant="subtitle1">{data.supplier.name}</Typography>
                <Typography variant="body2">{data.supplier.country}</Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Full supplier dossier remains under Suppliers → dossier (master data API).
                </Typography>
              </>
            ) : (
              <Typography variant="body2">No linked supplier record.</Typography>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ProductDossier;
