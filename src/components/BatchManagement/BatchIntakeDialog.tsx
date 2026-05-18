import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tabs,
  Tab,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemText,
  IconButton,
  LinearProgress,
  Alert,
} from '@mui/material';
import { X, Upload } from 'lucide-react';
import { api, API_BASE_URL } from '../../services';
import SurveyForm from '../SurveyForm/SurveyForm';
import type { SurveyQuestion, SurveyCategoryGroup } from '../../types/survey.types';
import { resolveChecklistQuestionsForForm } from '../../lib/checklistQuestionnaireAdapter';

interface ChecklistRun {
  id: string;
  kind: string;
  status: string;
  outcome: string;
  displayId: string;
  template?: { questions?: SurveyQuestion[]; categoryGroups?: SurveyCategoryGroup[] };
  templateSnapshot?: {
    questions?: SurveyQuestion[];
    categoryGroups?: SurveyCategoryGroup[];
  } | null;
  responses: { questionId: string; response: unknown }[];
  files: { id: string; filename: string; s3Url?: string | null }[];
}

interface BatchIntakeDialogProps {
  open: boolean;
  batchId: string | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export const BatchIntakeDialog: React.FC<BatchIntakeDialogProps> = ({
  open,
  batchId,
  onClose,
  onUpdated,
}) => {
  const [runs, setRuns] = useState<ChecklistRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subTab, setSubTab] = useState(0);
  const [backfilling, setBackfilling] = useState(false);

  const loadRuns = useCallback(async () => {
    if (!batchId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<ChecklistRun[]>(
        `/api/checklists/runs?productBatchId=${encodeURIComponent(batchId)}`
      );
      setRuns(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load intake');
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    if (open && batchId) {
      void loadRuns();
    }
  }, [open, batchId, loadRuns]);

  const handleBackfill = async () => {
    if (!batchId) return;
    setBackfilling(true);
    setError(null);
    try {
      await api.post(`/api/checklists/runs/intake/${batchId}`);
      await loadRuns();
      onUpdated?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create intake');
    } finally {
      setBackfilling(false);
    }
  };

  const qualityRun = runs.find(r => r.kind === 'INTAKE_QUALITY');
  const transportRun = runs.find(r => r.kind === 'INTAKE_TRANSPORT');
  const activeRun = subTab === 0 ? qualityRun : transportRun;

  const responsesToMap = (run: ChecklistRun | undefined) => {
    if (!run) return {};
    const m: Record<string, unknown> = {};
    for (const r of run.responses) {
      m[r.questionId] = r.response as unknown;
    }
    return m;
  };

  const handleSaveDraft = async (values: Record<string, unknown>) => {
    if (!activeRun || activeRun.status === 'COMPLETED') return;
    await api.patch(`/api/checklists/runs/${activeRun.id}/draft`, {
      responses: values,
    });
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!activeRun) return;
    await api.post(`/api/checklists/runs/${activeRun.id}/complete`, {
      responses: values,
    });
    await loadRuns();
    onUpdated?.();
  };

  const uploadMisc = async (file: File) => {
    if (!transportRun || transportRun.status === 'COMPLETED') return;
    const fd = new FormData();
    fd.append('file', file);
    await fetch(
      `${API_BASE_URL}/api/checklists/runs/${transportRun.id}/upload/attachment`,
      { method: 'POST', body: fd, credentials: 'include' }
    );
    await loadRuns();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
        Intake control
        <IconButton size="small" onClick={onClose}>
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
        {!loading && runs.length === 0 && batchId && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              No intake checklists for this batch yet.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => void handleBackfill()}
              disabled={backfilling}
            >
              {backfilling ? 'Creating…' : 'Create intake checklists'}
            </Button>
          </Box>
        )}
        {runs.length > 0 && (
          <>
            <Tabs value={subTab} onChange={(_, v) => setSubTab(v)}>
              <Tab label="Quality" />
              <Tab label="Transport control" />
            </Tabs>
            {activeRun && (
              <Box sx={{ mt: 2 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    ID: {activeRun.displayId}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Status: {activeRun.status}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Outcome: {activeRun.outcome}
                  </Typography>
                </Stack>
                <SurveyForm
                  key={`${activeRun.id}-${activeRun.status}`}
                  title={subTab === 0 ? 'Intake quality' : 'Transport control'}
                  questions={resolveChecklistQuestionsForForm(
                    {
                      questions:
                        (activeRun.templateSnapshot?.questions as
                          | SurveyQuestion[]
                          | undefined) ??
                        activeRun.template?.questions,
                    },
                    { runId: activeRun.id, kind: activeRun.kind }
                  )}
                  categoryGroups={
                    (activeRun.templateSnapshot
                      ?.categoryGroups as SurveyCategoryGroup[]) ||
                    activeRun.template?.categoryGroups ||
                    []
                  }
                  initialValues={responsesToMap(activeRun)}
                  readOnly={activeRun.status === 'COMPLETED'}
                  useSteps={false}
                  onSave={handleSaveDraft}
                  onSubmit={handleSubmit}
                />
                {subTab === 1 && activeRun.status !== 'COMPLETED' && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Attachments (loggers, scans)
                    </Typography>
                    <Button
                      component="label"
                      variant="outlined"
                      size="small"
                      startIcon={<Upload size={16} />}
                    >
                      Upload file
                      <input
                        type="file"
                        hidden
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) void uploadMisc(f);
                          e.target.value = '';
                        }}
                      />
                    </Button>
                    <List dense>
                      {transportRun?.files?.map(f => (
                        <ListItem key={f.id}>
                          <ListItemText
                            primary={f.filename}
                            secondary={f.s3Url || ''}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BatchIntakeDialog;
