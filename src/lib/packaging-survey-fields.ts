import type { SurveyQuestion } from '../types/survey.types';

export type EntryVisibleWhen =
  | { fieldId: string; equals: string }
  | { fieldId: string; notEquals: string };

const PACKAGING_FIELD_IDS = new Set([
  'packaging_document',
  'packaging_expiry_date',
  'good_type',
  'technical_spec',
  'eu_declaration',
]);

const WOOD_ENTRY_FIELD_IDS = new Set([
  'wood_species_common',
  'wood_species_scientific',
  'species_percentage',
]);

export function parseSurveyMetadata(
  metadata: unknown
): Record<string, unknown> {
  if (!metadata) return {};
  if (typeof metadata === 'string') {
    try {
      const parsed = JSON.parse(metadata) as Record<string, unknown>;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  if (typeof metadata === 'object') {
    return metadata as Record<string, unknown>;
  }
  return {};
}

export function surveyIncludesPackaging2025_40(metadata: unknown): boolean {
  return parseSurveyMetadata(metadata).includePackaging2025_40 === true;
}

export function isEntryFieldVisible(
  entry: Record<string, unknown>,
  visibleWhen?: EntryVisibleWhen
): boolean {
  if (!visibleWhen) return true;
  const val = String(entry[visibleWhen.fieldId] ?? '');
  if ('equals' in visibleWhen && visibleWhen.equals !== undefined) {
    return val === visibleWhen.equals;
  }
  if ('notEquals' in visibleWhen && visibleWhen.notEquals !== undefined) {
    return val !== visibleWhen.notEquals;
  }
  return true;
}

export type PackagingFieldLabels = {
  goodType: string;
  technicalSpec: string;
  euDeclaration: string;
  expiry: string;
};

const defaultLabels: PackagingFieldLabels = {
  goodType: 'Good type',
  technicalSpec: 'Technical specification',
  euDeclaration: 'EU declaration of conformity (2025/40 model)',
  expiry: 'Document expiration date (optional)',
};

/**
 * Injects EU 2025/40 packaging fields into the products multi_entry question.
 * Only call when includePackaging2025_40 is true on the survey instance.
 */
export function applyPackagingFieldsToQuestions(
  questions: SurveyQuestion[],
  labels: PackagingFieldLabels = defaultLabels
): SurveyQuestion[] {
  if (!Array.isArray(questions)) return [];

  const packagingWhen: EntryVisibleWhen = {
    fieldId: 'good_type',
    equals: 'Packaging',
  };
  const nonPackagingWhen: EntryVisibleWhen = {
    fieldId: 'good_type',
    notEquals: 'Packaging',
  };

  return questions.map(q => {
    if (q.id !== 'products' || q.type !== 'multi_entry' || !q.entryFields) {
      return q;
    }

    const baseFields = q.entryFields
      .filter(ef => !PACKAGING_FIELD_IDS.has(ef.id))
      .map(ef => {
        if (!WOOD_ENTRY_FIELD_IDS.has(ef.id)) return ef;
        return {
          ...ef,
          visibleWhen: nonPackagingWhen,
        };
      });

    const packagingFields: SurveyQuestion[] = [
      {
        id: 'good_type',
        type: 'select',
        question: labels.goodType,
        required: true,
        options: ['Packaging', 'Other'],
      },
      {
        id: 'technical_spec',
        type: 'file',
        question: labels.technicalSpec,
        required: true,
        validation: { min: 1, max: 10 },
        visibleWhen: packagingWhen,
      },
      {
        id: 'eu_declaration',
        type: 'file',
        question: labels.euDeclaration,
        required: true,
        validation: { min: 1, max: 10 },
        visibleWhen: packagingWhen,
      },
      {
        id: 'packaging_expiry_date',
        type: 'date',
        question: labels.expiry,
        required: false,
        visibleWhen: packagingWhen,
      },
    ];

    const coreIds = new Set(['product_name', 'hs_code', 'product_description']);
    const core = baseFields.filter(ef => coreIds.has(ef.id));
    const rest = baseFields.filter(ef => !coreIds.has(ef.id));

    return {
      ...q,
      entryFields: [...core, ...packagingFields, ...rest],
    };
  });
}
