import type { Locale } from './localization';

export interface CruiseTranslationVersion {
  locale: Locale;
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
    if (version.locale !== currentLocale && version.isPublished !== false && version.slug) {
      paths[version.locale] = buildCruisePath(version.slug, version.locale);
    }

    return paths;
  }, {});
}
