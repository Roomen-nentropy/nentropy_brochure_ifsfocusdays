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

interface PlantDossierProps {
  plantId: string;
  onOpenRun?: (runId: string, title: string) => void;
}

export const PlantDossier: React.FC<PlantDossierProps> = ({
  plantId,
  onOpenRun,
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['plant-dossier', plantId],
    queryFn: async () => {
      const res = await axios.get(
        `${API_BASE_URL}/api/production/plants/${plantId}`,
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
  const machines = data.machines || [];

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">
          {data.code} — {data.name}
        </Typography>
        {data.location && (
          <Typography variant="body2" color="text.secondary">
            {data.location}
          </Typography>
        )}
        <Typography variant="body2" sx={{ mt: 1 }}>
          Machines: {machines.length}
        </Typography>
      </Paper>

      <Typography variant="subtitle1" gutterBottom>
        Plant checklists ({runs.length})
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Display ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Outcome</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {runs.map((r: { id: string; displayId: string; status: string; outcome: string }) => (
              <TableRow
                key={r.id}
                hover={!!onOpenRun}
                sx={{ cursor: onOpenRun ? 'pointer' : undefined }}
                onClick={() => onOpenRun?.(r.id, r.displayId)}
              >
                <TableCell>{r.displayId}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>
                  <Chip size="small" label={r.outcome} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {machines.length > 0 && (
        <>
          <Typography variant="subtitle2" gutterBottom>
            Machines in this plant
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Model</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {machines.map((m: { id: string; code: string; modelNumber: string }) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.code}</TableCell>
                    <TableCell>{m.modelNumber}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default PlantDossier;
