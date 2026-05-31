import { defaultLocale, type Locale } from './localization';

export const localizedDocumentFields = `
  locale,
  translationGroup
`;

export function buildLocalizedSluggedDocumentFilter(documentType: string) {
  return `_type == "${documentType}" && defined(slug.current) && !(_id in path("drafts.**")) && (locale == $locale || (!defined(locale) && $locale == "${defaultLocale}"))`;
}

export function buildLocalizedSingletonDocumentFilter(documentType: string) {
  return `_type == "${documentType}" && !(_id in path("drafts.**")) && (locale == $locale || (!defined(locale) && $locale == "${defaultLocale}"))`;
}

export function normalizeLocale(locale: string | undefined): Locale {
  return locale === 'en' ? 'en' : defaultLocale;
}

