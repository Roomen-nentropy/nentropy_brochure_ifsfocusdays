import React from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import type {
  SurveyCategoryGroup,
  SurveyQuestion,
} from '../../types/survey.types';

interface SurveyCategoryGroupsProps {
  categoryGroups: SurveyCategoryGroup[];
  questions: SurveyQuestion[];
  values: Record<string, unknown>;
  onChange: (id: string, value: unknown) => void;
  renderQuestionField: (
    question: unknown,
    values: Record<string, unknown>,
    onChange: (id: string, value: unknown) => void
  ) => React.ReactNode;
  disabled?: boolean;
}

const SurveyCategoryGroups: React.FC<SurveyCategoryGroupsProps> = ({
  categoryGroups,
  questions,
  values,
  onChange,
  renderQuestionField,
  disabled = false,
}) => {
  const groupedQuestions = questions.reduce(
    (groups, question) => {
      const groupId = question.groupId || 'ungrouped';
      if (!groups[groupId]) {
        groups[groupId] = [];
      }
      groups[groupId].push(question);
      return groups;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as Record<string, any[]>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;

  return (
    <Box aria-disabled={disabled}>
      {categoryGroups.map(group => {
        const groupQuestions = groupedQuestions[group.id] || [];

        if (groupQuestions.length === 0) return null;

        return (
          <Paper key={group.id} sx={{ p: 1, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              {group.title}
            </Typography>
            {group.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {group.description}
              </Typography>
            )}

            <Stack spacing={3}>
              {groupQuestions.map((question: unknown) =>
                renderQuestionField(question, values, onChange)
              )}
            </Stack>
          </Paper>
        );
      })}

      {groupedQuestions['ungrouped']?.length > 0 && (
        <Paper sx={{ p: 1 }}>
          <Stack spacing={3}>
            {groupedQuestions['ungrouped'].map((question: unknown) =>
              renderQuestionField(question, values, onChange)
            )}
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

export default SurveyCategoryGroups;
