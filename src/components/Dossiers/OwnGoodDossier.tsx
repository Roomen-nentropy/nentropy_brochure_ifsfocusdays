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
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../../services';

interface OwnGoodDossierProps {
  ownGoodId: string;
}

export const OwnGoodDossier: React.FC<OwnGoodDossierProps> = ({ ownGoodId }) => {
  const [tab, setTab] = React.useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['own-good-dossier', ownGoodId],
    queryFn: async () => {
      const res = await axios.get(
        `${API_BASE_URL}/api/dossiers/own-goods/${ownGoodId}`,
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
  const orders = data.productionOrders || [];
  const goodLabs = data.labAttachments || [];

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">{data.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          HS {data.hsCode}
        </Typography>
      </Paper>

      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label={`Batches (${batches.length})`} />
        <Tab label={`Production orders (${orders.length})`} />
        <Tab label={`Lab (good-level) (${goodLabs.length})`} />
        <Tab label="Recipe" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {tab === 0 && (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Batch #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Tech / lab</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batches.map((b: any) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.batchNumber}</TableCell>
                    <TableCell>
                      {b.productionDate
                        ? new Date(b.productionDate).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {b.quantity} {b.unit}
                    </TableCell>
                    <TableCell>
                      {(b.labAttachments || []).length} lab file(s)
                      {b.productionOrder?.checklistRuns?.length ? (
                        <Chip
                          size="small"
                          sx={{ ml: 1 }}
                          label="Tech checklist"
                          color="primary"
                          variant="outlined"
                        />
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 1 && (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Output batch</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell>{o.orderNumber}</TableCell>
                    <TableCell>{o.status}</TableCell>
                    <TableCell>
                      {o.outputOwnGoodBatch?.batchNumber || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 2 && (
          <List dense>
            {goodLabs.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No good-level lab files.
              </Typography>
            )}
            {goodLabs.map((f: any) => (
              <ListItem key={f.id}>
                <ListItemText primary={f.filename} secondary={f.title || f.notes} />
              </ListItem>
            ))}
          </List>
        )}

        {tab === 3 && (
          <Paper sx={{ p: 2 }}>
            {(data.recipeIngredients || []).map((ri: any) => (
              <Typography key={ri.id} variant="body2">
                {ri.product?.name}: {ri.percentage}%
              </Typography>
            ))}
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default OwnGoodDossier;
