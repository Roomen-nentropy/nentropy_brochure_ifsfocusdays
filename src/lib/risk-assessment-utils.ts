import type { RiskAssessment } from '../types';

export interface FormField {
  key: string;
  label: string;
  type:
    | 'text'
    | 'textarea'
    | 'select'
    | 'multiselect'
    | 'number'
    | 'date'
    | 'checkbox'
    | 'file'
    | 'plantation_multi_entry'
    | 'readonly';
  options?: string[];
  optionsTranslationKey?: string;
  section?: string;
  required?: boolean;
  placeholder?: string;
}

export const calculateWeightedRiskScore = (
  responses: Record<string, unknown>
): {
  overallScore: number;
  riskLevel: string;
  breakdown: Record<string, number>;
} => {
  const weights = {
    legalRiskScore: 0.4,
    speciesRiskScore: 0.3,
    socialRiskScore: 0.3,
  };

  let totalScore = 0;
  const breakdown: Record<string, number> = {};

  Object.entries(weights).forEach(([scoreField, weight]) => {
    const score = responses[scoreField];
    if (score && typeof score === 'string') {
      const numericScore = parseInt(score);
      if (!isNaN(numericScore)) {
        const weightedScore = numericScore * weight;
        totalScore += weightedScore;
        breakdown[scoreField.replace('RiskScore', '')] = weightedScore;
      }
    }
  });

  let riskLevel = 'LOW (1.0-2.0)';
  if (totalScore > 3.5) {
    riskLevel = 'HIGH (3.6-5.0)';
  } else if (totalScore > 2.0) {
    riskLevel = 'MEDIUM (2.1-3.5)';
  }

  return {
    overallScore: totalScore,
    riskLevel,
    breakdown,
  };
};

export const formatRiskLevel = (riskLevel?: string): string => {
  if (!riskLevel) return 'Not Assessed';
  return riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1).toLowerCase();
};

export const formatRiskScore = (score?: number): string => {
  if (score === undefined || score === null) return 'N/A';
  return `${score.toFixed(1)}/10`;
};

export const formatStatus = (status: string): string => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const formatAssessmentType = (type: string): string => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const getCompletionPercentage = (
  responses: Record<string, unknown>,
  totalFields: number
): number => {
  const filledFields = Object.values(responses).filter(
    value => value !== undefined && value !== null && value !== ''
  ).length;
  return totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
};

export const getRiskColor = (
  riskLevel?: string
): 'success' | 'warning' | 'error' | 'default' => {
  switch (riskLevel?.toUpperCase()) {
    case 'LOW':
      return 'success';
    case 'MEDIUM':
      return 'warning';
    case 'HIGH':
      return 'error';
    default:
      return 'default';
  }
};

export const getStatusColor = (
  status: string
):
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning' => {
  switch (status) {
    case 'COMPLETED':
    case 'APPROVED':
      return 'success';
    case 'REQUIRES_REVIEW':
      return 'warning';
    case 'REJECTED':
      return 'error';
    case 'IN_PROGRESS':
      return 'info';
    case 'DRAFT':
      return 'default';
    default:
      return 'default';
  }
};

export const calculateOverallProgress = (
  assessment: RiskAssessment
): number => {
  const weights = {
    hasResponses: 0.4,
    hasRiskScore: 0.3,
    isComplete: 0.3,
  };

  let progress = 0;

  // Has responses
  if (assessment.responses && Object.keys(assessment.responses).length > 0) {
    progress += weights.hasResponses;
  }

  // Has risk score
  if (assessment.overallRiskScore) {
    progress += weights.hasRiskScore;
  }

  // Is complete
  if (assessment.status === 'COMPLETED' || assessment.status === 'APPROVED') {
    progress += weights.isComplete;
  }

  return Math.round(progress * 100);
};

export const validateFormFields = (
  responses: Record<string, unknown>,
  fields: FormField[]
): { isValid: boolean; missingFields: string[] } => {
  const missingFields: string[] = [];

  fields.forEach(field => {
    if (field.required) {
      const value = responses[field.key];
      if (
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        missingFields.push(field.label);
      }
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

export const validateRequiredFields = (
  responses: Record<string, unknown>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } => {
  const missingFields = requiredFields.filter(field => {
    const value = responses[field];
    return value === undefined || value === null || value === '';
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

export const getEUSupplierRequiredFields = (): string[] => [
  'companyName',
  'businessAddress',
  'contactPerson',
  'businessNature',
  'euOriginConfirmation',
];

export const getNonEUSupplierRequiredFields = (): string[] => [
  'companyName',
  'businessAddress',
  'countryOfOrigin',
  'contactPerson',
  'businessNature',
  'productionAreas',
  'deforestationRisk',
  'traceabilitySystem',
];

export const isAssessmentEditable = (assessment: RiskAssessment): boolean => {
  return assessment.status !== 'APPROVED';
};

export const canSubmitForReview = (assessment: RiskAssessment): boolean => {
  if (
    assessment.status === 'APPROVED' ||
    assessment.status === 'REQUIRES_REVIEW'
  ) {
    return false;
  }

  const requiredFields =
    assessment.type === 'EU_SUPPLIER'
      ? getEUSupplierRequiredFields()
      : getNonEUSupplierRequiredFields();

  const validation = validateRequiredFields(
    assessment.responses,
    requiredFields
  );
  return validation.isValid;
};

export const formatDateForDisplay = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTimeForDisplay = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
