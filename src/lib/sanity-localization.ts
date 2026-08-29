import { defaultLocale, type Locale } from './localization';

export interface LocalizedDocumentLike {
  language?: Locale | null;
}

export const localizedDocumentFields = `language`;

const localizedLanguageFilter = `language == $locale`;

export function buildLocalizedSluggedDocumentFilter(documentType: string) {
  return `_type == "${documentType}" && defined(slug.current) && !(_id in path("drafts.**")) && ${localizedLanguageFilter}`;
}

export function buildLocalizedSingletonDocumentFilter(documentType: string) {
  return `_type == "${documentType}" && !(_id in path("drafts.**")) && ${localizedLanguageFilter}`;
}

export function normalizeLocale(locale: string | undefined): Locale {
  return locale === 'en' ? 'en' : defaultLocale;
}

export function isDocumentInLocale(document: LocalizedDocumentLike, locale: Locale) {
  return document.language === locale;
}
