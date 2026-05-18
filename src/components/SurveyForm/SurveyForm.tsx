import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Container,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import SurveyCategoryGroups from './SurveyCategoryGroups';
import { renderSurveyField } from '../../lib/survey-field-renderer';
import type { SurveyCategoryGroup } from '../../types/survey.types';
import type { SurveyQuestion } from '../../types/survey.types';
import { isEntryFieldVisible } from '../../lib/packaging-survey-fields';
import type { GeoJSONData } from '../MapField';

type SurveyValue =
  | string
  | number
  | boolean
  | string[]
  | FileInfo[]
  | Record<string, unknown>[]
  | Record<string, unknown>
  | GeoJSONData
  | null;

interface FileInfo {
  id?: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  status?: 'uploading' | 'complete' | 'error';
  progress?: number;
}

interface SurveyFormProps {
  title?: string;
  description?: string;
  questions: SurveyQuestion[];
  categoryGroups?: SurveyCategoryGroup[];
  initialValues?: Record<string, unknown>;
  onSubmit?: (values: Record<string, unknown>) => void;
  onSave?: (values: Record<string, unknown>) => void;
  onNext?: (values: Record<string, unknown>) => void;
  onBack?: (values: Record<string, unknown>) => void;
  surveyToken?: string;
  readOnly?: boolean;
  useSteps?: boolean;
  stepSize?: number;
  applicableCertificates?: string[];
}

