import type { Locale } from './localization';

export const LANGUAGE_SUGGESTION_STORAGE_KEY = 'tgb_language_suggestion';
export const LANGUAGE_SUGGESTION_RETENTION_MONTHS = 3;

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface StoredLanguageSuggestionOptOut {
  kind: 'opt-out';
  savedAt: number;
}

interface StoredLanguageSuggestionLocale {
  kind: 'locale';
  locale: Locale;
  savedAt: number;
}

type StoredLanguageSuggestionPreference = StoredLanguageSuggestionOptOut | StoredLanguageSuggestionLocale;

export type LanguageSuggestionPreference =
  | Pick<StoredLanguageSuggestionOptOut, 'kind'>
  | Pick<StoredLanguageSuggestionLocale, 'kind' | 'locale'>;

interface ResolveLanguageSuggestionOptions {
  currentLocale: Locale;
  primaryBrowserLanguage: string | undefined;
  alternatePaths: Partial<Record<Locale, string>>;
  preference?: LanguageSuggestionPreference | null;
}

export function resolveLanguageSuggestion({
  currentLocale,
  primaryBrowserLanguage,
  alternatePaths,
  preference,
}: ResolveLanguageSuggestionOptions) {
  if (preference?.kind === 'opt-out') return null;

  const targetLocale: Locale = preference?.kind === 'locale'
    ? preference.locale
    : primaryBrowserLanguage?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  const href = alternatePaths[targetLocale];

  if (targetLocale === currentLocale || !href) return null;

  return { targetLocale, href };
}

export function saveLanguageSuggestionOptOut(storage: Pick<StorageLike, 'setItem'>, savedAt: number) {
  const preference: StoredLanguageSuggestionPreference = { kind: 'opt-out', savedAt };
  storage.setItem(LANGUAGE_SUGGESTION_STORAGE_KEY, JSON.stringify(preference));
}

export function saveLanguageSuggestionLocale(storage: Pick<StorageLike, 'setItem'>, locale: Locale, savedAt: number) {
  const preference: StoredLanguageSuggestionPreference = { kind: 'locale', locale, savedAt };
  storage.setItem(LANGUAGE_SUGGESTION_STORAGE_KEY, JSON.stringify(preference));
}

export function readLanguageSuggestionPreference(
  storage: Pick<StorageLike, 'getItem'>,
  now: number,
): LanguageSuggestionPreference | null {
  try {
    const rawPreference = storage.getItem(LANGUAGE_SUGGESTION_STORAGE_KEY);
    const preference = rawPreference
      ? JSON.parse(rawPreference) as { kind?: unknown; locale?: unknown; savedAt?: unknown }
      : null;
    if (
      !preference ||
      typeof preference.savedAt !== 'number' ||
      (preference.kind !== 'opt-out' && preference.kind !== 'locale') ||
      (preference.kind === 'locale' && preference.locale !== 'fr' && preference.locale !== 'en')
    ) return null;

    const expiresAt = new Date(preference.savedAt);
    expiresAt.setMonth(expiresAt.getMonth() + LANGUAGE_SUGGESTION_RETENTION_MONTHS);
    if (now >= expiresAt.getTime()) return null;

    if (preference.kind === 'locale') {
      const locale = preference.locale;
      if (locale !== 'fr' && locale !== 'en') return null;

      return { kind: 'locale', locale };
    }

    return { kind: 'opt-out' };
  } catch {
    return null;
  }
}
