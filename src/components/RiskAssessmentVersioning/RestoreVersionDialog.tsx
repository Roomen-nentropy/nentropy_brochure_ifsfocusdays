import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import { RotateCcw, X, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import type { RiskAssessment } from '../../types';

interface RestoreVersionDialogProps {
  open: boolean;
  currentVersion: RiskAssessment | null;
  versionToRestore: RiskAssessment | null;
  onClose: () => void;
  onRestore: (versionNotes: string) => Promise<void>;
  isLoading?: boolean;
}

const RestoreVersionDialog: React.FC<RestoreVersionDialogProps> = ({
  open,
  currentVersion,
  versionToRestore,
  onClose,
  onRestore,
  isLoading,
}) => {
  const { t } = useTranslation(['riskAssessments', 'common']);
  const [versionNotes, setVersionNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!versionNotes.trim()) {
      setError(t('riskAssessments:versionNotesRequired'));
      return;
    }

    try {
      await onRestore(versionNotes.trim());
      setVersionNotes('');
      setError(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common:errors.generic'));
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setVersionNotes('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <RotateCcw size={24} />
          {t('riskAssessments:restoreVersion')}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Warning */}
          <Alert
            severity="warning"
            icon={<AlertTriangle size={20} />}
            sx={{ mb: 3 }}
          >
            <Typography variant="body2" gutterBottom>
              <strong>{t('riskAssessments:restoreVersionWarning')}</strong>
            </Typography>
            <Typography variant="caption">
              {t('riskAssessments:restoreVersionExplanation')}
            </Typography>
          </Alert>

          {/* Version info */}
          {versionToRestore && currentVersion && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('riskAssessments:restoringFrom')}:
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box>
                  <Chip
                    label={`v${versionToRestore.version}`}
                    color="secondary"
                    size="small"
                  />
                  <Typography variant="caption" display="block" mt={0.5}>
                    {format(
                      new Date(versionToRestore.createdAt),
                      'MMM dd, yyyy HH:mm'
                    )}
                  </Typography>
                </Box>
                <Typography>→</Typography>
                <Box>
                  <Chip
                    label={`v${currentVersion.version + 1} (${t('riskAssessments:new')})`}
                    color="primary"
                    size="small"
                  />
                  <Typography variant="caption" display="block" mt={0.5}>
                    {t('riskAssessments:willBeCreated')}
                  </Typography>
                </Box>
              </Box>

              {versionToRestore.versionNotes && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('riskAssessments:originalVersionNotes')}:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontStyle: 'italic', mt: 0.5 }}
                  >
                    "{versionToRestore.versionNotes}"
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Version notes input */}
          <TextField
            label={t('riskAssessments:versionNotes')}
            placeholder={t('riskAssessments:restoreVersionNotesPlaceholder')}
            value={versionNotes}
            onChange={e => {
              setVersionNotes(e.target.value);
              setError(null);
            }}
            multiline
            rows={3}
            fullWidth
            required
            error={Boolean(error)}
            helperText={error || t('riskAssessments:explainWhyRestoring')}
            disabled={isLoading}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          startIcon={<X size={18} />}
        >
          {t('common:cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="secondary"
          disabled={isLoading || !versionNotes.trim()}
          startIcon={
            isLoading ? <CircularProgress size={18} /> : <RotateCcw size={18} />
          }
        >
          {isLoading
            ? t('common:restoring')
            : t('riskAssessments:restoreVersion')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RestoreVersionDialog;
