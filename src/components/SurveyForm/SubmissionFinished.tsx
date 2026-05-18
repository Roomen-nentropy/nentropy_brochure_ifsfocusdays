import { Paper, Typography, Button, Box } from '@mui/material';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SurveyInstance } from '../../types/survey.types';

export const SurveySubmissionFinished = ({
  survey,
}: {
  survey?: SurveyInstance;
}) => {
  const { t } = useTranslation(['surveyForm']);

  return (
    <Box maxWidth="md" mx="auto" p={3}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CheckCircle
            color="green"
            size={24}
            style={{ marginRight: '12px' }}
          />
          <Typography variant="h5">
            {t('surveyForm:submission.surveyCompleted')}
          </Typography>
        </Box>

        <Typography variant="body1" paragraph>
          {t('surveyForm:submission.noMoreChanges')}
        </Typography>

        {survey?.completedAt && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            {t('surveyForm:submission.completedOn', {
              date: new Date(survey.completedAt).toLocaleDateString(),
            })}
          </Typography>
        )}

        <Box
          sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}
        >
          <Typography variant="subtitle1" gutterBottom>
            {t('surveyForm:submission.whatHappensNext')}
          </Typography>
          <Typography variant="body2">
            {t('surveyForm:submission.reviewProcess')}
          </Typography>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" href="/">
            {t('surveyForm:submission.returnToDashboard')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
