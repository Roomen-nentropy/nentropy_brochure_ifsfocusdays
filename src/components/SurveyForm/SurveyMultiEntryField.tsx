import React from 'react';
import {
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { Add, Delete, ExpandMore } from '@mui/icons-material';
import { renderSurveyField } from '../../lib/survey-field-renderer';
import type { SurveyQuestion } from '../../types/survey.types';
import {
  isEntryFieldVisible,
  type EntryVisibleWhen,
} from '../../lib/packaging-survey-fields';

const EMPTY_ENTRY = {};

interface SurveyMultiEntryFieldProps {
  id: string;
  question: string;
  required: boolean;
  value: Record<string, unknown>[] | null;
  onChange: (id: string, value: Record<string, unknown>[]) => void;

  entryFields: SurveyQuestion[];
  minEntries?: number;
  maxEntries?: number;
  addButtonLabel?: string;
  removeButtonLabel?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  surveyToken?: string;
}

const SurveyMultiEntryField: React.FC<SurveyMultiEntryFieldProps> = ({
  id,
  question,
  required,
  value,
  onChange,
  entryFields,
  minEntries = 1,
  maxEntries = 100,
  addButtonLabel,
  disabled = false,
  error = false,
  helperText,
  surveyToken,
}) => {
  const entries = Array.isArray(value) ? value : [];

  const handleAddEntry = () => {
    if (entries.length < maxEntries) {
      onChange(id, [...entries, { ...EMPTY_ENTRY }]);
    }
  };

  const handleRemoveEntry = (index: number) => {
    const newEntries = [...entries];
    newEntries.splice(index, 1);
    onChange(id, newEntries);
  };

  const handleEntryFieldChange = (
    index: number,
    fieldId: string,
    fieldValue: unknown
  ) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [fieldId]: fieldValue };
    onChange(id, newEntries);
  };

  const renderField = (
    field: SurveyQuestion,
    entryIndex: number,
    fieldValue: unknown
  ) => {
    const onFieldChange = (id: string, value: unknown) => {
      handleEntryFieldChange(entryIndex, id, value);
    };

    return renderSurveyField({
      question: field,
      value: fieldValue,
      onChange: onFieldChange,
      disabled,
      errors: {},
      surveyToken,
      parentQuestionId: id,
      entryIndex: entryIndex,
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography
        variant="subtitle1"
        fontWeight="bold"
        sx={{ mb: 1 }}
        color={error ? 'error' : 'inherit'}
      >
        {question} {required && <span>*</span>}
      </Typography>

      {entries.length > 0 ? (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {entries.map((entry, index) => (
            <Accordion
              key={index}
              defaultExpanded={index === entries.length - 1}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls={`entry-${index}-content`}
                id={`entry-${index}-header`}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    my: 1,
                  },
                }}
              >
                <Typography variant="subtitle2" fontWeight="medium">
                  Entry #{index + 1}
                </Typography>
                <IconButton
                  size="small"
                  color="error"
                  onClick={e => {
                    e.stopPropagation();
                    handleRemoveEntry(index);
                  }}
                  disabled={disabled || entries.length <= minEntries}
                  aria-label={`Remove entry ${index + 1}`}
                  sx={{ mr: 1 }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {entryFields.map(field => {
                    const visibleWhen = (field as SurveyQuestion & {
                      visibleWhen?: EntryVisibleWhen;
                    }).visibleWhen;
                    if (!isEntryFieldVisible(entry, visibleWhen)) {
                      return null;
                    }
                    return renderField(field, index, entry[field.id]);
                  })}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No entries added yet. Click the button below to add your first entry.
        </Typography>
      )}

      <Button
        startIcon={<Add />}
        variant="outlined"
        onClick={handleAddEntry}
        disabled={disabled || entries.length >= maxEntries}
        sx={{ mt: 1 }}
      >
        {addButtonLabel || `Add ${question}`}
      </Button>

      {error && helperText && (
        <Typography
          variant="caption"
          color="error"
          sx={{ mt: 0.5, display: 'block' }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default SurveyMultiEntryField;
