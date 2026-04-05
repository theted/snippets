import type { ChangeEvent } from 'react';
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from '../config';
import { SnippetFormSchema, type SnippetFormValues } from '../types';
import { getLanguageLabel } from '../utils/language';

export type InputChangeEvent = ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

export type FormField = keyof SnippetFormValues;
export type SnippetFormErrors = Partial<Record<FormField, string>>;

export const languageOptions = AVAILABLE_LANGUAGES.map((language) => ({
  label: getLanguageLabel(language),
  value: language,
}));

export const EMPTY_FORM_STATE: SnippetFormValues = {
  title: '',
  content: '',
  description: '',
  language: DEFAULT_LANGUAGE,
};

export const snippetFormClasses = {
  grid: 'flex flex-col gap-8 md:grid md:grid-cols-2 md:gap-10 lg:gap-14',
  codeCol: 'flex flex-col gap-4 md:gap-5 md:h-full',
  metaCol: 'flex flex-col gap-7 md:justify-between md:self-start',
  label:
    'text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)] text-bevel',
  header: 'pb-1',
  kicker:
    'text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[var(--color-text-subtle)] text-bevel',
  title:
    'mt-2 font-[var(--font-display)] text-3xl font-[200] tracking-[-0.055em] text-[var(--color-text)] md:text-4xl [text-shadow:0_1px_0_oklch(1_0_0_/_0.14),0_2px_12px_oklch(0_0_0_/_0.28)]',
  intro: 'mt-3 max-w-sm text-sm leading-7 text-[var(--color-text-muted)]',
  fieldGroup: 'flex flex-col gap-2.5',
  actions: 'flex flex-wrap gap-3 md:pt-1',
} as const;

export const getFormErrors = (values: SnippetFormValues): SnippetFormErrors => {
  const result = SnippetFormSchema.safeParse(values);

  if (result.success) {
    return {};
  }

  return Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message]));
};

export const getVisibleFormErrors = (
  errors: SnippetFormErrors,
  touched: Partial<Record<FormField, boolean>>,
  submitAttempted: boolean,
): SnippetFormErrors =>
  Object.fromEntries(
    Object.entries(errors).filter(([field]) => submitAttempted || touched[field as FormField]),
  );
