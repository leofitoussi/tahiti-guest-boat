import { defaultLocale, type Locale } from './localization';

export function formatReviewDate(date?: string, locale: Locale = defaultLocale) {
  if (!date) return undefined;

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return undefined;

  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'fr-FR', {
    month: 'long',
    year: 'numeric',
  }).format(parsed);
}
