import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  IconButton,
  LinearProgress,
  Alert,
} from '@mui/material';
import { X } from 'lucide-react';
import { api } from '../../services';
import type { SurveyCategoryGroup } from '../../types/survey.types';
import { ChecklistFormRouter } from './ChecklistFormRouter';

interface ChecklistRun {
  id: string;
  kind: string;
  status: string;
  outcome: string;
  displayId: string;
  template?: { questions?: unknown; categoryGroups?: SurveyCategoryGroup[] };
  templateSnapshot?: {
    questions?: unknown;
    categoryGroups?: SurveyCategoryGroup[];
    templateKey?: string;
  } | null;
  responses: { questionId: string; response: unknown }[];
}

export interface ChecklistRunDialogProps {
  open: boolean;
  runId: string | null;
  title?: string;
  onClose: () => void;
  onUpdated?: () => void;
}

export const ChecklistRunDialog: React.FC<ChecklistRunDialogProps> = ({
  open,
  runId,
  title = 'Checklist',
  onClose,
  onUpdated,
}) => {
  const [run, setRun] = useState<ChecklistRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!runId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<ChecklistRun>(`/api/checklists/runs/${runId}`);
      setRun(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load checklist');
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    if (open && runId) void load();
    else setRun(null);
  }, [open, runId, load]);

  const responsesToMap = (r: ChecklistRun | null) => {
    if (!r) return {};
    const m: Record<string, unknown> = {};
    for (const x of r.responses) {
      m[x.questionId] = x.response as unknown;
    }
    return m;
  };

  const handleSaveDraft = async (values: Record<string, unknown>) => {
    if (!run || run.status === 'COMPLETED') return;
    await api.patch(`/api/checklists/runs/${run.id}/draft`, { responses: values });
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!run) return;
    await api.post(`/api/checklists/runs/${run.id}/complete`, { responses: values });
    await load();
    onUpdated?.();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title}
        <IconButton size="small" onClick={onClose} aria-label="close">
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {run && !loading && (
          <Box sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
              <Typography variant="caption" color="text.secondary">
                ID: {run.displayId}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {run.kind}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {run.status}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {run.outcome}
              </Typography>
            </Stack>
            <ChecklistFormRouter
              key={`${run.id}-${run.status}`}
              title={title}
              templateSnapshot={run.templateSnapshot}
              template={run.template}
              initialValues={responsesToMap(run)}
              readOnly={run.status === 'COMPLETED'}
              onSave={handleSaveDraft}
              onSubmit={handleSubmit}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChecklistRunDialog;
