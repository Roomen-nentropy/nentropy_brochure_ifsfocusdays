import React, { useEffect, useState } from 'react';
import { Box, Button, Stack, Alert } from '@mui/material';
import SurveyForm from '../SurveyForm/SurveyForm';
import type { SurveyCategoryGroup, SurveyQuestion } from '../../types/survey.types';
import {
  getChecklistDefinition,
  resolveChecklistQuestionsForForm,
} from '../../lib/checklistQuestionnaireAdapter';
import { BulchikenChecklistBody } from './BulchikenChecklistForms';

export interface ChecklistFormRouterProps {
  title: string;
  templateSnapshot?: {
    questions?: unknown;
    categoryGroups?: SurveyCategoryGroup[];
    templateKey?: string;
  } | null;
  template?: { questions?: unknown; categoryGroups?: SurveyCategoryGroup[] };
  initialValues: Record<string, unknown>;
  readOnly: boolean;
  onSave?: (values: Record<string, unknown>) => Promise<void>;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
}

export const ChecklistFormRouter: React.FC<ChecklistFormRouterProps> = ({
  title,
  templateSnapshot,
  template,
  initialValues,
  readOnly,
  onSave,
  onSubmit,
}) => {
  const def = getChecklistDefinition(templateSnapshot ?? template ?? null);
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  if (!def) {
    const questions = resolveChecklistQuestionsForForm(
      templateSnapshot ?? template ?? null
    );
    return (
      <SurveyForm
        title={title}
        questions={questions as SurveyQuestion[]}
        categoryGroups={
          (templateSnapshot?.categoryGroups as SurveyCategoryGroup[]) ||
          (template?.categoryGroups as SurveyCategoryGroup[]) ||
          []
        }
        initialValues={initialValues}
        readOnly={readOnly}
        useSteps={false}
        onSave={onSave}
        onSubmit={onSubmit}
      />
    );
  }

  const handleSave = async () => {
    if (!onSave || readOnly) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(values);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submit failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <BulchikenChecklistBody
        definition={def}
        values={values}
        readOnly={readOnly}
        onChange={setValues}
        templateKey={templateSnapshot?.templateKey}
      />
      {!readOnly && (
        <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
          {onSave && (
            <Button variant="outlined" disabled={saving} onClick={() => void handleSave()}>
              Save draft
            </Button>
          )}
          <Button variant="contained" disabled={saving} onClick={() => void handleSubmit()}>
            Complete
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default ChecklistFormRouter;
