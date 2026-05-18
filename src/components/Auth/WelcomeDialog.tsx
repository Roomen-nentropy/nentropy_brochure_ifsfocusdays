import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import BusinessTypeSelector from '../BusinessTypeSelector/BusinessTypeSelector';
import type { BusinessType } from '../BusinessTypeSelector/BusinessTypeSelector';

interface WelcomeDialogProps {
  open: boolean;
  onComplete: (businessType: BusinessType) => Promise<void>;
}

const WelcomeDialog: React.FC<WelcomeDialogProps> = ({ open, onComplete }) => {
  const { t } = useTranslation(['auth', 'businessTypeSelector']);
  const [selectedBusinessType, setSelectedBusinessType] = useState<
    BusinessType | undefined
  >();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!selectedBusinessType) return;

    setIsSubmitting(true);
    try {
      await onComplete(selectedBusinessType);
    } catch (error) {
      console.error('Failed to save business type:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          minHeight: '80vh',
        },
      }}
    >
      <DialogTitle>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('auth:welcome.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('auth:welcome.subtitle')}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <BusinessTypeSelector
          value={selectedBusinessType}
          onChange={setSelectedBusinessType}
          disabled={isSubmitting}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleContinue}
          disabled={!selectedBusinessType || isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
        >
          {isSubmitting ? t('auth:welcome.saving') : t('auth:welcome.continue')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WelcomeDialog;
