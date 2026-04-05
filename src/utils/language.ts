import { LANGUAGE_MAP } from '../config';

const formatFallbackLanguageName = (language: string) =>
  language
    .trim()
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => (
      segment.length <= 3
        ? segment.toUpperCase()
        : `${segment[0].toUpperCase()}${segment.slice(1)}`
    ))
    .join(' ');

export const getLanguageLabel = (language?: string | null) => {
  const normalizedLanguage = language?.trim().toLowerCase() || 'plaintext';

  return LANGUAGE_MAP[normalizedLanguage as keyof typeof LANGUAGE_MAP]
    ?? formatFallbackLanguageName(language ?? 'plaintext');
};
