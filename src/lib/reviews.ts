import { defaultLocale, type Locale } from './localization';
import type { Review } from './cruises';

export interface LocalizedReviewContent {
  displayBody?: string;
  originalBody?: string;
  canToggle: boolean;
}

export function getLocalizedReviewContent(review: Review, locale: Locale = defaultLocale): LocalizedReviewContent {
  const translatedBody = locale === 'en' ? review.bodyEn : review.bodyFr;
  const originalBody = review.originalLanguage === 'en' ? review.bodyEn : review.bodyFr;
  const legacyBody = review.body;
  const hasCompleteBilingualContent = Boolean(review.bodyFr && review.bodyEn && review.originalLanguage);
  const canToggle = hasCompleteBilingualContent && review.originalLanguage !== locale;

  return {
    displayBody: translatedBody ?? originalBody ?? legacyBody,
    originalBody: canToggle ? originalBody : undefined,
    canToggle,
  };
}

export function formatReviewDate(date?: string, locale: Locale = defaultLocale) {
  if (!date) return undefined;

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return undefined;

  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'fr-FR', {
    month: 'long',
    year: 'numeric',
  }).format(parsed);
}
