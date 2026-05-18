import React from 'react';
import SurveyTextField from '../components/SurveyForm/SurveyTextField';
import SurveySelectField from '../components/SurveyForm/SurveySelectField';
import SurveyBooleanField from '../components/SurveyForm/SurveyBooleanField';
import SurveyDateField from '../components/SurveyForm/SurveyDateField';
import SurveyFileField from '../components/SurveyForm/SurveyFileField';
import SurveyCertificateCollectionField from '../components/SurveyForm/SurveyCertificateCollectionField';
import SurveyMultiEntryField from '../components/SurveyForm/SurveyMultiEntryField';
import MapField, { type GeoJSONData } from '../components/MapField';
import type { SurveyQuestion, FileInfo } from '../types/survey.types';

export interface RenderFieldOptions {
  question: SurveyQuestion;
  value: unknown;
  onChange: (id: string, value: unknown) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
  surveyToken?: string;
  applicableCertificates?: string[];
  readOnly?: boolean;
  isSubmitting?: boolean;
  // For tracking files in multi-entry fields
  parentQuestionId?: string;
  entryIndex?: number;
}

/**
 * Renders a survey form field based on the question type
 * This is a reusable utility for rendering survey fields consistently
 */
export function renderSurveyField({
  question,
  value,
  onChange,
  disabled = false,
  errors = {},
  surveyToken,
  applicableCertificates = [],
  readOnly = false,
  isSubmitting = false,
  parentQuestionId,
  entryIndex,
}: RenderFieldOptions): React.ReactNode {
  const { id, type } = question;
  const hasError = !!errors[id];
  const isFieldDisabled = disabled || readOnly || isSubmitting;

  if (type === 'multi_entry' && question.entryFields) {
    return (
      <SurveyMultiEntryField
        key={id}
        id={id}
        question={question.question}
        required={question.required}
        value={(value as Array<Record<string, unknown>>) ?? []}
        onChange={onChange}
        entryFields={question.entryFields}
        minEntries={question.minEntries || 1}
        maxEntries={question.maxEntries || 100}
        addButtonLabel={question.addButtonLabel}
        removeButtonLabel={question.removeButtonLabel || 'Remove'}
        disabled={isFieldDisabled}
        error={hasError}
        helperText={errors[id]}
        surveyToken={surveyToken}
      />
    );
  }

  switch (type) {
    case 'text':
    case 'number':
    case 'email':
      return (
        <SurveyTextField
          key={id}
          id={id}
          question={question.question}
          required={question.required}
          value={(value as string | number) || ''}
          onChange={onChange}
          type={type as 'text' | 'number' | 'email'}
          validation={question.validation}
          disabled={isFieldDisabled}
          error={hasError}
          helperText={errors[id]}
        />
      );

    case 'select':
    case 'multiselect':
      return (
        <SurveySelectField
          key={id}
          id={id}
          question={question.question}
          required={question.required}
          value={
            type === 'multiselect'
              ? (value as string[]) || []
              : (value as string) || ''
          }
          onChange={onChange}
          options={question.options || []}
          multiple={type === 'multiselect'}
          disabled={isFieldDisabled}
          error={hasError}
          helperText={errors[id]}
        />
      );

    case 'boolean':
      return (
        <SurveyBooleanField
          key={id}
          id={id}
          question={question.question}
          required={question.required}
          value={(value as boolean) || false}
          onChange={onChange}
          disabled={isFieldDisabled}
          error={hasError}
          helperText={errors[id]}
        />
      );

    case 'date':
      return (
        <SurveyDateField
          key={id}
          id={id}
          question={question.question}
          required={question.required}
          value={(value as string | null) || null}
          onChange={onChange}
          disabled={isFieldDisabled}
          error={hasError}
          helperText={errors[id]}
        />
      );

    case 'file':
      return (
        <SurveyFileField
          key={id}
          id={id}
          question={question.question}
          required={question.required}
          value={(value as FileInfo[]) ?? []}
          onChange={onChange}
          disabled={isFieldDisabled}
          surveyToken={surveyToken}
          multiple={
            (question.validation?.min ?? 0) < (question.validation?.max ?? 0)
          }
          error={hasError}
          helperText={errors[id]}
          parentQuestionId={parentQuestionId}
          entryIndex={entryIndex}
        />
      );

    case 'map':
      return (
        <MapField
          key={id}
          value={(value as GeoJSONData) || null}
          onChange={geojson => onChange(id, geojson)}
          config={{
            mode: 'draw',
            ...question.mapConfig,
          }}
          disabled={isFieldDisabled}
          required={question.required}
          label={question.question}
          error={errors[id]}
        />
      );

    case 'certificate_collection':
      return (
        <SurveyCertificateCollectionField
          key={id}
          questionId={id}
          question={question.question}
          required={question.required}
          value={
            (value as Record<
              string,
              {
                hasIt: boolean;
                certNumber?: string;
                validityDate?: string;
                files?: FileInfo[];
              }
            >) || {}
          }
          onChange={newValue => onChange(id, newValue)}
          disabled={isFieldDisabled}
          applicableCertificates={applicableCertificates}
          token={surveyToken}
          error={hasError}
          helperText={errors[id]}
        />
      );

    default:
      return null;
  }
}
