import React from 'react';
import { Alert, Button, Box, Typography } from '@mui/material';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface TrialBannerProps {
  trialEndsAt: Date | string;
}

const TrialBanner: React.FC<TrialBannerProps> = ({ trialEndsAt }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('subscription');

  const calculateDaysRemaining = () => {
    const now = new Date();
    const endDate = new Date(trialEndsAt);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();

  if (daysRemaining < 0) return null;

  const severity = daysRemaining <= 2 ? 'warning' : 'info';

  const getMessage = () => {
    if (daysRemaining === 0) {
      return t('trial.endsToday');
    } else if (daysRemaining === 1) {
      return t('trial.daysRemaining', { count: 1 });
    } else {
      return t('trial.daysRemaining', { count: daysRemaining });
    }
  };

  return (
    <Alert
      severity={severity}
      icon={<Clock size={20} />}
      sx={{ mb: 2 }}
      action={
        <Button
          size="small"
          variant="outlined"
          onClick={() => navigate('/settings')}
        >
          {t('trial.subscribeButton')}
        </Button>
      }
    >
      <Box>
        <Typography variant="body2" fontWeight="bold">
          {getMessage()}
        </Typography>
        <Typography variant="caption">{t('trial.subscribeMessage')}</Typography>
      </Box>
    </Alert>
  );
};

export default TrialBanner;
