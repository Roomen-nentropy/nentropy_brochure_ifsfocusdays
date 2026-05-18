import type { SurveyQuestion } from '../types/survey.types';
import type { ChecklistDefinition } from './checklistFormTypes';

/**
 * Client-side mirror of server `checklist-questionnaire.engine.ts`.
 */
export function resolveChecklistQuestionsForForm(
  snapshot: { questions?: unknown } | null | undefined,
  _ctx?: Record<string, unknown>
): SurveyQuestion[] {
  const q = snapshot?.questions;
  if (Array.isArray(q)) return q as SurveyQuestion[];
  return [];
}

export function getChecklistDefinition(
  snapshot: { questions?: unknown } | null | undefined
): ChecklistDefinition | null {
  const q = snapshot?.questions;
  if (q && typeof q === 'object' && !Array.isArray(q) && 'uiMode' in q) {
    return q as ChecklistDefinition;
  }
  return null;
}
