import { describe, expect, it } from 'vitest';
import {
  getPrimaryBrowserLanguage,
  readLanguageSuggestionPreference,
  resolveLanguageSuggestion,
  saveLanguageSuggestionLocale,
  saveLanguageSuggestionOptOut,
} from '../src/lib/language-suggestion';

describe('language suggestion', () => {
  it('uses the browser primary language over an inconsistently ordered language list', () => {
    expect(getPrimaryBrowserLanguage('fr-FR', ['en-US', 'fr-FR'])).toBe('fr-FR');
  });

  it('falls back to the first browser language when the primary value is unavailable', () => {
    expect(getPrimaryBrowserLanguage(undefined, ['fr-CA', 'en-US'])).toBe('fr-CA');
  });

  it('offers the directly published English version to an English browser on a French version', () => {
    expect(
      resolveLanguageSuggestion({
        currentLocale: 'fr',
        primaryBrowserLanguage: 'en-GB',
        alternatePaths: { en: '/en/cruises/lagon/' },
      }),
    ).toEqual({ targetLocale: 'en', href: '/en/cruises/lagon/' });
  });

  it('keeps an explicit global opt-out for three calendar months', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    const savedAt = Date.UTC(2026, 0, 31);

    saveLanguageSuggestionOptOut(storage, savedAt);

    expect(readLanguageSuggestionPreference(storage, savedAt + 1)).toEqual({ kind: 'opt-out' });
  });

  it('expires an opt-out at the three-calendar-month boundary', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    const savedAt = Date.UTC(2026, 0, 31);
    const expiresAt = new Date(savedAt);
    expiresAt.setMonth(expiresAt.getMonth() + 3);

    saveLanguageSuggestionOptOut(storage, savedAt);

    expect(readLanguageSuggestionPreference(storage, expiresAt.getTime())).toBeNull();
  });

  it('respects a French version preference over an English browser language', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    saveLanguageSuggestionLocale(storage, 'fr', 1_000_000);
    const preference = readLanguageSuggestionPreference(storage, 1_000_001);

    expect(
      resolveLanguageSuggestion({
        currentLocale: 'fr',
        primaryBrowserLanguage: 'en',
        alternatePaths: { en: '/en/' },
        preference,
      }),
    ).toBeNull();
  });

  it('uses English as the fallback for a non-French browser only with a direct alternate', () => {
    expect(
      resolveLanguageSuggestion({
        currentLocale: 'fr',
        primaryBrowserLanguage: 'pt-BR',
        alternatePaths: { en: '/en/blog/lagoon-life/' },
      }),
    ).toEqual({ targetLocale: 'en', href: '/en/blog/lagoon-life/' });

    expect(
      resolveLanguageSuggestion({
        currentLocale: 'fr',
        primaryBrowserLanguage: 'pt-BR',
        alternatePaths: {},
      }),
    ).toBeNull();
  });
});
