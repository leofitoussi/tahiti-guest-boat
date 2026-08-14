import type { Locale } from './localization';

export interface LegalTranslationVersion {
  locale: Locale;
  slug: string;
  isPublished?: boolean;
}

export function buildLegalPath(slug: string, locale: Locale) {
  return locale === 'en' ? `/en/${slug}/` : `/${slug}/`;
}

export function buildLegalAlternatePaths(
  versions: LegalTranslationVersion[],
  currentLocale: Locale,
): Partial<Record<Locale, string>> {
  return versions.reduce<Partial<Record<Locale, string>>>((paths, version) => {
    if (version.locale !== currentLocale && version.isPublished !== false && version.slug) {
      paths[version.locale] = buildLegalPath(version.slug, version.locale);
    }

    return paths;
  }, {});
}