const SurveyForm: React.FC<SurveyFormProps> = ({
  title,
  description,
  questions,
  categoryGroups = [],
  initialValues = {},
  onSubmit,
  onSave,
  onNext,
  onBack,
  surveyToken,
  readOnly = false,
  useSteps = true,
  stepSize = 5,
  applicableCertificates = [],
}) => {
  const { t } = useTranslation(['surveyForm', 'common']);

  // Ensure questions is always an array
  const questionsArray = Array.isArray(questions) ? questions : [];

  const [activeStep, setActiveStep] = useState(0);
  const [values, setValues] = useState<Record<string, SurveyValue>>(
    (initialValues as Record<string, SurveyValue>) || {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const isInitialized = useRef(false);

  // Initialize form values when initial data loads, but prevent re-initialization on saves
  useEffect(() => {
    // Only initialize if we haven't yet, or if initialValues has actual data
    const hasInitialData =
      initialValues && Object.keys(initialValues).length > 0;

    if (!isInitialized.current && hasInitialData) {
      setValues((initialValues ?? {}) as Record<string, SurveyValue>);
      isInitialized.current = true;
    }
  }, [initialValues]);

  const handleValueChange = (id: string, value: SurveyValue) => {
    setValues(prev => {
      const updatedValues = { ...prev, [id]: value };

      if (onSave) {
        onSave(updatedValues as Record<string, unknown>);
      }

      return updatedValues;
    });

    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });

      if (validationErrors.length > 0) {
        setValidationErrors([]);
      }
    }
  };

  const validateForm = (stepQuestions: SurveyQuestion[] = questionsArray) => {
    const newErrors: Record<string, string> = {};
    const errorMessages: string[] = [];

    stepQuestions.forEach(q => {
      if (q.type === 'multi_entry' && q.entryFields) {
        const arrayValue = values[q.id];

        if (!Array.isArray(arrayValue)) {
          if (q.required) {
            newErrors[q.id] = t('surveyForm:validation.required');
            errorMessages.push(
              `${q.question}: ${t('surveyForm:validation.required')}`
            );
          }

          return;
        }

        const arrayValues = arrayValue as Record<string, unknown>[];

        if (
          q.required &&
          (arrayValues.length === 0 || arrayValues.length < (q.minEntries || 1))
        ) {
          const errorMsg = t('surveyForm:validation.minItems', {
            count: q.minEntries || 1,
          });
          newErrors[q.id] = errorMsg;
          errorMessages.push(`${q.question}: ${errorMsg}`);
        }

        if (arrayValues.length > 0) {
          arrayValues.forEach((item, idx) => {
            q.entryFields!.forEach(entryField => {
              if (!isEntryFieldVisible(item, entryField.visibleWhen)) {
                return;
              }
              if (
                entryField.required &&
                (item[entryField.id] === undefined ||
                  item[entryField.id] === null ||
                  item[entryField.id] === '' ||
                  (Array.isArray(item[entryField.id]) &&
                    (item[entryField.id] as unknown[]).length === 0))
              ) {
                newErrors[`${q.id}.${idx}.${entryField.id}`] = t(
                  'surveyForm:validation.required'
                );
                errorMessages.push(
                  `${q.question} - ${entryField.question}: ${t('surveyForm:validation.required')}`
                );
              }
            });
          });
        }
      } else if (q.required) {
        const value = values[q.id];
        if (value === null || value === '' || typeof value === 'undefined') {
          newErrors[q.id] = t('surveyForm:validation.required');
          errorMessages.push(
            `${q.question}: ${t('surveyForm:validation.required')}`
          );
        }
      }
    });

    setErrors(newErrors);
    setValidationErrors(errorMessages);
    return Object.keys(newErrors).length === 0;
  };

  const totalSteps = useSteps ? Math.ceil(questionsArray.length / stepSize) : 1;
  const steps = Array.from({ length: totalSteps }, (_, i) => ({
    label: t('surveyForm:step', { number: i + 1 }),
  }));

  const getCurrentStepQuestions = () => {
    if (!useSteps) return questionsArray;

    const start = activeStep * stepSize;
    const end = start + stepSize;

    return questionsArray.slice(start, end);
  };

  const handleNext = async () => {
    const currentQuestions = getCurrentStepQuestions();

    if (validateForm(currentQuestions)) {
      if (activeStep === totalSteps - 1) {
        setIsSubmitting(true);
        try {
          await onSubmit?.(values);
        } finally {
          setIsSubmitting(false);
        }
      } else {
        setIsNavigating(true);
        try {
          onNext?.(values);
          setActiveStep(activeStep + 1);
        } finally {
          setIsNavigating(false);
        }
      }
    }
  };

  const handleBack = async () => {
    setIsNavigating(true);
    try {
      onBack?.(values);
      setActiveStep(activeStep - 1);
    } finally {
      setIsNavigating(false);
    }
  };

  const renderField = (question: SurveyQuestion) => {
    return renderSurveyField({
      question,
      value: values[question.id],
      onChange: (id, value) => handleValueChange(id, value as SurveyValue),
      disabled: false,
      errors,
      surveyToken,
      applicableCertificates,
      readOnly,
      isSubmitting,
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {title && (
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
      )}

      {description && (
        <Typography variant="body1" paragraph>
          {description}
        </Typography>
      )}

      {useSteps && (
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      <Box component={Paper} sx={{ p: 1 }} elevation={0}>
        {categoryGroups.length > 0 ? (
          <SurveyCategoryGroups
            categoryGroups={categoryGroups}
            questions={getCurrentStepQuestions()}
            values={values}
            onChange={(id, value) =>
              handleValueChange(id, value as SurveyValue)
            }
            renderQuestionField={question =>
              renderField(question as SurveyQuestion)
            }
            disabled={readOnly || isSubmitting}
          />
        ) : (
          <Box>
            {getCurrentStepQuestions().map(question => renderField(question))}
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          {useSteps && activeStep > 0 && (
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={isNavigating || isSubmitting || readOnly}
              startIcon={isNavigating && <CircularProgress size={16} />}
            >
              {t('surveyForm:form.buttons.back')}
            </Button>
          )}
          <Box sx={{ flex: '1 1 auto' }} />
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={readOnly || isSubmitting || isNavigating}
            endIcon={
              (isSubmitting || isNavigating) && <CircularProgress size={20} />
            }
          >
            {isNavigating || isSubmitting
              ? t('surveyForm:form.status.saving')
              : activeStep === totalSteps - 1
                ? t('surveyForm:form.buttons.submit')
                : t('surveyForm:form.buttons.next')}
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={validationErrors.length > 0}
        autoHideDuration={5000}
        onClose={() => setValidationErrors([])}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ maxWidth: '600px' }}
      >
        <Alert
          severity="error"
          onClose={() => setValidationErrors([])}
          sx={{ width: '100%', maxHeight: '400px', overflowY: 'auto' }}
        >
          <Typography variant="subtitle2" gutterBottom>
            {t('surveyForm:validation.errorTitle')}
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {validationErrors.map((error, index) => (
              <li key={index}>
                <Typography variant="body2">{error}</Typography>
              </li>
            ))}
          </Box>
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SurveyForm;
