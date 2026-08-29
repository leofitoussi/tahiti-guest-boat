import type { Locale } from './localization';

export interface LegalTranslationVersion {
  language: Locale;
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
    if (version.language !== currentLocale && version.isPublished !== false && version.slug) {
      paths[version.language] = buildLegalPath(version.slug, version.language);
    }

    return paths;
  }, {});
}
