import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  LinearProgress,
  Alert,
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

interface MachineDossierProps {
  machineId: string;
  onOpenRun?: (runId: string, title: string) => void;
}

export const MachineDossier: React.FC<MachineDossierProps> = ({
  machineId,
  onOpenRun,
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['machine-dossier', machineId],
    queryFn: async () => {
      const res = await axios.get(
        `${API_BASE_URL}/api/dossiers/machines/${machineId}`,
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

  const runs = data.checklistRuns || [];

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">{data.code}</Typography>
        <Typography variant="body2">Model: {data.modelNumber}</Typography>
        {data.description && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {data.description}
          </Typography>
        )}
      </Paper>

      <Typography variant="subtitle1" gutterBottom>
        Checklists ({runs.length})
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Display ID</TableCell>
              <TableCell>Kind</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Outcome</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {runs.map((r: { id: string; displayId: string; kind: string; status: string; outcome: string }) => (
              <TableRow
                key={r.id}
                hover={!!onOpenRun}
                sx={{ cursor: onOpenRun ? 'pointer' : undefined }}
                onClick={() => onOpenRun?.(r.id, r.displayId)}
              >
                <TableCell>{r.displayId}</TableCell>
                <TableCell>{r.kind}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={r.outcome}
                    color={
                      r.outcome === 'PASS'
                        ? 'success'
                        : r.outcome === 'FAIL'
                          ? 'error'
                          : 'default'
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MachineDossier;
