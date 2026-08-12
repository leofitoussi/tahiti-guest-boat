export const locales = ['fr', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';

export function buildOpenGraphLocale(locale: Locale) {
  return locale === 'en' ? 'en_US' : 'fr_FR';
}

export interface TranslationLink {
  locale: Locale;
  path: string;
}

export interface TranslationPair {
  group: string;
  source: TranslationLink;
  translated?: TranslationLink;
}

export interface LocalizedMetadata {
  lang: Locale;
  canonical: string;
  alternates: TranslationLink[];
}

function normalizePath(path: string) {
  if (!path) {
    return '/';
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;
  return normalized.replace(/\/{2,}/g, '/');
}

function isExternalHref(href: string) {
  return /^(https?:|mailto:|tel:|#)/i.test(href);
}

export function localizePath(path: string, locale: Locale = defaultLocale) {
  const normalized = normalizePath(path);

  if (locale === 'fr') {
    return normalized;
  }

  if (normalized === '/') {
    return '/en';
  }

  if (normalized.startsWith('/en')) {
    return normalized;
  }

  return `/en${normalized}`;
}

export function localizeHref(href: string, locale: Locale = defaultLocale) {
  if (isExternalHref(href)) {
    return href;
  }

  return localizePath(href, locale);
}

export function stripLocalePrefix(path: string) {
  const normalized = normalizePath(path);

  if (normalized === '/en') {
    return { locale: 'en' as const, path: '/' };
  }

  if (normalized.startsWith('/en/')) {
    return { locale: 'en' as const, path: normalized.slice(3) };
  }

  return { locale: 'fr' as const, path: normalized };
}

export function buildLocalizedMetadata(
  path: string,
  options: {
    locale?: Locale;
    siteUrl?: string;
    alternatePaths?: Partial<Record<Locale, string>>;
  } = {}
): LocalizedMetadata {
  const locale = options.locale ?? defaultLocale;
  const normalizedPath = normalizePath(path);
  const canonicalPath = localizePath(normalizedPath, locale);
  const canonical = options.siteUrl ? new URL(canonicalPath, options.siteUrl).toString() : canonicalPath;
  const alternates = Object.entries({
    [locale]: canonicalPath,
    ...options.alternatePaths,
  })
    .filter(([, alternatePath]) => Boolean(alternatePath))
    .map(([alternateLocale, alternatePath]) => ({
      locale: alternateLocale as Locale,
      path: options.siteUrl ? new URL(alternatePath as string, options.siteUrl).toString() : (alternatePath as string),
    }));

  return {
    lang: locale,
    canonical,
    alternates,
  };
}
