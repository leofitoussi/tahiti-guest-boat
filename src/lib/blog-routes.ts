import type { Locale } from './localization';

export interface BlogTranslationVersion {
  language: Locale;
  slug: string;
  isPublished?: boolean;
}

export function buildBlogPath(slug: string, locale: Locale) {
  return locale === 'en' ? `/en/blog/${slug}/` : `/blog/${slug}/`;
}

export function buildBlogAlternatePaths(
  versions: BlogTranslationVersion[],
  currentLocale: Locale,
): Partial<Record<Locale, string>> {
  return versions.reduce<Partial<Record<Locale, string>>>((paths, version) => {
    if (version.language !== currentLocale && version.isPublished !== false && version.slug) {
      paths[version.language] = buildBlogPath(version.slug, version.language);
    }

    return paths;
  }, {});
}
