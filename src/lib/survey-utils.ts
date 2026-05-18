import type { SurveyInstance, SurveyQuestion } from '../types/survey.types';

export function normalizeSurveyQuestions(
  questions: unknown
): SurveyQuestion[] {
  if (Array.isArray(questions)) {
    return questions as SurveyQuestion[];
  }
  if (typeof questions === 'string') {
    try {
      const parsed = JSON.parse(questions) as unknown;
      return Array.isArray(parsed) ? (parsed as SurveyQuestion[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export const getStatusColor = (
  status: SurveyInstance['status']
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
      return 'success';
    case 'IN_PROGRESS':
      return 'primary';
    case 'SENT':
      return 'warning';
    case 'EXPIRED':
      return 'error';
    case 'CREATED':
      return 'info';
    default:
      return 'default';
  }
};

export const getStatusLabel = (status: SurveyInstance['status']) => {
  switch (status) {
    case 'COMPLETED':
      return 'Completed';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'SENT':
      return 'Sent';
    case 'EXPIRED':
      return 'Expired';
    case 'CREATED':
      return 'Created';
    default:
      return '---';
  }
};

export const calculateCompletionPercentage = (
  survey: SurveyInstance,
  responses: Record<string, unknown>
) => {
  const questionsParsed = normalizeSurveyQuestions(survey.template?.questions);

  if (
    !questionsParsed ||
    !Array.isArray(questionsParsed) ||
    questionsParsed.length === 0
  ) {
    return 0;
  }

  const requiredQuestions = questionsParsed.filter(
    (q: SurveyQuestion) => q.required
  );

  if (requiredQuestions.length === 0) {
    return 100;
  }

  const completedRequired = requiredQuestions.filter((q: SurveyQuestion) => {
    if (q.type === 'multi_entry') {
      const value = responses[q.id];
      if (Array.isArray(value)) {
        const minEntries = q.minEntries || 1;
        if (value.length < minEntries) return false;

        const requiredEntryFields =
          q.entryFields?.filter(ef => ef.required) || [];
        if (requiredEntryFields.length === 0) return true;

        return value.every(entry =>
          requiredEntryFields.every(
            field => entry[field.id] != null && entry[field.id] !== ''
          )
        );
      }
      return false;
    }

    return responses[q.id] != null && responses[q.id] !== '';
  });

  return Math.round(
    (completedRequired.length / requiredQuestions.length) * 100
  );
};

export const getQuestionById = (
  template: { questions: SurveyQuestion[] },
  questionId: string
): SurveyQuestion | undefined => {
  if (!template?.questions) {
    console.log('No template or questions available');
    return undefined;
  }

  let questions: SurveyQuestion[];

  if (typeof template.questions === 'string') {
    try {
      questions = JSON.parse(template.questions);
    } catch (e) {
      console.log('Failed to parse questions string:', e);
      return undefined;
    }
  } else if (Array.isArray(template.questions)) {
    questions = template.questions;
  } else {
    console.log(
      'Questions is not an array or string:',
      typeof template.questions
    );
    return undefined;
  }

  const found = questions.find(q => q.id === questionId);
  if (!found) {
    console.log(`Question with ID "${questionId}" not found in template`);
    console.log(
      'Available question IDs:',
      questions.map(q => q.id)
    );
  }

  return found;
};

export const formatResponseValue = (value: string): string => {
  if (!value) return 'No response';

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      if (parsed.length > 0 && typeof parsed[0] === 'object') {
        return parsed
          .map((entry, index) => {
            const lines = Object.entries(entry)
              .map(([key, val]) => `${key}: ${val}`)
              .join('\n');

            return `Entry #${index + 1}:\n${lines}`;
          })
          .join('\n\n');
      }

      return parsed.join(', ');
    }

    if (typeof parsed === 'boolean') {
      return parsed ? 'Yes' : 'No';
    }

    if (typeof parsed === 'object' && parsed !== null) {
      if (parsed.filename) return `File: ${parsed.filename}`;
      return JSON.stringify(parsed, null, 2);
    }

    return String(parsed);
  } catch {
    return value;
  }
};

export const getQuestionTypeDisplay = (type: string): string => {
  const typeMap: Record<string, string> = {
    text: 'Text',
    number: 'Number',
    email: 'Email',
    date: 'Date',
    select: 'Single Choice',
    multiselect: 'Multiple Choice',
    boolean: 'Yes/No',
    file: 'File Upload',
    multi_entry: 'Multiple Entries',
  };
  return typeMap[type] || type;
};

export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getTimeRemaining = (expiresAt: Date | string): string => {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();

  if (diffMs <= 0) return 'Expired';

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} days, ${hours} hours`;
  return `${hours} hours`;
};
