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
} from '@mui/material';
import { Save, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RiskAssessment } from '../../types';

interface CreateVersionDialogProps {
  open: boolean;
  assessment: RiskAssessment | null;
  onClose: () => void;
  onCreateVersion: (versionNotes: string) => Promise<void>;
  isLoading?: boolean;
}

const CreateVersionDialog: React.FC<CreateVersionDialogProps> = ({
  open,
  assessment,
  onClose,
  onCreateVersion,
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
      await onCreateVersion(versionNotes.trim());
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
      <DialogTitle>{t('versioning.createNewVersion')}</DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Current version info */}
          {assessment && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                {t('versioning.currentVersion')}:{' '}
                <strong>v{assessment.version}</strong>
              </Typography>
              <Typography variant="body2">
                {t('versioning.newVersionWillBe')}:{' '}
                <strong>v{assessment.version + 1}</strong>
              </Typography>
            </Alert>
          )}

          {/* Version notes input */}
          <TextField
            label={t('versioning.versionNotes')}
            placeholder={t('versioning.versionNotesPlaceholder')}
            value={versionNotes}
            onChange={e => {
              setVersionNotes(e.target.value);
              setError(null);
            }}
            multiline
            rows={4}
            fullWidth
            required
            error={Boolean(error)}
            helperText={error || t('versioning.versionNotesHelp')}
            disabled={isLoading}
          />
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="caption">
              {t('versioning.createVersionWarning')}
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          startIcon={<X size={18} />}
        >
          {t('common:actions.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isLoading || !versionNotes.trim()}
          startIcon={
            isLoading ? <CircularProgress size={18} /> : <Save size={18} />
          }
        >
          {isLoading
            ? t('common:actions.saving')
            : t('versioning.createVersion')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateVersionDialog;
