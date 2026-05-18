import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { subscription } from '../../lib/auth';
import PricingCards from './PricingCards';
import type { BusinessType } from '../BusinessTypeSelector/BusinessTypeSelector';

interface SubscriptionModalProps {
  open: boolean;
  businessType?: BusinessType;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  open,
  businessType,
}) => {
  const { t } = useTranslation('subscription');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planName: string, annual: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const result = await subscription.upgrade({
        plan: planName,
        annual,
        successUrl: `${window.location.origin}/dashboard?subscribed=true`,
        cancelUrl: window.location.href,
        disableRedirect: false,
      });

      if (result.error) {
        setError(result.error.message || t('errors.checkoutFailed'));
        setLoading(false);
      }
      // If successful, user will be redirected to Stripe Checkout
    } catch (err) {
      console.error('Subscription error:', err);
      setError(t('errors.unexpectedError'));
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: { minHeight: '80vh' },
      }}
    >
      <DialogTitle>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('modal.trialExpired.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('modal.trialExpired.subtitle')}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="bold">
            {t('modal.trialExpired.infoTitle')}
          </Typography>
          <Typography variant="body2">
            {t('modal.trialExpired.infoMessage')}
          </Typography>
        </Alert>

        <PricingCards
          currentBusinessType={businessType}
          onSelectPlan={handleSubscribe}
          loading={loading}
          showAnnual={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
