import type { Locale } from './localization';

export interface CruiseTranslationVersion {
  language: Locale;
  slug: string;
  isPublished?: boolean;
}

export function buildCruisePath(slug: string, locale: Locale) {
  return locale === 'en' ? `/en/cruises/${slug}/` : `/nos-croisieres/${slug}/`;
}

export function buildCruiseAlternatePaths(
  versions: CruiseTranslationVersion[],
  currentLocale: Locale,
): Partial<Record<Locale, string>> {
  return versions.reduce<Partial<Record<Locale, string>>>((paths, version) => {
    if (version.language !== currentLocale && version.isPublished !== false && version.slug) {
      paths[version.language] = buildCruisePath(version.slug, version.language);
    }

    return paths;
  }, {});
}
