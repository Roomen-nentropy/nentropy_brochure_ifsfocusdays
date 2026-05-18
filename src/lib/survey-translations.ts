import type {
  SurveyQuestion,
  SurveyCategoryGroup,
} from '../types/survey.types';

export interface SurveyTranslations {
  categoryGroups: {
    [groupId: string]: {
      title: string;
      description?: string;
    };
  };
  questions: {
    [questionId: string]: {
      question: string;
      description?: string;
      addButtonLabel?: string;
      removeButtonLabel?: string;
      entryFields?: {
        [fieldId: string]: {
          question: string;
          description?: string;
        };
      };
    };
  };
}

export interface TemplateTranslations {
  [languageCode: string]: SurveyTranslations;
}

/**
 * Gets the translated text for a question
 */
export function getTranslatedQuestion(
  question: SurveyQuestion,
  translations: TemplateTranslations | null,
  language: string
): SurveyQuestion {
  if (!translations || !translations[language]) {
    return question; // Return original if no translations available
  }

  const questionTranslation = translations[language].questions[question.id];

  if (!questionTranslation) {
    // Fallback to English if available
    const englishTranslation = translations['en']?.questions[question.id];
    if (englishTranslation) {
      return {
        ...question,
        question: englishTranslation.question,
        description: englishTranslation.description ?? question.description,
      };
    }
    return question;
  }

  // Translate entry fields for multi_entry questions
  let translatedEntryFields = question.entryFields;
  if (question.entryFields && questionTranslation.entryFields) {
    translatedEntryFields = question.entryFields.map(field => {
      const fieldTranslation = questionTranslation.entryFields?.[field.id];
      if (fieldTranslation) {
        return { ...field, ...fieldTranslation };
      }
      // Fallback to English for entry field
      const englishFieldTranslation =
        translations['en']?.questions[question.id]?.entryFields?.[field.id];
      if (englishFieldTranslation) {
        return { ...field, ...englishFieldTranslation };
      }
      return field;
    });
  }

  return {
    ...question,
    question: questionTranslation.question,
    description: questionTranslation.description ?? question.description,
    addButtonLabel:
      questionTranslation.addButtonLabel ?? question.addButtonLabel,
    removeButtonLabel:
      questionTranslation.removeButtonLabel ?? question.removeButtonLabel,
    entryFields: translatedEntryFields,
  };
}

/**
 * Gets the translated text for a category group
 */
export function getTranslatedCategoryGroup(
  group: SurveyCategoryGroup,
  translations: TemplateTranslations | null,
  language: string
): SurveyCategoryGroup {
  if (!translations || !translations[language]) {
    return group; // Return original if no translations available
  }

  const groupTranslation = translations[language].categoryGroups[group.id];

  if (!groupTranslation) {
    // Fallback to English if available
    const englishTranslation = translations['en']?.categoryGroups[group.id];
    if (englishTranslation) {
      return {
        ...group,
        title: englishTranslation.title,
        description: englishTranslation.description ?? group.description,
      };
    }
    return group;
  }

  return {
    ...group,
    title: groupTranslation.title,
    description: groupTranslation.description ?? group.description,
  };
}

/**
 * Translates all questions in an array
 */
export function translateQuestions(
  questions: SurveyQuestion[],
  translations: TemplateTranslations | null,
  language: string
): SurveyQuestion[] {
  return questions.map(question =>
    getTranslatedQuestion(question, translations, language)
  );
}

/**
 * Translates all category groups in an array
 */
export function translateCategoryGroups(
  groups: SurveyCategoryGroup[],
  translations: TemplateTranslations | null,
  language: string
): SurveyCategoryGroup[] {
  return groups.map(group =>
    getTranslatedCategoryGroup(group, translations, language)
  );
}
