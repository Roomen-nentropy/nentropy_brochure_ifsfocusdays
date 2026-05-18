import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Send } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  usePublicSurvey,
  useUpdateSurveyResponse,
  useSubmitSurveyResponse,
} from '../../hooks/useSurveys';
import {
  calculateCompletionPercentage,
  normalizeSurveyQuestions,
} from '../../lib/survey-utils';
import {
  translateQuestions,
  translateCategoryGroups,
  type TemplateTranslations,
} from '../../lib/survey-translations';
import SurveyForm from './SurveyForm';
import { SurveySubmissionFinished } from './SubmissionFinished';
import SurveyLanguageSelector from './SurveyLanguageSelector';
import {
  applyPackagingFieldsToQuestions,
  surveyIncludesPackaging2025_40,
} from '../../lib/packaging-survey-fields';
import type { SurveyQuestion } from '../../types/survey.types';

interface PublicSurveyFormProps {
  token?: string;
}

const PublicSurveyForm: React.FC<PublicSurveyFormProps> = ({
  token: propToken,
}) => {
  const { token: paramToken } = useParams<{ token: string }>();
  const { t } = useTranslation(['surveyForm', 'common', 'surveys']);
  const token = propToken || paramToken || '';

  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  const {
    data: survey,
    isLoading,
    error: surveyError,
  } = usePublicSurvey(token);

  const updateResponseMutation = useUpdateSurveyResponse();
  const submitSurveyMutation = useSubmitSurveyResponse();

  // Set initial language based on survey's suggested language
  useEffect(() => {
    if (survey?.translationData?.suggestedLanguage) {
      setSelectedLanguage(survey.translationData.suggestedLanguage);
    }
  }, [survey?.translationData?.suggestedLanguage]);

  useEffect(() => {
    if (survey?.responses) {
      const initialResponses: Record<string, unknown> = {};

      survey.responses.forEach(response => {
        try {
          initialResponses[response.questionId] = JSON.parse(response.response);
        } catch {
          initialResponses[response.questionId] = response.response;
        }
      });

      setResponses(initialResponses);
    }
  }, [survey]);

  const handleSave = useCallback(
    async (values: Record<string, unknown>) => {
      if (!token || !survey) return;

      setResponses(values);
    },
    [token, survey]
  );

  const handleNext = useCallback(
    async (values: Record<string, unknown>) => {
      if (!token || !survey) return;

      window.scrollTo({ top: 0, behavior: 'smooth' });

      setIsSaving(true);

      try {
        await updateResponseMutation.mutateAsync({
          token,
          data: {
            responses: values as Record<
              string,
              string | number | boolean | string[]
            >,
            isFinal: false,
          },
        });

        // Update local state after successful save to ensure consistency
        setResponses({ ...values });
      } catch (err) {
        console.error('Failed to save on next:', err);
        // Still update local state even if save failed
        setResponses({ ...values });
      } finally {
        setIsSaving(false);
      }
    },
    [token, survey, updateResponseMutation]
  );

  const handleBack = useCallback(
    async (values: Record<string, unknown>) => {
      if (!token || !survey) return;

      window.scrollTo({ top: 0, behavior: 'smooth' });

      setIsSaving(true);
      try {
        await updateResponseMutation.mutateAsync({
          token,
          data: {
            responses: values as Record<
              string,
              string | number | boolean | string[]
            >,
            isFinal: false,
          },
        });

        setResponses({ ...values });
      } catch (err) {
        console.error('Failed to save on back:', err);

        setResponses({ ...values });
      } finally {
        setIsSaving(false);
      }
    },
    [token, survey, updateResponseMutation]
  );

  const [submittedData, setSubmittedData] = useState<Record<
    string,
    unknown
  > | null>(null);

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!token || survey?.status === 'COMPLETED') return;

    setSubmittedData(values);
    setShowSubmitDialog(true);
  };

  const closeSubmitDialog = () => {
    setShowSubmitDialog(false);
  };

  const confirmSubmit = async () => {
    if (!submittedData || !token) return;

    setSubmitting(true);

    try {
      await updateResponseMutation.mutateAsync({
        token,
        data: {
          responses: submittedData as Record<
            string,
            string | number | boolean | string[]
          >,
          isFinal: true,
        },
      });

      await submitSurveyMutation.mutateAsync(token);

      setShowSubmitDialog(false);
    } catch (err) {
      console.error('Failed to submit survey:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (surveyError) {
    return (
      <Box maxWidth="md" mx="auto" p={3}>
        <Alert severity="error">
          {surveyError instanceof Error
            ? surveyError.message
            : t('surveyForm:form.messages.failedToLoad')}
        </Alert>
      </Box>
    );
  }

  if (!survey) {
    return (
      <Box maxWidth="md" mx="auto" p={3}>
        <Alert severity="warning">
          {t('surveyForm:form.messages.surveyNotFound')}
        </Alert>
      </Box>
    );
  }

  const completionPercentage = calculateCompletionPercentage(survey, responses);
  const surveyIsExpired = new Date() > new Date(survey.expiresAt);
  const surveyIsCompleted = survey.status === 'COMPLETED';
  const isReadOnly = surveyIsCompleted || surveyIsExpired;

  if (surveyIsExpired) {
    return (
      <Box maxWidth="md" mx="auto" p={3}>
        <Alert severity="error">
          {t('surveyForm:form.messages.surveyExpired')}
        </Alert>
      </Box>
    );
  }

  if (surveyIsCompleted) {
    return <SurveySubmissionFinished survey={survey} />;
  }

  // Translate questions and category groups based on selected language
  const translatedQuestions = survey.template?.translations
    ? translateQuestions(
        survey.template.questions ?? [],
        survey.template.translations as TemplateTranslations,
        selectedLanguage
      )
    : (survey.template?.questions ?? []);

  const includePackaging2025_40 = surveyIncludesPackaging2025_40(survey.metadata);
  const includeEudrSections = survey.includePlotQuestion !== false;

  const baseQuestions = translatedQuestions as SurveyQuestion[];

  if (baseQuestions.length === 0) {
    return (
      <Box maxWidth="md" mx="auto" p={3}>
        <Alert severity="error">
          {t('surveyForm:form.messages.surveyQuestionsMissing')}
        </Alert>
      </Box>
    );
  }

  const questionsWithPackaging = includePackaging2025_40
    ? applyPackagingFieldsToQuestions(baseQuestions, {
        goodType: t('surveys:dialog.packagingGoodType'),
        technicalSpec: t('surveys:dialog.packagingTechnicalSpec'),
        euDeclaration: t('surveys:dialog.packagingEuDeclaration'),
        expiry: t('surveys:dialog.packagingExpiry'),
      })
    : baseQuestions;

  const translatedCategoryGroups = survey.template?.translations
    ? translateCategoryGroups(
        survey.template.categoryGroups ?? [],
        survey.template.translations as TemplateTranslations,
        selectedLanguage
      )
    : (survey.template?.categoryGroups ?? []);

  const supportedLanguages = survey.translationData?.supportedLanguages ?? [
    'en',
  ];

  return (
    <Box maxWidth="lg" mx="auto" p={3}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {survey.template?.name}
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          {survey.template?.description}
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
          {includePackaging2025_40 && (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={t('surveys:dialog.includePackaging2025_40')}
            />
          )}
          {!includeEudrSections && (
            <Chip
              size="small"
              variant="outlined"
              label={t('surveys:public.eudrSectionsExcluded')}
            />
          )}
        </Stack>

        {/* Language Selector */}
        <SurveyLanguageSelector
          currentLanguage={selectedLanguage}
          supportedLanguages={supportedLanguages}
          onLanguageChange={setSelectedLanguage}
        />

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="body2">
            {t('surveyForm:form.status.progress')}
          </Typography>
          <Box flexGrow={1}>
            <LinearProgress
              variant="determinate"
              value={completionPercentage}
            />
          </Box>
          <Typography variant="body2">{completionPercentage}%</Typography>
        </Box>
        {isSaving && (
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <CircularProgress size={16} />
            <Typography variant="caption" color="textSecondary">
              {t('surveyForm:form.status.saving')}
            </Typography>
          </Box>
        )}
      </Paper>

      <SurveyForm
        title={undefined}
        description={undefined}
        questions={questionsWithPackaging}
        categoryGroups={translatedCategoryGroups}
        initialValues={responses}
        onSave={handleSave}
        onNext={handleNext}
        onBack={handleBack}
        onSubmit={handleSubmit}
        surveyToken={token}
        readOnly={isReadOnly}
        useSteps={true}
        stepSize={5}
        applicableCertificates={
          (survey.metadata?.applicableCertificates as string[]) ?? []
        }
      />

      <Dialog open={showSubmitDialog} onClose={closeSubmitDialog}>
        <DialogTitle>{t('surveyForm:form.dialog.submitTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('surveyForm:form.dialog.submitConfirmation')}
          </DialogContentText>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            {t('surveyForm:form.status.completion', {
              percentage: completionPercentage,
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSubmitDialog}>
            {t('surveyForm:form.buttons.cancel')}
          </Button>
          <Button
            onClick={confirmSubmit}
            variant="contained"
            disabled={submitting}
            startIcon={<Send size={18} />}
          >
            {submitting
              ? t('surveyForm:form.status.submitting')
              : t('surveyForm:form.buttons.submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PublicSurveyForm;
