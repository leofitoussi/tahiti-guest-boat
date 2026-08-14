import { defaultLocale, type Locale } from './localization';

export interface LocalizedDocumentLike {
  language?: Locale | null;
  locale?: Locale | null;
}

export const localizedDocumentFields = `
  language,
  locale,
  translationGroup
`;

const localizedLanguageFilter = `(language == $locale || (!defined(language) && locale == $locale) || (!defined(language) && !defined(locale) && $locale == "${defaultLocale}"))`;

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
  return (document.language ?? document.locale ?? defaultLocale) === locale;
}
